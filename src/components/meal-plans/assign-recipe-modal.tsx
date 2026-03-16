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
import { calcFitScore, type MacroTotals } from "@/lib/macros";
import { assignMeal, type AssignmentResult } from "@/app/(dashboard)/clients/[id]/plans/actions";

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack1: "Snack 1",
  snack2: "Snack 2",
};

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
};

function FitBadge({ score }: { score: number }) {
  const color =
    score >= 95
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : score >= 90
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={cn("text-xs font-semibold border rounded px-1.5 py-0.5 tabular-nums", color)}>
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
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [servings, setServings] = useState("1");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
    // must be multiple of 0.5
    if ((s * 2) % 1 !== 0) { setError("Servings must be in increments of 0.5."); return; }
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
            Assign Recipe — {SLOT_LABELS[mealSlot] ?? mealSlot}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Recipe search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              className="pl-9"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Recipe list */}
          <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No recipes found.</p>
            ) : (
              filtered.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => setSelectedId(recipe.id)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors",
                    selectedId === recipe.id
                      ? "bg-emerald-50"
                      : "hover:bg-slate-50"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{recipe.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {Math.round(recipe.macrosPerServing.calories)} kcal ·{" "}
                      <span className="text-blue-500">{recipe.macrosPerServing.protein.toFixed(1)}g P</span>{" "}
                      <span className="text-amber-500">{recipe.macrosPerServing.carbs.toFixed(1)}g C</span>{" "}
                      <span className="text-orange-500">{recipe.macrosPerServing.fat.toFixed(1)}g F</span>
                      {" "}<span className="text-slate-300">/ serving</span>
                    </p>
                  </div>
                  {selectedId === recipe.id && (
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Servings + preview */}
          {selected && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="w-28 bg-white"
                  />
                </div>
                {fitScore !== null && targetMacros && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Fit score</p>
                    <FitBadge score={fitScore} />
                  </div>
                )}
              </div>

              {previewMacros && (
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 tabular-nums">
                      {previewMacros.calories}
                    </p>
                    <p className="text-slate-400">kcal</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600 tabular-nums">
                      {previewMacros.protein}g
                    </p>
                    <p className="text-slate-400">protein</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-600 tabular-nums">
                      {previewMacros.carbs}g
                    </p>
                    <p className="text-slate-400">carbs</p>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-600 tabular-nums">
                      {previewMacros.fat}g
                    </p>
                    <p className="text-slate-400">fat</p>
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
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAssign}
              disabled={isPending || !selectedId}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
