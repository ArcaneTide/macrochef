"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, Loader2, AlertCircle } from "lucide-react"; // ChevronDown kept for potential future use
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  calcIngredientMacros,
  calcRecipeMacrosPerServing,
  macroCalorieSplit,
  fmtMacro,
} from "@/lib/macros";
import {
  createRecipe,
  updateRecipe,
  type RecipeFormInput,
} from "@/app/(dashboard)/recipes/actions";
import { t, tStatus, type Lang } from "@/lib/translations";

// ─── Types ────────────────────────────────────────────────

export type IngredientOption = {
  id: string;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

export type RecipeInitialData = {
  id: string;
  title: string;
  servings: number;
  instructions: string | null;
  cuisine: string | null;
  mealType: string | null;
  status: string;
  ingredients: Array<{ ingredientId: string; quantityGrams: number }>;
};

type IngredientRow = {
  key: string;
  ingredientId: string;
  quantityGrams: number;
};

// ─── Helpers ──────────────────────────────────────────────

function nextKey() {
  return `${Date.now()}-${Math.random()}`;
}

// ─── Quantity Input ───────────────────────────────────────
// Uses local string state so the user can freely edit the field
// without the value snapping to 1 on every keystroke.

function QuantityInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [display, setDisplay] = useState(String(value));

  // Keep display in sync if the parent resets the value (e.g. edit mode load)
  useEffect(() => {
    setDisplay(String(value));
  }, [value]);

  return (
    <Input
      type="number"
      min={1}
      value={display}
      onChange={(e) => {
        setDisplay(e.target.value);
        // Update parent live for real-time macro preview
        const parsed = parseFloat(e.target.value);
        if (parsed > 0) onChange(parsed);
      }}
      onBlur={() => {
        const parsed = Math.max(1, parseFloat(display) || 1);
        setDisplay(String(parsed));
        onChange(parsed);
      }}
      onKeyDown={(e) => {
        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
      }}
      className="h-7 text-right text-sm tabular-nums"
    />
  );
}

// ─── Ingredient Combobox ──────────────────────────────────

