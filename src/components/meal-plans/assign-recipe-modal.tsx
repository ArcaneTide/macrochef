"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type MacroTotals } from "@/lib/macros";
import { suggestServings } from "@/lib/slot-budget";
import { assignMeal, type AssignmentResult } from "@/app/(main)/clients/[id]/plans/actions";
import { t, type Lang } from "@/lib/translations";

export type RecipeOption = {
  id: string;
  title: string;
  servings: number;
  mealType: string | null;
  macrosPerServing: MacroTotals;
};

type Props = {
  open: boolean;
  onClose: () => void;
  planId: string;
  dayIndex: number;
  mealSlot: string;
  recipes: RecipeOption[];
  slotBudget: MacroTotals | null;
  onAssigned: (assignment: AssignmentResult) => void;
  lang: Lang;
};

export function AssignRecipeModal({
  open,
  onClose,
  planId,
  dayIndex,
  mealSlot,
  recipes,
  slotBudget,
  onAssigned,
  lang,
}: Props) {
  const [search, setSearch] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const SLOT_LABELS: Record<string, string> = {
    breakfast: t("Breakfast", lang),
    lunch: t("Lunch", lang),
    dinner: t("Dinner", lang),
    snack1: t("Snack 1", lang),
    snack2: t("Snack 2", lang),
  };

  const slotMealType = mealSlot === "snack1" || mealSlot === "snack2" ? "snack" : mealSlot;

  const { matchGroup, untaggedGroup, otherGroup } = useMemo(() => {
    const q = search.toLowerCase();
    const visible = recipes.filter((r) => r.title.toLowerCase().includes(q));
    const match: typeof recipes = [];
    const untagged: typeof recipes = [];
    const other: typeof recipes = [];
    for (const r of visible) {
      if (r.mealType === slotMealType) match.push(r);
      else if (!r.mealType) untagged.push(r);
      else other.push(r);
    }
    return { matchGroup: match, untaggedGroup: untagged, otherGroup: other };
  }, [recipes, search, slotMealType]);

  // Pre-compute suggested servings for all visible recipes
  const suggestedMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!slotBudget) return map;
    for (const r of recipes) {
      map.set(r.id, suggestServings(r.macrosPerServing, slotBudget));
    }
    return map;
  }, [recipes, slotBudget]);

  function handleTapRecipe(recipe: RecipeOption) {
    if (isPending) return;
    const s = suggestedMap.get(recipe.id) ?? 1;
    setAssigningId(recipe.id);
    setError(null);
    startTransition(async () => {
      try {
        const result = await assignMeal(planId, {
          dayIndex,
          mealSlot: mealSlot as "breakfast" | "lunch" | "dinner" | "snack1" | "snack2",
          recipeId: recipe.id,
          servings: s,
        });
        if (!result.success) {
          setError(result.error);
          setAssigningId(null);
          return;
        }
        onAssigned(result.assignment);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setAssigningId(null);
      }
    });
  }

  function handleClose() {
    setSearch("");
    setAssigningId(null);
    setError(null);
    onClose();
  }

  function renderGroup(group: typeof recipes, label: string | null) {
    if (group.length === 0) return null;
    return (
      <div key={label ?? "match"}>
        {label && (
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#6A6460] bg-slate-50 dark:bg-[#1E1E1E]">
            {label}
          </p>
        )}
        {group.map((recipe) => {
          const suggested = suggestedMap.get(recipe.id);
          const isAssigning = assigningId === recipe.id;
          return (
            <button
              key={recipe.id}
              type="button"
              disabled={isPending}
              onClick={() => handleTapRecipe(recipe)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors",
                isPending && assigningId !== recipe.id
                  ? "opacity-40"
                  : "hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-[#E8E2DA]">
                  {recipe.title}
                </p>
                <p className="text-xs text-slate-400 dark:text-[#6A6460] mt-0.5">
                  {Math.round(recipe.macrosPerServing.calories)} kcal ·{" "}
                  <span className="text-[#5A6B4F]">{recipe.macrosPerServing.protein.toFixed(1)}g P</span>{" "}
                  <span className="text-[var(--color-clay)]">{recipe.macrosPerServing.carbs.toFixed(1)}g C</span>{" "}
                  <span className="text-[var(--color-terracotta)]">{recipe.macrosPerServing.fat.toFixed(1)}g F</span>
                  {" "}<span className="text-slate-300 dark:text-[#4A4A4A]">{t("/ serving", lang)}</span>
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {suggested !== undefined && (
                  <span className="text-[10px] font-medium text-[var(--color-olive)] bg-[#EDF1EB] dark:bg-[#1E2A1A] px-1.5 py-0.5 rounded font-data tabular-nums">
                    {t("Suggested", lang)}: {suggested}×
                  </span>
                )}
                {isAssigning && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-olive)]" />}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("Assign Recipe", lang)} — {SLOT_LABELS[mealSlot] ?? mealSlot}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-sand)] rounded-md bg-white dark:bg-[#242424] text-slate-800 dark:text-[#E8E2DA] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-olive)]"
              placeholder={t("Search recipes…", lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Recipe list — tap to assign */}
          <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-[var(--color-sand)] divide-y divide-[var(--color-sand)]">
            {matchGroup.length === 0 && untaggedGroup.length === 0 && otherGroup.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-[#6A6460] text-center py-6">
                {t("No recipes found", lang)}
              </p>
            ) : (
              <>
                {renderGroup(matchGroup, null)}
                {renderGroup(untaggedGroup, matchGroup.length > 0 ? t("All meals", lang) : null)}
                {renderGroup(otherGroup, t("Other", lang))}
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
