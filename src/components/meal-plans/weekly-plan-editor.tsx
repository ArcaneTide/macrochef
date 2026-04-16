"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { Plus, X, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type MacroTotals } from "@/lib/macros";
import { computeSlotBudgets, type SlotBudgets } from "@/lib/slot-budget";
import { removeMeal, updateMealServings } from "@/app/(main)/clients/[id]/plans/actions";
import {
  AssignRecipeModal,
  type RecipeOption,
} from "@/components/meal-plans/assign-recipe-modal";
import type { AssignmentResult } from "@/app/(main)/clients/[id]/plans/actions";
import { t, type Lang } from "@/lib/translations";

const DAYS_COUNT = 7;
const ALL_SLOTS = ["breakfast", "lunch", "dinner", "snack1", "snack2"] as const;
// Bar track represents up to 150% of target so overflow is visible
const MAX_DISPLAY_RATIO = 1.5;

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

/** Weighted fit score: cal 40%, protein 30%, carbs 15%, fat 15% */
function calcWeightedFit(actual: MacroTotals, target: DailyTarget): number {
  const dev = (a: number, tgt: number) =>
    tgt > 0 ? Math.abs(a - tgt) / tgt : a > 0 ? 1.0 : 0;
  const score =
    0.4  * dev(actual.calories, target.calorieTarget) +
    0.3  * dev(actual.protein,  target.proteinTarget) +
    0.15 * dev(actual.carbs,    target.carbsTarget)   +
    0.15 * dev(actual.fat,      target.fatTarget);
  return Math.max(0, Math.round((1 - score) * 100));
}

