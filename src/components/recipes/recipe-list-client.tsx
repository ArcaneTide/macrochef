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
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  archived: "bg-red-100 text-red-700 border-red-200",
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
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
  if (value <= 0) return <span className="text-slate-300">—</span>;
  return (
    <span className={cn("tabular-nums font-medium", color)}>
      {fmtMacro(value)}
      {suffix}
    </span>
  );
}

export function RecipeListClient({ recipes }: { recipes: RecipeListItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search recipes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 sm:ml-auto whitespace-nowrap">
          {filtered.length} recipe{filtered.length !== 1 ? "s" : ""}
        </p>
        <Link href="/recipes/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
            <Plus className="h-4 w-4" />
            New Recipe
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          {recipes.length === 0 ? (
            <div className="space-y-3">
              <p>No recipes yet.</p>
              <Link href="/recipes/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                  <Plus className="h-4 w-4" />
                  Create your first recipe
                </Button>
              </Link>
            </div>
          ) : (
            <p>No recipes match your filters.</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Desktop table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 w-[280px]">Title</th>
                <th className="text-left px-4 py-3">Type / Cuisine</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Calories</th>
                <th className="text-right px-4 py-3">Protein</th>
                <th className="text-right px-4 py-3">Carbs</th>
                <th className="text-right px-4 py-3">Fat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((recipe) => (
                <tr
                  key={recipe.id}
                  className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                  onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{recipe.title}</p>
                    <p className="text-xs text-slate-400">
                      {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""} ·{" "}
                      {recipe.ingredientCount} ingredient{recipe.ingredientCount !== 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {recipe.mealType
                      ? MEAL_TYPE_LABELS[recipe.mealType] ?? recipe.mealType
                      : null}
                    {recipe.mealType && recipe.cuisine ? (
                      <span className="text-slate-300 mx-1">·</span>
                    ) : null}
                    {recipe.cuisine ?? (!recipe.mealType ? <span className="text-slate-300">—</span> : null)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium border capitalize",
                        STATUS_STYLES[recipe.status] ?? STATUS_STYLES.draft
                      )}
                    >
                      {recipe.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <MacroCell
                      value={recipe.macrosPerServing.calories}
                      color="text-slate-600"
                      suffix=" kcal"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <MacroCell value={recipe.macrosPerServing.protein} color="text-blue-600" />
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <MacroCell value={recipe.macrosPerServing.carbs} color="text-amber-600" />
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <MacroCell value={recipe.macrosPerServing.fat} color="text-orange-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filtered.map((recipe) => (
              <div
                key={recipe.id}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-medium text-slate-900">{recipe.title}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border capitalize shrink-0",
                      STATUS_STYLES[recipe.status] ?? STATUS_STYLES.draft
                    )}
                  >
                    {recipe.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
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
                      color: "text-slate-700",
                      suffix: "",
                    },
                    {
                      label: "P",
                      value: recipe.macrosPerServing.protein,
                      color: "text-blue-600",
                      suffix: "g",
                    },
                    {
                      label: "C",
                      value: recipe.macrosPerServing.carbs,
                      color: "text-amber-600",
                      suffix: "g",
                    },
                    {
                      label: "F",
                      value: recipe.macrosPerServing.fat,
                      color: "text-orange-600",
                      suffix: "g",
                    },
                  ].map(({ label, value, color, suffix }) => (
                    <div key={label}>
                      <p className={cn("font-medium tabular-nums", color)}>
                        {value > 0 ? `${fmtMacro(value)}${suffix}` : "—"}
                      </p>
                      <p className="text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400 bg-slate-50">
            All macros per serving
          </div>
        </div>
      )}
    </div>
  );
}
