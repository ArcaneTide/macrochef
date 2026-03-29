"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fmtMacro } from "@/lib/macros";
import { t, tStatus, type Lang } from "@/lib/translations";

export type RecipeListItem = {
  id: string;
  title: string;
  cuisine: string | null;
  mealType: string | null;
  status: string;
  servings: number;
  ingredientCount: number;
  macrosPerServing: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#E8E0D4] text-[#4A4A4A] border-[#d4c8bc]",
  published: "bg-[#7A8B6F] text-white border-[#6A7B5F]",
  archived: "bg-slate-100 text-slate-400 border-slate-200",
};

function MacroCell({
  value,
  color,
  suffix = "g",
}: {
  value: number;
  color: string;
  suffix?: string;
}) {
  if (value <= 0) return <span className="text-slate-300 dark:text-[#4A4A4A]">—</span>;
  return (
    <span className={cn("tabular-nums font-medium", color)}>
      {fmtMacro(value)}
      {suffix}
    </span>
  );
}

export function RecipeListClient({ recipes, lang }: { recipes: RecipeListItem[]; lang: Lang }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const MEAL_TYPE_LABELS: Record<string, string> = {
    breakfast: t("Breakfast", lang),
    lunch: t("Lunch", lang),
    dinner: t("Dinner", lang),
    snack: t("Snack", lang),
  };

  const filtered = useMemo(() => {
    let list = recipes;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    if (statusFilter === "archived") {
      list = list.filter((r) => r.status === "archived");
    } else if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    } else {
      // "all" excludes archived by default; use the "Archived" filter to see them
      list = list.filter((r) => r.status !== "archived");
    }
    return list;
  }, [recipes, search, statusFilter]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder={t("Search recipes…", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All statuses", lang)}</SelectItem>
            <SelectItem value="draft">{t("Draft", lang)}</SelectItem>
            <SelectItem value="published">{t("Published", lang)}</SelectItem>
            <SelectItem value="archived">{t("Archived", lang)}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-[#A0998E] sm:ml-auto whitespace-nowrap hidden sm:block">
          {filtered.length} {filtered.length !== 1 ? t("recipe plural", lang) : t("recipe singular", lang)}
        </p>
        <Link href="/recipes/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[#7A8B6F] hover:bg-[#6A7B5F] text-white gap-1.5">
            <Plus className="h-4 w-4" />
            {t("New Recipe", lang)}
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-[#6A6460]">
          {recipes.length === 0 ? (
            <div className="space-y-3">
              <p>{t("No recipes yet", lang)}</p>
              <Link href="/recipes/new">
                <Button className="bg-[#7A8B6F] hover:bg-[#6A7B5F] text-white gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t("Create your first recipe", lang)}
                </Button>
              </Link>
            </div>
          ) : (
            <p>{t("No recipes match filters", lang)}</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] overflow-hidden shadow">
          {/* Desktop table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b border-[#E8E0D4] dark:border-[#3A3A3A] bg-slate-50 dark:bg-[#1E1E1E] text-xs font-medium text-slate-500 dark:text-[#A0998E] uppercase tracking-wide">
                <th className="text-left px-4 py-3 w-[280px]">{t("Title", lang)}</th>
                <th className="text-left px-4 py-3">{t("Type / Cuisine", lang)}</th>
                <th className="text-left px-4 py-3">{t("Status", lang)}</th>
                <th className="text-right px-4 py-3">{t("Calories", lang)}</th>
                <th className="text-right px-4 py-3">{t("Protein", lang)}</th>
                <th className="text-right px-4 py-3">{t("Carbs", lang)}</th>
                <th className="text-right px-4 py-3">{t("Fat", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E0D4] dark:divide-[#3A3A3A]">
              {filtered.map((recipe) => (
                <tr
                  key={recipe.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-[#2A2A2A] cursor-pointer transition-colors even:bg-slate-50/30 dark:even:bg-[#1E1E1E]/30"
                  onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-[#F5F1EB]">{recipe.title}</p>
                    <p className="text-xs text-slate-400 dark:text-[#6A6460]">
                      {recipe.servings} {recipe.servings !== 1 ? t("serving plural", lang) : t("serving singular", lang)} ·{" "}
                      {recipe.ingredientCount} {recipe.ingredientCount !== 1 ? t("ingredient plural", lang) : t("ingredient singular", lang)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-[#A0998E]">
                    {recipe.mealType
                      ? MEAL_TYPE_LABELS[recipe.mealType] ?? recipe.mealType
                      : null}
                    {recipe.mealType && recipe.cuisine ? (
                      <span className="text-slate-300 dark:text-[#4A4A4A] mx-1">·</span>
                    ) : null}
                    {recipe.cuisine ?? (!recipe.mealType ? <span className="text-slate-300 dark:text-[#4A4A4A]">—</span> : null)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium border",
                        STATUS_STYLES[recipe.status] ?? STATUS_STYLES.draft
                      )}
                    >
                      {tStatus(recipe.status, lang)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <MacroCell
                      value={recipe.macrosPerServing.calories}
                      color="text-slate-600 dark:text-[#A0998E]"
                      suffix=" kcal"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <MacroCell value={recipe.macrosPerServing.protein} color="text-[#5A6B4F]" />
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <MacroCell value={recipe.macrosPerServing.carbs} color="text-[#B8907A]" />
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <MacroCell value={recipe.macrosPerServing.fat} color="text-[#C4724E]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-[#E8E0D4] dark:divide-[#3A3A3A]">
            {filtered.map((recipe) => (
              <div
                key={recipe.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-medium text-slate-900 dark:text-[#F5F1EB]">{recipe.title}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border shrink-0",
                      STATUS_STYLES[recipe.status] ?? STATUS_STYLES.draft
                    )}
                  >
                    {tStatus(recipe.status, lang)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 dark:text-[#6A6460] mb-3">
                  {recipe.servings} {recipe.servings !== 1 ? t("serving plural", lang) : t("serving singular", lang)}
                  {recipe.mealType
                    ? ` · ${MEAL_TYPE_LABELS[recipe.mealType] ?? recipe.mealType}`
                    : ""}
                  {recipe.cuisine ? ` · ${recipe.cuisine}` : ""}
                </p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    {
                      label: "Kcal",
                      value: recipe.macrosPerServing.calories,
                      color: "text-slate-700 dark:text-[#A0998E]",
                      suffix: "",
                    },
                    {
                      label: "P",
                      value: recipe.macrosPerServing.protein,
                      color: "text-[#5A6B4F]",
                      suffix: "g",
                    },
                    {
                      label: "C",
                      value: recipe.macrosPerServing.carbs,
                      color: "text-[#B8907A]",
                      suffix: "g",
                    },
                    {
                      label: "F",
                      value: recipe.macrosPerServing.fat,
                      color: "text-[#C4724E]",
                      suffix: "g",
                    },
                  ].map(({ label, value, color, suffix }) => (
                    <div key={label}>
                      <p className={cn("font-medium tabular-nums", color)}>
                        {value > 0 ? `${fmtMacro(value)}${suffix}` : "—"}
                      </p>
                      <p className="text-slate-400 dark:text-[#6A6460]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E8E0D4] dark:border-[#3A3A3A] px-4 py-2 text-xs text-slate-400 dark:text-[#6A6460] bg-slate-50 dark:bg-[#1E1E1E]">
            {t("All macros per serving", lang)}
          </div>
        </div>
      )}
    </div>
  );
}
