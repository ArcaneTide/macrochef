"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, Loader2, AlertCircle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [servings, setServings] = useState("1");
  const [suggestedServings, setSuggestedServings] = useState<number | null>(null);
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

  const selected = recipes.find((r) => r.id === selectedId) ?? null;

  const servingsNum = parseFloat(servings) || 1;
  const sliderValue = Math.min(3.0, Math.max(0.5, servingsNum));

  const previewMacros: MacroTotals | null = useMemo(() => {
    if (!selected) return null;
    const s = parseFloat(servings) || 1;
    return {
      calories: Math.round(selected.macrosPerServing.calories * s),
      protein: Math.round(selected.macrosPerServing.protein * s * 10) / 10,
      carbs: Math.round(selected.macrosPerServing.carbs * s * 10) / 10,
      fat: Math.round(selected.macrosPerServing.fat * s * 10) / 10,
    };
  }, [selected, servings]);

  function handleSelectRecipe(id: string) {
    const recipe = recipes.find((r) => r.id === id);
    setSelectedId(id);
    if (recipe && slotBudget) {
      const s = suggestServings(recipe.macrosPerServing, slotBudget);
      setSuggestedServings(s);
      setServings(String(s));
    } else {
      setSuggestedServings(null);
      setServings("1");
    }
  }

  function handleAssign() {
    if (!selectedId) { setError("Select a recipe."); return; }
    const s = parseFloat(servings);
    if (!s || s <= 0) { setError("Enter a valid serving amount."); return; }
    setError(null);
    startTransition(async () => {
      try {
        const result = await assignMeal(planId, {
          dayIndex,
          mealSlot: mealSlot as "breakfast" | "lunch" | "dinner" | "snack1" | "snack2",
          recipeId: selectedId,
          servings: s,
        });
        if (!result.success) { setError(result.error); return; }
        onAssigned(result.assignment);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleClose() {
    setSearch("");
    setSelectedId(null);
    setServings("1");
    setSuggestedServings(null);
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("Assign Recipe", lang)} — {SLOT_LABELS[mealSlot] ?? mealSlot}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Recipe search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              className="pl-9"
              placeholder={t("Search recipes…", lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Recipe list */}
          <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--color-sand)] divide-y divide-[var(--color-sand)]">
            {matchGroup.length === 0 && untaggedGroup.length === 0 && otherGroup.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-[#6A6460] text-center py-6">
                {t("No recipes found", lang)}
              </p>
            ) : (
              <>
                {[
                  { group: matchGroup, label: null },
                  { group: untaggedGroup, label: matchGroup.length > 0 ? t("All meals", lang) : null },
                  { group: otherGroup, label: t("Other", lang) },
                ].map(({ group, label }) =>
                  group.length === 0 ? null : (
                    <div key={label ?? "match"}>
                      {label && (
                        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#6A6460] bg-slate-50 dark:bg-[#1E1E1E]">
                          {label}
                        </p>
                      )}
                      {group.map((recipe) => (
                        <button
                          key={recipe.id}
                          type="button"
                          onClick={() => handleSelectRecipe(recipe.id)}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors",
                            selectedId === recipe.id
                              ? "bg-[#F5EDE8] dark:bg-[#2D2420]"
                              : "hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                          )}
                        >
                          <div>
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
                          {selectedId === recipe.id && (
                            <Check className="h-4 w-4 text-[var(--color-olive)] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>

          {/* Servings + preview */}
          {selected && (
            <div className="rounded-lg border border-[var(--color-sand)] bg-slate-50 dark:bg-[#1E1E1E] p-4 space-y-3">
              {/* Serving slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{t("Servings", lang)}</Label>
                  {suggestedServings !== null && (
                    <span className="text-xs text-slate-400 dark:text-[#6A6460]">
                      {t("Suggested", lang)}: {suggestedServings} {t("servings", lang)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0.5}
                    max={3.0}
                    step={0.25}
                    value={sliderValue}
                    onChange={(e) => setServings(e.target.value)}
                    style={{ accentColor: "var(--color-olive)" }}
                    className="flex-1 cursor-pointer"
                  />
                  <Input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.25}
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                    }}
                    className="w-20 bg-white dark:bg-[#242424]"
                  />
                </div>
              </div>

              {/* Macro preview */}
              {previewMacros && (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-[#E8E2DA] tabular-nums font-data">
                        {previewMacros.calories}
                      </p>
                      <p className="text-slate-400 dark:text-[#6A6460]">kcal</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#5A6B4F] tabular-nums font-data">
                        {previewMacros.protein}g
                      </p>
                      <p className="text-slate-400 dark:text-[#6A6460]">{t("Protein", lang)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-clay)] tabular-nums font-data">
                        {previewMacros.carbs}g
                      </p>
                      <p className="text-slate-400 dark:text-[#6A6460]">{t("Carbs", lang)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-terracotta)] tabular-nums font-data">
                        {previewMacros.fat}g
                      </p>
                      <p className="text-slate-400 dark:text-[#6A6460]">{t("Fat", lang)}</p>
                    </div>
                  </div>

                  {slotBudget && (
                    <p className="text-[11px] text-slate-400 dark:text-[#6A6460] text-center font-data tabular-nums">
                      {t("Slot target", lang)}: {slotBudget.calories} kcal · {slotBudget.protein.toFixed(0)}P · {slotBudget.carbs.toFixed(0)}C · {slotBudget.fat.toFixed(0)}F
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              {t("Cancel", lang)}
            </Button>
            <Button
              className="bg-[var(--color-olive)] hover:bg-[#6A7B5F] text-white"
              onClick={handleAssign}
              disabled={isPending || !selectedId}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {t("Assign", lang)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
