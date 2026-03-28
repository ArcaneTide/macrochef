"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/translations";

type IngredientCategory =
  | "protein"
  | "carb"
  | "fat"
  | "vegetable"
  | "fruit"
  | "dairy"
  | "seasoning"
  | "other";

interface Ingredient {
  id: string;
  name: string;
  nameEl: string | null;
  category: IngredientCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  isVerified: boolean;
}

type SortKey = "name" | "caloriesPer100g" | "proteinPer100g" | "carbsPer100g" | "fatPer100g";

const CATEGORY_STYLES: Record<IngredientCategory, string> = {
  protein: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  carb: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  fat: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  vegetable: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  fruit: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
  dairy: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  seasoning: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600",
  other: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600",
};

const CATEGORIES = ["protein", "carb", "fat", "vegetable", "fruit", "dairy", "seasoning", "other"] as IngredientCategory[];

function fmt(n: number) {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1);
}

interface Props {
  ingredients: Ingredient[];
  lang: Lang;
}

export function IngredientClient({ ingredients, lang }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<IngredientCategory | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const CATEGORY_LABELS: Record<IngredientCategory, string> = {
    protein: t("cat:protein", lang),
    carb: t("cat:carb", lang),
    fat: t("cat:fat", lang),
    vegetable: t("cat:vegetable", lang),
    fruit: t("cat:fruit", lang),
    dairy: t("cat:dairy", lang),
    seasoning: t("cat:seasoning", lang),
    other: t("cat:other", lang),
  };

  function ingName(i: Ingredient) {
    return lang === "el" ? (i.nameEl ?? i.name) : i.name;
  }

  const filtered = useMemo(() => {
    let list = ingredients;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        (i.nameEl ?? "").toLowerCase().includes(q)
      );
    }
    if (category !== "all") {
      list = list.filter((i) => i.category === category);
    }
    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [ingredients, search, category, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  function SortButton({ col }: { col: SortKey }) {
    const active = sortKey === col;
    return (
      <button
        onClick={() => toggleSort(col)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors",
          active ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-500 dark:text-slate-400"
        )}
      >
        <ArrowUpDown className="h-3 w-3" />
        {active && (sortDir === "asc" ? "↑" : "↓")}
      </button>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            placeholder={t("Search ingredients…", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as IngredientCategory | "all")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("All categories", lang)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All categories", lang)}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400 sm:ml-auto whitespace-nowrap">
          {filtered.length} {filtered.length !== 1 ? t("ingredient plural", lang) : t("ingredient singular", lang)}
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <TableHead className="w-[280px]">
                <span className="flex items-center gap-2">
                  {t("Name", lang)} <SortButton col="name" />
                </span>
              </TableHead>
              <TableHead>{t("Category", lang)}</TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-2">
                  {t("Calories", lang)} <SortButton col="caloriesPer100g" />
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-2">
                  {t("Protein", lang)} <SortButton col="proteinPer100g" />
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-2">
                  {t("Carbs", lang)} <SortButton col="carbsPer100g" />
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-2">
                  {t("Fat", lang)} <SortButton col="fatPer100g" />
                </span>
              </TableHead>
              <TableHead className="w-12 text-center">USDA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">
                  {t("No ingredients found", lang)}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ing) => (
                <TableRow key={ing.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 even:bg-slate-50/30 dark:even:bg-slate-700/20">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{ingName(ing)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium border", CATEGORY_STYLES[ing.category])}
                    >
                      {CATEGORY_LABELS[ing.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400 tabular-nums">
                    {fmt(ing.caloriesPer100g)} kcal
                  </TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400 tabular-nums">
                    {fmt(ing.proteinPer100g)}g
                  </TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400 tabular-nums">
                    {fmt(ing.carbsPer100g)}g
                  </TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400 tabular-nums">
                    {fmt(ing.fatPer100g)}g
                  </TableCell>
                  <TableCell className="text-center">
                    {ing.isVerified && (
                      <ShieldCheck className="h-4 w-4 text-emerald-500 mx-auto" aria-label="USDA verified" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50">
          {t("All values per 100g", lang)}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-slate-400 dark:text-slate-500">{t("No ingredients found", lang)}</p>
        ) : (
          filtered.map((ing) => (
            <div
              key={ing.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{ingName(ing)}</span>
                  {ing.isVerified && (
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-label="USDA verified" />
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-medium border shrink-0", CATEGORY_STYLES[ing.category])}
                >
                  {CATEGORY_LABELS[ing.category]}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="text-center">
                  <p className="text-slate-400 dark:text-slate-500 text-xs">{t("Calories", lang)}</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{fmt(ing.caloriesPer100g)}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 dark:text-slate-500 text-xs">{t("Protein", lang)}</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{fmt(ing.proteinPer100g)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 dark:text-slate-500 text-xs">{t("Carbs", lang)}</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{fmt(ing.carbsPer100g)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 dark:text-slate-500 text-xs">{t("Fat", lang)}</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{fmt(ing.fatPer100g)}g</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