function IngredientCombobox({
  availableIngredients,
  selectedIds,
  onSelect,
  lang,
}: {
  availableIngredients: IngredientOption[];
  selectedIds: Set<string>;
  onSelect: (ingredient: IngredientOption) => void;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);

  const unselected = useMemo(
    () => availableIngredients.filter((i) => !selectedIds.has(i.id)),
    [availableIngredients, selectedIds]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {t("Add Ingredient", lang)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80" align="start">
        <Command>
          <CommandInput placeholder={t("Search ingredients…", lang)} />
          <CommandList>
            <CommandEmpty>{t("No ingredients found", lang)}</CommandEmpty>
            <CommandGroup>
              {unselected.map((ing) => (
                <CommandItem
                  key={ing.id}
                  value={ing.name}
                  onSelect={() => {
                    onSelect(ing);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1">{ing.name}</span>
                  <span className="text-xs text-muted-foreground capitalize ml-2">
                    {ing.category}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Macro Summary Sidebar ────────────────────────────────

function MacroSummary({
  rows,
  ingredientMap,
  servings,
  lang,
}: {
  rows: IngredientRow[];
  ingredientMap: Map<string, IngredientOption>;
  servings: number;
  lang: Lang;
}) {
  const macros = useMemo(() => {
    const items = rows
      .map((r) => {
        const ing = ingredientMap.get(r.ingredientId);
        if (!ing) return null;
        return { ingredient: ing, quantityGrams: r.quantityGrams };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    return calcRecipeMacrosPerServing(items, Math.max(servings, 1));
  }, [rows, ingredientMap, servings]);

  const { proteinPct, carbsPct, fatPct } = macroCalorieSplit(macros);
  const hasData = macros.calories > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{t("Per Serving", lang)}</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{t("Calories", lang)}</span>
          <span className="text-lg font-semibold text-slate-900 tabular-nums">
            {hasData ? fmtMacro(macros.calories) : "—"}
            {hasData && <span className="text-xs font-normal text-slate-400 ml-1">kcal</span>}
          </span>
        </div>

        {/* Macro bar */}
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
          <div
            className="bg-blue-500 transition-all duration-300"
            style={{ width: `${proteinPct}%` }}
          />
          <div
            className="bg-amber-400 transition-all duration-300"
            style={{ width: `${carbsPct}%` }}
          />
          <div
            className="bg-orange-400 transition-all duration-300"
            style={{ width: `${fatPct}%` }}
          />
        </div>

        {/* Macro values */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {(
            [
              { labelKey: "Protein" as const, value: macros.protein, color: "text-blue-600", bg: "bg-blue-50" },
              { labelKey: "Carbs" as const, value: macros.carbs, color: "text-amber-600", bg: "bg-amber-50" },
              { labelKey: "Fat" as const, value: macros.fat, color: "text-orange-600", bg: "bg-orange-50" },
            ]
          ).map(({ labelKey, value, color, bg }) => (
            <div key={labelKey} className={cn("rounded-lg p-2", bg)}>
              <p className={cn("text-base font-semibold tabular-nums", color)}>
                {hasData ? fmtMacro(value) : "—"}
                {hasData && <span className="text-xs font-normal ml-0.5">g</span>}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{t(labelKey, lang)}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        {hasData && (
          <div className="flex items-center justify-center gap-3 pt-1">
            {[
              { label: "P", color: "bg-blue-500", pct: proteinPct },
              { label: "C", color: "bg-amber-400", pct: carbsPct },
              { label: "F", color: "bg-orange-400", pct: fatPct },
            ].map(({ label, color, pct }) => (
              <span key={label} className="flex items-center gap-1 text-xs text-slate-400">
                <span className={cn("inline-block h-2 w-2 rounded-full", color)} />
                {label} {pct.toFixed(0)}%
              </span>
            ))}
          </div>
        )}
      </div>

      {!hasData && (
        <p className="text-xs text-slate-400 text-center mt-3">
          {t("No ingredients yet", lang)}
        </p>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────

interface RecipeFormProps {
  availableIngredients: IngredientOption[];
  initialData?: RecipeInitialData;
  lang: Lang;
}

export function RecipeForm({ availableIngredients, initialData, lang }: RecipeFormProps) {
  const router = useRouter();
  const [isDraftPending, startDraftTransition] = useTransition();
  const [isPublishPending, startPublishTransition] = useTransition();
  const isAnySavePending = isDraftPending || isPublishPending;
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [servings, setServings] = useState(initialData?.servings ?? 1);
  const [instructions, setInstructions] = useState(initialData?.instructions ?? "");
  const [cuisine, setCuisine] = useState(initialData?.cuisine ?? "");
  const [mealType, setMealType] = useState<string>(initialData?.mealType ?? "none");

  // Ingredient rows
  const [rows, setRows] = useState<IngredientRow[]>(() =>
    (initialData?.ingredients ?? []).map((ing) => ({
      key: nextKey(),
      ingredientId: ing.ingredientId,
      quantityGrams: ing.quantityGrams,
    }))
  );

  const ingredientMap = useMemo(
    () => new Map(availableIngredients.map((i) => [i.id, i])),
    [availableIngredients]
  );

  const selectedIds = useMemo(
    () => new Set(rows.map((r) => r.ingredientId)),
    [rows]
  );

  function addIngredient(ing: IngredientOption) {
    setRows((prev) => [
      ...prev,
      { key: nextKey(), ingredientId: ing.id, quantityGrams: 100 },
    ]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function updateQuantity(key: string, qty: number) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, quantityGrams: qty } : r))
    );
  }

  function buildPayload(status: "draft" | "published"): RecipeFormInput {
    return {
      title: title.trim(),
      servings,
      instructions: instructions.trim() || undefined,
      cuisine: cuisine.trim() || undefined,
      mealType: (mealType === "none" ? null : mealType || null) as RecipeFormInput["mealType"],
      status,
      ingredients: rows.map((r) => ({
        ingredientId: r.ingredientId,
        quantityGrams: r.quantityGrams,
      })),
    };
  }

  function handleSubmit(status: "draft" | "published") {
    if (!title.trim()) {
      setError(t("Title is required", lang));
      return;
    }
    if (rows.length === 0) {
      setError(t("Add at least one ingredient", lang));
      return;
    }
    setError(null);
    const start = status === "draft" ? startDraftTransition : startPublishTransition;
    start(async () => {
      try {
        const payload = buildPayload(status);
        const result = initialData
          ? await updateRecipe(initialData.id, payload)
          : await createRecipe(payload);

        if (!result.success) {
          setError(result.error);
          return;
        }
        router.push("/recipes");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  const isEditing = !!initialData;

  return (
    <div className="pb-24">
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Left: form ── */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Basic info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow space-y-5">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            {t("Recipe Details", lang)}
          </h2>

          <div className="space-y-1.5">
            <Label htmlFor="title">{t("Title", lang)}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("e.g. Grilled Chicken & Rice", lang)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="servings">{t("Servings", lang)}</Label>
              <Input
                id="servings"
                type="number"
                min={1}
                max={100}
                value={servings}
                onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cuisine">{t("Cuisine", lang)}</Label>
              <Input
                id="cuisine"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder={t("e.g. Mediterranean", lang)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("Meal Type", lang)}</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select meal type", lang)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="breakfast">{t("Breakfast", lang)}</SelectItem>
                <SelectItem value="lunch">{t("Lunch", lang)}</SelectItem>
                <SelectItem value="dinner">{t("Dinner", lang)}</SelectItem>
                <SelectItem value="snack">{t("Snack", lang)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instructions">{t("Instructions", lang)}</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t("Optional cooking instructions…", lang)}
              rows={4}
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                {t("Ingredients", lang)}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("Quantities are for all", lang)} {servings} {servings !== 1 ? t("serving plural", lang) : t("serving singular", lang)}
              </p>
            </div>
            <IngredientCombobox
              availableIngredients={availableIngredients}
              selectedIds={selectedIds}
              onSelect={addIngredient}
              lang={lang}
            />
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
              {t("No ingredients yet", lang)}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_100px_auto] gap-3 px-2 pb-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                <span>{t("Ingredients", lang)}</span>
                <span className="text-right">{t("Grams", lang)}</span>
                <span className="w-7" />
              </div>

              {rows.map((row) => {
                const ing = ingredientMap.get(row.ingredientId);
                if (!ing) return null;
                const macros = calcIngredientMacros(ing, row.quantityGrams);

                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-[1fr_100px_auto] gap-3 items-center px-2 py-1.5 rounded-lg hover:bg-slate-50 group"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{ing.name}</p>
                      <p className="text-xs text-slate-400 tabular-nums">
                        {fmtMacro(macros.calories)} kcal ·{" "}
                        <span className="text-blue-500">{fmtMacro(macros.protein)}g P</span> ·{" "}
                        <span className="text-amber-500">{fmtMacro(macros.carbs)}g C</span> ·{" "}
                        <span className="text-orange-500">{fmtMacro(macros.fat)}g F</span>
                      </p>
                    </div>
                    <QuantityInput
                      value={row.quantityGrams}
                      onChange={(v) => updateQuantity(row.key, v)}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all w-7 h-7 flex items-center justify-center rounded cursor-pointer"
                      aria-label="Remove ingredient"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* ── Right: macro summary ── */}
      <div className="lg:w-64 lg:shrink-0">
        <div className="lg:sticky lg:top-8">
          <MacroSummary rows={rows} ingredientMap={ingredientMap} servings={servings} lang={lang} />

          {isEditing && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-400 mb-2">{t("Status", lang)}</p>
              <Badge
                className={cn(
                  "text-xs font-medium",
                  initialData.status === "published"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : initialData.status === "archived"
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                )}
                variant="outline"
              >
                {tStatus(initialData.status, lang)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ── Sticky action bar ── */}
    <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 py-4 mt-6 px-4 sm:px-0 flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/recipes")}
        disabled={isAnySavePending}
      >
        {t("Cancel", lang)}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSubmit("draft")}
        disabled={isAnySavePending}
      >
        {isDraftPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
        {t("Save Draft", lang)}
      </Button>
      <Button
        type="button"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        onClick={() => handleSubmit("published")}
        disabled={isAnySavePending}
      >
        {isPublishPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
        {t("Publish", lang)}
      </Button>
    </div>
    </div>
  );
}
