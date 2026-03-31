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
import { calcFitScore, FIT_SCORE_GREEN, FIT_SCORE_AMBER, type MacroTotals } from "@/lib/macros";
import { assignMeal, type AssignmentResult } from "@/app/(main)/clients/[id]/plans/actions";
import { t, type Lang } from "@/lib/translations";


export type RecipeOption = {
  id: string;
  title: string;
  servings: number;
  macrosPerServing: MacroTotals;
};

type Props = {
  open: boolean;
  onClose: () => void;
  planId: string;
  dayIndex: number;
  mealSlot: string;
  recipes: RecipeOption[];
  targetMacros: MacroTotals | null;
  onAssigned: (assignment: AssignmentResult) => void;
  lang: Lang;
};

function FitBadge({ score }: { score: number }) {
  const color =
    score >= FIT_SCORE_GREEN
      ? "text-[#5A6B4F] bg-[#EDF1EB] border-[#c5d0bf]"
      : score >= FIT_SCORE_AMBER
      ? "text-[var(--color-clay)] bg-[#F5EDE8] border-[#dfc5b3]"
      : "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={cn("text-xs font-semibold border rounded px-1.5 py-0.5 tabular-nums font-data", color)}>
      {score}%
    </span>
  );
}

export function AssignRecipeModal({
  open,
  onClose,
  planId,
  dayIndex,
  mealSlot,
  recipes,
  targetMacros,
  onAssigned,
  lang,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [servings, setServings] = useState("1");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const SLOT_LABELS: Record<string, string> = {
    breakfast: t("Breakfast", lang),
    lunch: t("Lunch", lang),
    dinner: t("Dinner", lang),
    snack1: t("Snack 1", lang),
    snack2: t("Snack 2", lang),
  };

  const filtered = useMemo(
    () =>
      recipes.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
      ),
    [recipes, search]
  );

  const selected = recipes.find((r) => r.id === selectedId) ?? null;

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

  const fitScore = useMemo(() => {
    if (!previewMacros || !targetMacros) return null;
    return calcFitScore(previewMacros, targetMacros);
  }, [previewMacros, targetMacros]);

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
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg">
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
          <div className="max-h-52 overflow-y-auto rounded-lg border border-[var(--color-sand)] divide-y divide-[var(--color-sand)]">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-[#6A6460] text-center py-6">{t("No recipes found", lang)}</p>
            ) : (
              filtered.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => setSelectedId(recipe.id)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors",
                    selectedId === recipe.id
                      ? "bg-[#F5EDE8] dark:bg-[#2D2420]"
                      : "hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-[#E8E2DA]">{recipe.title}</p>
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
              ))
            )}
          </div>

          {/* Servings + preview */}
          {selected && (
            <div className="rounded-lg border border-[var(--color-sand)] bg-slate-50 dark:bg-[#1E1E1E] p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="servings">{t("Servings", lang)}</Label>
                  <Input
                    id="servings"
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                    }}
                    className="w-28 bg-white dark:bg-[#242424]"
                  />
                </div>
                {fitScore !== null && targetMacros && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-[#A0998E] mb-1">{t("Fit score", lang)}</p>
                    <FitBadge score={fitScore} />
                    <p className="text-xs text-slate-400 dark:text-[#6A6460] mt-1 max-w-[120px]">
                      {t("Fit score help", lang)}
                    </p>
                  </div>
                )}
              </div>

              {previewMacros && (
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
