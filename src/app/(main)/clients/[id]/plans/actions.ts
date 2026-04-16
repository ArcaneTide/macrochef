"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma, MealPlanStatus, MealSlot } from "@prisma/client";
import { calcRecipeMacrosPerServing, type MacroTotals } from "@/lib/macros";

export type ActionResult = { success: true; id: string } | { success: false; error: string };
export type DuplicateResult = { success: true; id: string; clientId: string } | { success: false; error: string };

export type AssignmentResult = {
  id: string;
  dayIndex: number;
  mealSlot: string;
  servings: number;
  recipe: { id: string; title: string; macrosPerServing: MacroTotals };
};

type AssignResult =
  | { success: true; assignment: AssignmentResult }
  | { success: false; error: string };

async function getAuthedCoachId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

async function assertPlanOwnership(planId: string, coachId: string): Promise<string> {
  const plan = await db.mealPlan.findUnique({
    where: { id: planId },
    select: { clientId: true, client: { select: { coachId: true } } },
  });
  if (!plan || plan.client.coachId !== coachId) throw new Error("Plan not found");
  return plan.clientId;
}

// ─── Schemas ──────────────────────────────────────────────

const createPlanSchema = z.object({
  title: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  activeSlots: z
    .array(z.enum(["breakfast", "lunch", "dinner", "snack1", "snack2"]))
    .min(1)
    .optional(),
  slotDistribution: z.record(z.string(), z.number()).nullable().optional(),
});

const assignSchema = z.object({
  dayIndex: z.number().int().min(0).max(6),
  mealSlot: z.enum(["breakfast", "lunch", "dinner", "snack1", "snack2"]),
  recipeId: z.string().uuid(),
  servings: z.number().positive().multipleOf(0.25),
});

// ─── Actions ──────────────────────────────────────────────

export async function createMealPlan(
  clientId: string,
  data: z.infer<typeof createPlanSchema>
): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { coachId: true },
    });
    if (!client || client.coachId !== coachId) throw new Error("Client not found");
    const parsed = createPlanSchema.parse(data);

    const startDate = new Date(parsed.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const plan = await db.mealPlan.create({
      data: {
        clientId,
        title: parsed.title || null,
        status: "draft",
        startDate,
        endDate,
        activeSlots: (parsed.activeSlots ?? ["breakfast", "lunch", "dinner", "snack1"]) as Prisma.InputJsonValue,
        ...(parsed.slotDistribution != null ? { slotDistribution: parsed.slotDistribution as Prisma.InputJsonValue } : {}),
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true, id: plan.id };
  } catch (err) {
    console.error("createMealPlan:", err);
    return { success: false, error: "Failed to create plan" };
  }
}

export async function updateMealPlanStatus(
  planId: string,
  status: "draft" | "active" | "archived"
): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    const clientId = await assertPlanOwnership(planId, coachId);

    await db.mealPlan.update({
      where: { id: planId },
      data: { status: status as MealPlanStatus },
    });

    revalidatePath(`/clients/${clientId}/plans/${planId}`);
    revalidatePath(`/clients/${clientId}`);
    return { success: true, id: planId };
  } catch (err) {
    console.error("updateMealPlanStatus:", err);
    return { success: false, error: "Failed to update plan status" };
  }
}

export async function assignMeal(
  planId: string,
  data: z.infer<typeof assignSchema>
): Promise<AssignResult> {
  try {
    const coachId = await getAuthedCoachId();
    const clientId = await assertPlanOwnership(planId, coachId);
    const parsed = assignSchema.parse(data);

    const assignment = await db.mealAssignment.upsert({
      where: {
        mealPlanId_dayIndex_mealSlot: {
          mealPlanId: planId,
          dayIndex: parsed.dayIndex,
          mealSlot: parsed.mealSlot as MealSlot,
        },
      },
      create: {
        mealPlanId: planId,
        recipeId: parsed.recipeId,
        dayIndex: parsed.dayIndex,
        mealSlot: parsed.mealSlot as MealSlot,
        servings: parsed.servings,
      },
      update: {
        recipeId: parsed.recipeId,
        servings: parsed.servings,
      },
    });

    // Fetch recipe with ingredients for macro calculation
    const recipe = await db.recipe.findUniqueOrThrow({
      where: { id: parsed.recipeId },
      include: { ingredients: { include: { ingredient: true } } },
    });

    const macrosPerServing = calcRecipeMacrosPerServing(
      recipe.ingredients.map((ri) => ({
        ingredient: ri.ingredient,
        quantityGrams: ri.quantityGrams,
      })),
      recipe.servings
    );

    revalidatePath(`/clients/${clientId}/plans/${planId}`);
    return {
      success: true,
      assignment: {
        id: assignment.id,
        dayIndex: assignment.dayIndex,
        mealSlot: assignment.mealSlot as string,
        servings: assignment.servings,
        recipe: { id: recipe.id, title: recipe.title, macrosPerServing },
      },
    };
  } catch (err) {
    console.error("assignMeal:", err);
    return { success: false, error: "Failed to assign meal" };
  }
}

