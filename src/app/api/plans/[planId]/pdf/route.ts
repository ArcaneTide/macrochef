import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import React, { type JSXElementConstructor, type ReactElement } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calcIngredientMacros, type MacroTotals } from "@/lib/macros";
import {
  MealPlanPdfDocument,
  type PdfDay,
  type PdfMealSlot,
} from "@/lib/pdf/meal-plan-pdf";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOT_ORDER = ["breakfast", "lunch", "dinner", "snack1", "snack2"];

function zeroMacros(): MacroTotals {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

function addMacros(a: MacroTotals, b: MacroTotals): MacroTotals {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

function scaleMacros(m: MacroTotals, factor: number): MacroTotals {
  return {
    calories: m.calories * factor,
    protein: m.protein * factor,
    carbs: m.carbs * factor,
    fat: m.fat * factor,
  };
}

function avgMacros(totals: MacroTotals[]): MacroTotals {
  if (totals.length === 0) return zeroMacros();
  const sum = totals.reduce(addMacros, zeroMacros());
  return scaleMacros(sum, 1 / totals.length);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const plan = await db.mealPlan.findUnique({
    where: { id: planId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          coachId: true,
          targetProfiles: {
            where: { isActive: true },
            take: 1,
          },
        },
      },
      mealAssignments: {
        include: {
          recipe: {
            include: {
              ingredients: {
                include: { ingredient: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
        orderBy: [{ dayIndex: "asc" }, { mealSlot: "asc" }],
      },
    },
  });

  if (!plan || plan.client.coachId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const activeProfile = plan.client.targetProfiles[0] ?? null;

  // Group assignments by dayIndex
  const byDay = new Map<number, typeof plan.mealAssignments>();
  for (const a of plan.mealAssignments) {
    const arr = byDay.get(a.dayIndex) ?? [];
    arr.push(a);
    byDay.set(a.dayIndex, arr);
  }

  const startDate = plan.startDate;
  const days: PdfDay[] = [];
  const activeDayTotals: MacroTotals[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const assignments = byDay.get(i) ?? [];
    if (assignments.length === 0) continue; // skip empty days

    const slots: PdfMealSlot[] = [];
    let dayTotal = zeroMacros();

    // Sort slots in canonical order
    const sorted = [...assignments].sort(
      (a, b) => SLOT_ORDER.indexOf(a.mealSlot) - SLOT_ORDER.indexOf(b.mealSlot)
    );

    for (const a of sorted) {
      // Compute per-serving macros from ingredients
      let perServing = zeroMacros();
      const recipeServings = a.recipe.servings;

      for (const ri of a.recipe.ingredients) {
        const m = calcIngredientMacros(ri.ingredient, ri.quantityGrams);
        perServing = addMacros(perServing, m);
      }

      perServing = scaleMacros(perServing, 1 / recipeServings);
      const slotMacros = scaleMacros(perServing, a.servings);
      dayTotal = addMacros(dayTotal, slotMacros);

      slots.push({
        slot: a.mealSlot as string,
        recipeTitle: a.recipe.title,
        servings: a.servings,
        ingredients: a.recipe.ingredients.map((ri) => ({
          name: ri.ingredient.name,
          quantityGrams: ri.quantityGrams / recipeServings, // per-serving qty
        })),
        macros: {
          calories: Math.round(slotMacros.calories),
          protein: Math.round(slotMacros.protein * 10) / 10,
          carbs: Math.round(slotMacros.carbs * 10) / 10,
          fat: Math.round(slotMacros.fat * 10) / 10,
        },
        instructions: a.recipe.instructions ?? null,
      });
    }

    activeDayTotals.push(dayTotal);

    days.push({
      label: DAY_NAMES[i],
      date: dateLabel,
      slots,
      total: {
        calories: Math.round(dayTotal.calories),
        protein: Math.round(dayTotal.protein * 10) / 10,
        carbs: Math.round(dayTotal.carbs * 10) / 10,
        fat: Math.round(dayTotal.fat * 10) / 10,
      },
    });
  }

  const rawAvg = avgMacros(activeDayTotals);
  const weeklyAvg: MacroTotals = {
    calories: Math.round(rawAvg.calories),
    protein: Math.round(rawAvg.protein * 10) / 10,
    carbs: Math.round(rawAvg.carbs * 10) / 10,
    fat: Math.round(rawAvg.fat * 10) / 10,
  };

  const startLabel = plan.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = plan.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const element = React.createElement(MealPlanPdfDocument, {
    planTitle: plan.title ?? "Meal Plan",
    clientName: plan.client.name,
    dateRange: `${startLabel} – ${endLabel}`,
    days,
    target: activeProfile
      ? {
          calorieTarget: activeProfile.calorieTarget,
          proteinTarget: activeProfile.proteinTarget,
          carbsTarget: activeProfile.carbsTarget,
          fatTarget: activeProfile.fatTarget,
          label: activeProfile.label ?? null,
        }
      : null,
    weeklyAvg,
    planNotes: plan.notes ?? null,
  }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>;

  const pdfBuffer = await renderToBuffer(element);
  const pdfBytes = new Uint8Array(pdfBuffer);

  const filename = `meal-plan-${plan.client.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