/** Overflow-aware fit bar + per-macro expand on click. */
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

  const fitPct = calcWeightedFit(actual, target);
  const calRatio = target.calorieTarget > 0 ? actual.calories / target.calorieTarget : 0;
  const calFillPct = Math.min(calRatio / MAX_DISPLAY_RATIO, 1) * 100;
  const targetLinePct = (1 / MAX_DISPLAY_RATIO) * 100; // 66.7%
  const calNormalWidth = Math.min(calFillPct, targetLinePct);
  const calOverflowWidth = Math.max(0, calFillPct - targetLinePct);

  const isOver = calRatio > 1.05;
  const baseBarColor = fitPct >= 90
    ? "bg-[#5A6B4F]"
    : fitPct >= 80
    ? "bg-[var(--color-clay)]"
    : "bg-red-400";
  const textColor = isOver
    ? "text-[var(--color-terracotta)]"
    : fitPct >= 90
    ? "text-[#5A6B4F]"
    : fitPct >= 80
    ? "text-[var(--color-clay)]"
    : "text-red-500";

  const macroRows = [
    { label: "P", actual: actual.protein, target: target.proteinTarget, color: "bg-[#5A6B4F]" },
    { label: "C", actual: actual.carbs,   target: target.carbsTarget,   color: "bg-[var(--color-clay)]" },
    { label: "F", actual: actual.fat,     target: target.fatTarget,     color: "bg-[var(--color-terracotta)]" },
  ] as Array<{ label: string; actual: number; target: number; color: string }>;

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
          {/* Overflow-aware calorie bar */}
          <div className="relative flex-1 h-2 rounded-full bg-[#E8E0D4] dark:bg-[#3A3A3A] overflow-hidden">
            {/* Normal fill */}
            <div
              className={cn("absolute inset-y-0 left-0 rounded-l-full", baseBarColor)}
              style={{ width: `${calNormalWidth}%` }}
            />
            {/* Overflow fill — terracotta */}
            {calOverflowWidth > 0 && (
              <div
                className="absolute inset-y-0 bg-[var(--color-terracotta)]"
                style={{ left: `${targetLinePct}%`, width: `${calOverflowWidth}%` }}
              />
            )}
            {/* Target marker line */}
            <div
              className="absolute inset-y-0 w-px bg-white dark:bg-[#1E1E1E] opacity-60"
              style={{ left: `${targetLinePct}%` }}
            />
          </div>
          <span className={cn("text-[10px] tabular-nums font-data shrink-0", textColor)}>
            {fitPct}%
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-slate-400 transition-transform shrink-0",
              expanded && "rotate-180"
            )}
          />
        </div>

        {/* Per-macro breakdown — click to toggle */}
        {expanded && (
          <div className="mt-2 space-y-1.5">
            {macroRows.map(({ label, actual: a, target: tgt, color }) => {
              const ratio = tgt > 0 ? a / tgt : 0;
              const fillPct = Math.min(ratio / MAX_DISPLAY_RATIO, 1) * 100;
              const normalWidth = Math.min(fillPct, targetLinePct);
              const overflowWidth = Math.max(0, fillPct - targetLinePct);
              const delta = Math.round(a - tgt);
              const deltaStr = delta >= 0 ? `+${delta}g` : `${delta}g`;
              const macroOver = ratio > 1.05;

              return (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 dark:text-[#A0998E] w-3 shrink-0">{label}</span>
                  <div className="relative flex-1 h-1.5 rounded-full bg-[#E8E0D4] dark:bg-[#3A3A3A] overflow-hidden">
                    <div
                      className={cn("absolute inset-y-0 left-0 rounded-l-full", color)}
                      style={{ width: `${normalWidth}%` }}
                    />
                    {overflowWidth > 0 && (
                      <div
                        className="absolute inset-y-0 bg-[var(--color-terracotta)]"
                        style={{ left: `${targetLinePct}%`, width: `${overflowWidth}%` }}
                      />
                    )}
                    <div
                      className="absolute inset-y-0 w-px bg-white dark:bg-[#1E1E1E] opacity-60"
                      style={{ left: `${targetLinePct}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] tabular-nums font-data shrink-0 w-28 text-right",
                    macroOver ? "text-[var(--color-terracotta)]" : "text-slate-400 dark:text-[#A0998E]"
                  )}>
                    {Math.round(a)} / {Math.round(tgt)}g{" "}
                    <span className={macroOver ? "text-[var(--color-terracotta)]" : "text-slate-300 dark:text-[#5A5A5A]"}>
                      ({deltaStr})
                    </span>
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

type ModalState = {
  dayIndex: number;
  mealSlot: string;
  dayAssignedMacros: MacroTotals;
  emptySlotCount: number;
} | null;

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

  // Inline serving edit state
  const [editingKey, setEditingKey] = useState<CellKey | null>(null);
  const [editServings, setEditServings] = useState("1");
  const [savingKey, setSavingKey] = useState<CellKey | null>(null);
  const [, startSaveTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (editingKey === key) setEditingKey(null);
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

  function openEdit(key: CellKey, cell: AssignmentCell) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setEditingKey(key);
    setEditServings(String(cell.servings));
  }

  function closeEdit() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setEditingKey(null);
  }

  function handleServingsChange(key: CellKey, cell: AssignmentCell, value: string) {
    setEditServings(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const num = parseFloat(value);
    if (!num || num <= 0) return;
    const rounded = Math.round(num / 0.25) * 0.25;
    debounceRef.current = setTimeout(() => {
      setSavingKey(key);
      startSaveTransition(async () => {
        try {
          const result = await updateMealServings(planId, cell.id, rounded);
          if (result.success) {
            setCells((prev) => {
              const next = new Map(prev);
              const existing = next.get(key);
              if (!existing) return prev;
              next.set(key, {
                ...existing,
                servings: rounded,
                macros: {
                  calories: Math.round(result.macrosPerServing.calories * rounded),
                  protein: Math.round(result.macrosPerServing.protein * rounded * 10) / 10,
                  carbs: Math.round(result.macrosPerServing.carbs * rounded * 10) / 10,
                  fat: Math.round(result.macrosPerServing.fat * rounded * 10) / 10,
                },
              });
              return next;
            });
          }
        } finally {
          setSavingKey(null);
        }
      });
    }, 600);
  }

  function openModal(dayIndex: number, slot: string) {
    const dayCells = visibleSlots
      .filter((s) => s !== slot)
      .map((s) => cells.get(cellKey(dayIndex, s)))
      .filter(Boolean) as AssignmentCell[];
    const dayAssignedMacros = sumMacros(dayCells);
    const emptySlotCount = visibleSlots.filter((s) => !cells.get(cellKey(dayIndex, s))).length;
    setModal({ dayIndex, mealSlot: slot, dayAssignedMacros, emptySlotCount });
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

  // Smart nudge: show remaining budget details when empty slots have >100 kcal
  const dailyNudges = Array.from({ length: DAYS_COUNT }, (_, i) => {
    if (!targetMacros) return null;
    const emptySlots = visibleSlots.filter((s) => !cells.get(cellKey(i, s)));
    if (emptySlots.length === 0) return null;
    const calories = Math.round(emptySlots.reduce((sum, s) => sum + (slotBudgets[s]?.calories ?? 0), 0));
    if (calories <= 100) return null;
    return {
      calories,
      protein: Math.round(emptySlots.reduce((sum, s) => sum + (slotBudgets[s]?.protein ?? 0), 0)),
      carbs:   Math.round(emptySlots.reduce((sum, s) => sum + (slotBudgets[s]?.carbs   ?? 0), 0)),
      fat:     Math.round(emptySlots.reduce((sum, s) => sum + (slotBudgets[s]?.fat     ?? 0), 0)),
      count:   emptySlots.length,
    };
  });

  const modalDailyTarget: MacroTotals | null = targetMacros
    ? {
        calories: targetMacros.calorieTarget,
        protein:  targetMacros.proteinTarget,
        carbs:    targetMacros.carbsTarget,
        fat:      targetMacros.fatTarget,
      }
    : null;

  /** Compact inline serving editor: title + number input + one-line macros + delete */
  function renderEditingCell(key: CellKey, cell: AssignmentCell, isRemoving: boolean) {
    const servingsNum = parseFloat(editServings) || cell.servings;
    const editRecipe = recipes.find((r) => r.id === cell.recipeId);
    const editMacros = editRecipe
      ? {
          calories: Math.round(editRecipe.macrosPerServing.calories * servingsNum),
          protein: Math.round(editRecipe.macrosPerServing.protein * servingsNum * 10) / 10,
          carbs:   Math.round(editRecipe.macrosPerServing.carbs   * servingsNum * 10) / 10,
          fat:     Math.round(editRecipe.macrosPerServing.fat     * servingsNum * 10) / 10,
        }
      : null;

    return (
      <div
        className="rounded-lg border border-[var(--color-olive)] bg-white dark:bg-[#242424] shadow-sm p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Row 1: title + servings input + spinner + close */}
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-slate-800 dark:text-[#E8E2DA] flex-1 min-w-0 truncate leading-snug">
            {cell.recipeTitle}
          </p>
          <Input
            type="number"
            min={0.5}
            max={10}
            step={0.25}
            value={editServings}
            onChange={(e) => handleServingsChange(key, cell, e.target.value)}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
            }}
            className="w-14 h-6 text-xs px-1.5 bg-white dark:bg-[#1E1E1E]"
          />
          {savingKey === key && (
            <Loader2 className="h-3 w-3 animate-spin text-[var(--color-olive)] shrink-0" />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); closeEdit(); }}
            className="rounded p-0.5 hover:bg-slate-100 dark:hover:bg-[#3A3A3A] text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        {/* Row 2: resulting macros at current servings */}
        {editMacros && (
          <p className="text-[10px] text-slate-400 dark:text-[#6A6460] tabular-nums font-data mt-0.5">
            {servingsNum}× · {editMacros.calories} kcal · {editMacros.protein}g P · {editMacros.carbs}g C · {editMacros.fat}g F
          </p>
        )}
        {/* Row 3: delete */}
        <button
          onClick={(e) => { e.stopPropagation(); handleRemove(key, cell.id); }}
          disabled={isRemoving}
          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 transition-colors mt-1"
        >
          {isRemoving ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          {t("Delete", lang)}
        </button>
      </div>
    );
  }

  function renderNudge(nudge: { calories: number; protein: number; carbs: number; fat: number; count: number } | null) {
    if (!nudge) return null;
    const mealLabel = nudge.count === 1 ? t("meal singular", lang) : t("meal plural", lang);
    return (
      <p className="text-[11px] italic text-[var(--color-olive)] dark:text-[#8FAB7D] mt-1">
        {t("Remaining", lang)}: ~{nudge.calories} kcal · {nudge.protein}g P · {nudge.carbs}g C · {nudge.fat}g F{" "}
        {t("across", lang)} {nudge.count} {mealLabel}
      </p>
    );
  }

  return (
    <>
      {/* Desktop grid */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-28 p-2 text-left text-xs font-medium text-slate-400 dark:text-[#A0998E] uppercase tracking-wide" />
              {Array.from({ length: DAYS_COUNT }, (_, i) => (
                <th key={i} className="p-2 text-center min-w-[150px]">
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
                  const isEditing = editingKey === key;
                  return (
                    <td key={dayIndex} className="p-1.5 align-top">
                      {cell ? (
                        isEditing ? (
                          renderEditingCell(key, cell, isRemoving)
                        ) : (
                          <div
                            className="relative group rounded-lg border border-[var(--color-sand)] bg-white dark:bg-[#242424] p-2.5 shadow-sm cursor-pointer hover:border-[var(--color-clay)] transition-colors"
                            onClick={() => openEdit(key, cell)}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemove(key, cell.id); }}
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
                        )
                      ) : (
                        <button
                          onClick={() => openModal(dayIndex, slot)}
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
              <td className="p-2 text-xs font-medium text-slate-500 dark:text-[#A0998E] uppercase tracking-wide align-top">
                {t("Daily Total", lang)}
              </td>
              {dailyMacros.map((m, i) => (
                <td key={i} className="p-2 align-top">
                  <DailyFitCell actual={m} target={dailyTarget} lang={lang} />
                  {renderNudge(dailyNudges[i])}
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
                const isEditing = editingKey === key;
                return (
                  <div key={slot} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 shrink-0">
                        <p className="text-xs text-slate-400 dark:text-[#A0998E]">
                          {SLOT_LABELS[slot]}
                        </p>
                      </div>
                      {cell ? (
                        isEditing ? (
                          <div className="flex-1">
                            {renderEditingCell(key, cell, isRemoving)}
                          </div>
                        ) : (
                          <div
                            className="flex-1 flex items-center justify-between gap-2 cursor-pointer"
                            onClick={() => openEdit(key, cell)}
                          >
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
                              onClick={(e) => { e.stopPropagation(); handleRemove(key, cell.id); }}
                              className="h-7 w-7 p-0 text-slate-400 shrink-0"
                            >
                              {isRemoving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => openModal(dayIndex, slot)}
                          className="flex-1 flex items-center gap-1.5 text-xs text-slate-400 hover:text-[var(--color-clay)] transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("Add recipe", lang)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Smart nudge for mobile */}
            {dailyNudges[dayIndex] && (
              <div className="px-4 pb-3">
                {renderNudge(dailyNudges[dayIndex])}
              </div>
            )}
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
          dailyTarget={modalDailyTarget}
          dayAssignedMacros={modal.dayAssignedMacros}
          emptySlotCount={modal.emptySlotCount}
          onAssigned={handleAssigned}
          lang={lang}
        />
      )}
    </>
  );
}