export async function duplicatePlan(
  sourcePlanId: string,
  targetClientId: string,
  startDate: string,
  title?: string
): Promise<DuplicateResult> {
  try {
    const coachId = await getAuthedCoachId();

    // Verify source plan ownership and fetch assignments
    const source = await db.mealPlan.findUnique({
      where: { id: sourcePlanId },
      include: {
        client: { select: { coachId: true } },
        mealAssignments: {
          select: {
            dayIndex: true,
            mealSlot: true,
            recipeId: true,
            servings: true,
            ingredientOverrides: true,
          },
        },
      },
    });
    if (!source || source.client.coachId !== coachId) throw new Error("Plan not found");

    // Verify target client belongs to same coach
    const targetClient = await db.client.findUnique({
      where: { id: targetClientId },
      select: { coachId: true },
    });
    if (!targetClient || targetClient.coachId !== coachId) throw new Error("Client not found");

    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);

    const newPlan = await db.mealPlan.create({
      data: {
        clientId: targetClientId,
        title: title?.trim() || null,
        status: "draft",
        startDate: start,
        endDate: end,
        activeSlots: (source.activeSlots ?? ["breakfast", "lunch", "dinner", "snack1"]) as Prisma.InputJsonValue,
        ...(source.slotDistribution != null ? { slotDistribution: source.slotDistribution as Prisma.InputJsonValue } : {}),
        mealAssignments: {
          create: source.mealAssignments.map((a) => ({
            dayIndex: a.dayIndex,
            mealSlot: a.mealSlot,
            recipeId: a.recipeId,
            servings: a.servings,
            ingredientOverrides: a.ingredientOverrides ?? undefined,
          })),
        },
      },
    });

    revalidatePath(`/clients/${targetClientId}`);
    return { success: true, id: newPlan.id, clientId: targetClientId };
  } catch (err) {
    console.error("duplicatePlan:", err);
    return { success: false, error: "Failed to duplicate plan" };
  }
}

export async function updatePlanTitle(
  planId: string,
  title: string
): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    const clientId = await assertPlanOwnership(planId, coachId);

    await db.mealPlan.update({
      where: { id: planId },
      data: { title: title.trim() || null },
    });

    revalidatePath(`/clients/${clientId}/plans/${planId}`);
    return { success: true, id: planId };
  } catch (err) {
    console.error("updatePlanTitle:", err);
    return { success: false, error: "Failed to update plan title" };
  }
}

export async function updatePlanNotes(
  planId: string,
  notes: string
): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    const clientId = await assertPlanOwnership(planId, coachId);

    await db.mealPlan.update({
      where: { id: planId },
      data: { notes: notes.trim() || null },
    });

    revalidatePath(`/clients/${clientId}/plans/${planId}`);
    return { success: true, id: planId };
  } catch (err) {
    console.error("updatePlanNotes:", err);
    return { success: false, error: "Failed to update plan notes" };
  }
}

export async function removeMeal(
  planId: string,
  assignmentId: string
): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    const clientId = await assertPlanOwnership(planId, coachId);

    await db.mealAssignment.delete({ where: { id: assignmentId } });

    revalidatePath(`/clients/${clientId}/plans/${planId}`);
    return { success: true, id: assignmentId };
  } catch (err) {
    console.error("removeMeal:", err);
    return { success: false, error: "Failed to remove meal" };
  }
}

type UpdateServingsResult =
  | { success: true; servings: number; macrosPerServing: MacroTotals }
  | { success: false; error: string };

export async function updateMealServings(
  planId: string,
  assignmentId: string,
  servings: number
): Promise<UpdateServingsResult> {
  try {
    const coachId = await getAuthedCoachId();
    const clientId = await assertPlanOwnership(planId, coachId);

    const assignment = await db.mealAssignment.update({
      where: { id: assignmentId },
      data: { servings },
      include: {
        recipe: {
          include: { ingredients: { include: { ingredient: true } } },
        },
      },
    });

    const macrosPerServing = calcRecipeMacrosPerServing(
      assignment.recipe.ingredients.map((ri) => ({
        ingredient: ri.ingredient,
        quantityGrams: ri.quantityGrams,
      })),
      assignment.recipe.servings
    );

    revalidatePath(`/clients/${clientId}/plans/${planId}`);
    return { success: true, servings, macrosPerServing };
  } catch (err) {
    console.error("updateMealServings:", err);
    return { success: false, error: "Failed to update servings" };
  }
}
