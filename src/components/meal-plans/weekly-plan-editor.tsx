"use client";

import { useState, useTransition, useCallback } from "react";
import { Plus, X, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type MacroTotals, calcFitScore } from "@/lib/macros";
import { computeSlotBudgets, type SlotBudgets } from "@/lib/slot-budget";
import { removeMeal } from "@/app/(main)/clients/[id]/plans/actions";
import {
  AssignRecipeModal,
  type RecipeOption,
} from "@/components/meal-plans/assign-recipe-modal";
import type { AssignmentResult } from "@/app/(main)/clients/[id]/plans/actions";
import { t, type Lang } from "@/lib/translations";

const DAYS_COUNT = 7;
const ALL_SLOTS = ["breakfast", "lunch", "dinner", "snack1", "snack2"] as const;

type CellKey = `${number}:${string}`;

type AssignmentCell = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  servings: number;
  macros: MacroTotals; // already × servings
};

function cellKey(dayIndex: number, mealSlot: string): CellKey {
  return `${dayIndex}:${mealSlot}`;
}

function sumMacros(cells: AssignmentCell[]): MacroTotals {
  return cells.reduce(
    (acc, c) => ({
      calories: acc.calories + c.macros.calories,
      protein: acc.protein + c.macros.protein,
      carbs: acc.carbs + c.macros.carbs,
      fat: acc.fat + c.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

type DailyTarget = {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
};

function DailyFitCell({
  actual,
  target,
  lang,
}: {
  actual: MacroTotals;
  target: DailyTarget | null;
  lang: Lang;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!target || actual.calories === 0) {
    return (
      <p className="text-sm tabular-nums font-data text-slate-400 dark:text-[#6A6460]">
        — kcal
      </p>
    );
  }

  const budget: MacroTotals = {
    calories: target.calorieTarget,
    protein: target.proteinTarget,
    carbs: target.carbsTarget,
    fat: target.fatTarget,
  };
  const fitPct = calcFitScore(actual, budget);
  const barColor =
    fitPct >= 90
      ? "bg-[#5A6B4F]"
      : fitPct >= 80
      ? "bg-[var(--color-clay)]"
      : "bg-red-400";
  const textColor =
    fitPct >= 90
      ? "text-[#5A6B4F]"
      : fitPct >= 80
      ? "text-[var(--color-clay)]"
      : "text-red-500";

  return (
    <div>
      <p className="text-sm font-semibold tabular-nums font-data text-slate-800 dark:text-[#F5F1EB]">
        {Math.round(actual.calories)} kcal
      </p>
      <p className="text-[10px] text-slate-400 dark:text-[#6A6460] font-data tabular-nums">
        {t("of", lang)} {target.calorieTarget} kcal
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full mt-1.5 text-left"
      >
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-2 rounded-full bg-[#E8E0D4] dark:bg-[#3A3A3A] overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", barColor)}
              style={{ width: `${fitPct}%` }}
            />
          </div>
          <span className={cn("text-[10px] tabular-nums font-data", textColor)}>
            {fitPct}%
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-slate-400 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
        {expanded && (
          <div className="mt-1.5 space-y-1">
            {(
              [
                { label: "P", actual: actual.protein, target: target.proteinTarget, color: "bg-[#5A6B4F]" },
                { label: "C", actual: actual.carbs,   target: target.carbsTarget,   color: "bg-[var(--color-clay)]" },
                { label: "F", actual: actual.fat,     target: target.fatTarget,     color: "bg-[var(--color-terracotta)]" },
              ] as Array<{ label: string; actual: number; target: number; color: string }>
            ).map(({ label, actual: a, target: tgt, color }) => {
              const over = tgt > 0 && a > tgt * 1.1;
              const pct = tgt > 0 ? Math.min(100, Math.round((a / tgt) * 100)) : 0;
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 dark:text-[#A0998E] w-3">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#E8E0D4] dark:bg-[#3A3A3A] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", over ? "bg-red-400" : color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums font-data text-slate-400 dark:text-[#A0998E] w-8 text-right">
                    {Math.round(a)}g
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </button>
    </div>
  );
}

type ModalState = { dayIndex: number; mealSlot: string } | null;

type Props = {
  planId: string;
  initialAssignments: Array<{
    id: string;
    dayIndex: number;
    mealSlot: string;
    servings: number;
    recipe: { id: string; title: string; macrosPerServing: MacroTotals };
  }>;
  recipes: RecipeOption[];
  targetMacros: {
    calorieTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
  } | null;
  startDate: string;
  lang: Lang;
  activeSlots?: string[];
  slotDistribution?: Record<string, number> | null;
};

export function WeeklyPlanEditor({
  planId,
  initialAssignments,
  recipes,
  targetMacros,
  startDate,
  lang,
  activeSlots,
  slotDistribution,
}: Props) {
  const SLOT_LABELS: Record<string, string> = {
    breakfast: t("Breakfast", lang),
    lunch: t("Lunch", lang),
    dinner: t("Dinner", lang),
    snack1: t("Snack 1", lang),
    snack2: t("Snack 2", lang),
  };

  const effectiveSlots =
    activeSlots && activeSlots.length > 0
      ? activeSlots
      : ["breakfast", "lunch", "dinner", "snack1", "snack2"];

  const visibleSlots = ALL_SLOTS.filter((s) => effectiveSlots.includes(s));

  const slotBudgets: SlotBudgets = targetMacros
    ? computeSlotBudgets(targetMacros, effectiveSlots, slotDistribution ?? null)
    : {};

  const [cells, setCells] = useState<Map<CellKey, AssignmentCell>>(() => {
    const map = new Map<CellKey, AssignmentCell>();
    for (const a of initialAssignments) {
      map.set(cellKey(a.dayIndex, a.mealSlot), {
        id: a.id,
        recipeId: a.recipe.id,
        recipeTitle: a.recipe.title,
        servings: a.servings,
        macros: {
          calories: Math.round(a.recipe.macrosPerServing.calories * a.servings),
          protein: Math.round(a.recipe.macrosPerServing.protein * a.servings * 10) / 10,
          carbs: Math.round(a.recipe.macrosPerServing.carbs * a.servings * 10) / 10,
          fat: Math.round(a.recipe.macrosPerServing.fat * a.servings * 10) / 10,
        },
      });
    }
    return map;
  });

  const [modal, setModal] = useState<ModalState>(null);
  const [removingKey, setRemovingKey] = useState<CellKey | null>(null);
  const [, startRemoveTransition] = useTransition();

  const dayLabels = Array.from({ length: DAYS_COUNT }, (_, i) => {
    const d = new Date(startDate + "T00:00:00");
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  });

  const dayDates = Array.from({ length: DAYS_COUNT }, (_, i) => {
    const d = new Date(startDate + "T00:00:00");
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const handleAssigned = useCallback((assignment: AssignmentResult) => {
    const key = cellKey(assignment.dayIndex, assignment.mealSlot);
    const s = assignment.servings;
    setCells((prev) => {
      const next = new Map(prev);
      next.set(key, {
        id: assignment.id,
        recipeId: assignment.recipe.id,
        recipeTitle: assignment.recipe.title,
        servings: s,
        macros: {
          calories: Math.round(assignment.recipe.macrosPerServing.calories * s),
          protein: Math.round(assignment.recipe.macrosPerServing.protein * s * 10) / 10,
          carbs: Math.round(assignment.recipe.macrosPerServing.carbs * s * 10) / 10,
          fat: Math.round(assignment.recipe.macrosPerServing.fat * s * 10) / 10,
        },
      });
      return next;
    });
  }, []);

  function handleRemove(key: CellKey, assignmentId: string) {
    setRemovingKey(key);
    startRemoveTransition(async () => {
      try {
        const result = await removeMeal(planId, assignmentId);
        if (result.success) {
          setCells((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
        }
      } finally {
        setRemovingKey(null);
      }
    });
  }

  const dailyMacros = Array.from({ length: DAYS_COUNT }, (_, i) => {
    const dayCells = visibleSlots
      .map((s) => cells.get(cellKey(i, s)))
      .filter(Boolean) as AssignmentCell[];
    return sumMacros(dayCells);
  });

  const dailyTarget: DailyTarget | null = targetMacros
    ? {
        calorieTarget: targetMacros.calorieTarget,
        proteinTarget: targetMacros.proteinTarget,
        carbsTarget: targetMacros.carbsTarget,
        fatTarget: targetMacros.fatTarget,
      }
    : null;

  const modalSlotBudget: MacroTotals | null = modal
    ? (slotBudgets[modal.mealSlot] ?? null)
    : null;

  return (
    <>
      {/* Desktop grid */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-28 p-2 text-left text-xs font-medium text-slate-400 dark:text-[#A0998E] uppercase tracking-wide" />
              {Array.from({ length: DAYS_COUNT }, (_, i) => (
                <th key={i} className="p-2 text-center min-w-[140px]">
                  <p className="font-semibold text-slate-800 dark:text-[#F5F1EB]">{dayLabels[i]}</p>
                  <p className="text-xs font-normal text-slate-400 dark:text-[#A0998E]">{dayDates[i]}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleSlots.map((slot) => (
              <tr key={slot} className="border-t border-[var(--color-sand)]">
                <td className="p-2 text-xs font-medium text-slate-500 dark:text-[#A0998E] uppercase tracking-wide align-top pt-3">
                  {SLOT_LABELS[slot]}
                </td>
                {Array.from({ length: DAYS_COUNT }, (_, dayIndex) => {
                  const key = cellKey(dayIndex, slot);
                  const cell = cells.get(key);
                  const isRemoving = removingKey === key;
                  return (
                    <td key={dayIndex} className="p-1.5 align-top">
                      {cell ? (
                        <div className="relative group rounded-lg border border-[var(--color-sand)] bg-white dark:bg-[#242424] p-2.5 shadow-sm">
                          <button
                            onClick={() => handleRemove(key, cell.id)}
                            disabled={isRemoving}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-slate-100 dark:hover:bg-[#3A3A3A] text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {isRemoving ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </button>
                          <p className="text-xs font-medium text-slate-800 dark:text-[#E8E2DA] leading-snug pr-4">
                            {cell.recipeTitle}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-[#A0998E] mt-0.5">
                            {cell.servings}× · {Math.round(cell.macros.calories)} kcal
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setModal({ dayIndex, mealSlot: slot })}
                          className="w-full h-14 rounded-lg border border-dashed border-[var(--color-sand)] flex items-center justify-center text-slate-300 hover:text-slate-400 hover:border-slate-300 dark:hover:border-[#5A5A5A] hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Daily totals row */}
            <tr className="border-t-2 border-[var(--color-sand)]">
              <td className="p-2 text-xs font-medium text-slate-500 dark:text-[#A0998E] uppercase tracking-wide">
                {t("Daily Total", lang)}
              </td>
              {dailyMacros.map((m, i) => (
                <td key={i} className="p-2">
                  <DailyFitCell actual={m} target={dailyTarget} lang={lang} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile: day cards */}
      <div className="lg:hidden space-y-6">
        {Array.from({ length: DAYS_COUNT }, (_, dayIndex) => (
          <div
            key={dayIndex}
            className="rounded-xl border border-[var(--color-sand)] bg-white dark:bg-[#242424] overflow-hidden shadow-sm"
          >
            <div className="px-4 py-3 bg-slate-50 dark:bg-[#1E1E1E] border-b border-[var(--color-sand)]">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-[#F5F1EB]">
                    {dayLabels[dayIndex]}
                  </span>
                  <span className="ml-1.5 text-xs text-slate-400 dark:text-[#A0998E]">
                    {dayDates[dayIndex]}
                  </span>
                </div>
                <span className="text-sm tabular-nums font-data font-medium text-slate-600 dark:text-[#A0998E]">
                  {Math.round(dailyMacros[dayIndex].calories)} kcal
                </span>
              </div>
              <DailyFitCell
                actual={dailyMacros[dayIndex]}
                target={dailyTarget}
                lang={lang}
              />
            </div>
            <div className="divide-y divide-[var(--color-sand)]">
              {visibleSlots.map((slot) => {
                const key = cellKey(dayIndex, slot);
                const cell = cells.get(key);
                const isRemoving = removingKey === key;
                return (
                  <div key={slot} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-20 shrink-0">
                      <p className="text-xs text-slate-400 dark:text-[#A0998E]">
                        {SLOT_LABELS[slot]}
                      </p>
                    </div>
                    {cell ? (
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-[#E8E2DA]">
                            {cell.recipeTitle}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-[#A0998E]">
                            {cell.servings}× · {Math.round(cell.macros.calories)} kcal
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isRemoving}
                          onClick={() => handleRemove(key, cell.id)}
                          className="h-7 w-7 p-0 text-slate-400"
                        >
                          {isRemoving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setModal({ dayIndex, mealSlot: slot })}
                        className="flex-1 flex items-center gap-1.5 text-xs text-slate-400 hover:text-[var(--color-clay)] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {t("Add recipe", lang)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <AssignRecipeModal
          open
          onClose={() => setModal(null)}
          planId={planId}
          dayIndex={modal.dayIndex}
          mealSlot={modal.mealSlot}
          recipes={recipes}
          slotBudget={modalSlotBudget}
          onAssigned={handleAssigned}
          lang={lang}
        />
      )}
    </>
  );
}
