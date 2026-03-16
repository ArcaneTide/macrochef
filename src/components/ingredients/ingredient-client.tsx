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
  category: IngredientCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  isVerified: boolean;
}

type SortKey = "name" | "caloriesPer100g" | "proteinPer100g" | "carbsPer100g" | "fatPer100g";

const CATEGORY_STYLES: Record<IngredientCategory, string> = {
  protein: "bg-blue-100 text-blue-700 border-blue-200",
  carb: "bg-amber-100 text-amber-700 border-amber-200",
  fat: "bg-orange-100 text-orange-700 border-orange-200",
  vegetable: "bg-green-100 text-green-700 border-green-200",
  fruit: "bg-pink-100 text-pink-700 border-pink-200",
  dairy: "bg-purple-100 text-purple-700 border-purple-200",
  seasoning: "bg-slate-100 text-slate-600 border-slate-200",
  other: "bg-slate-100 text-slate-500 border-slate-200",
};

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  protein: "Protein",
  carb: "Carb",
  fat: "Fat",
  vegetable: "Vegetable",
  fruit: "Fruit",
  dairy: "Dairy",
  seasoning: "Seasoning",
  other: "Other",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as IngredientCategory[];

function fmt(n: number) {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1);
}

interface Props {
  ingredients: Ingredient[];
}

export function IngredientClient({ ingredients }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<IngredientCategory | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let list = ingredients;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
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
          "inline-flex items-center gap-1 hover:text-slate-900 transition-colors",
          active ? "text-slate-900 font-semibold" : "text-slate-500"
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
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search ingredients…"
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
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 sm:ml-auto whitespace-nowrap">
          {filtered.length} ingredient{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[280px]">
                <span className="flex items-center gap-2">
                  Name <SortButton col="name" />
                </span>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-2">
                  Calories <SortButton col="caloriesPer100g" />
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-2">
                  Protein <SortButton col="proteinPer100g" />
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-2">
                  Carbs <SortButton col="carbsPer100g" />
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-2">
                  Fat <SortButton col="fatPer100g" />
                </span>
              </TableHead>
              <TableHead className="w-12 text-center">USDA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  No ingredients found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ing) => (
                <TableRow key={ing.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{ing.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium border", CATEGORY_STYLES[ing.category])}
                    >
                      {CATEGORY_LABELS[ing.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-600 tabular-nums">
                    {fmt(ing.caloriesPer100g)} kcal
                  </TableCell>
                  <TableCell className="text-right text-slate-600 tabular-nums">
                    {fmt(ing.proteinPer100g)}g
                  </TableCell>
                  <TableCell className="text-right text-slate-600 tabular-nums">
                    {fmt(ing.carbsPer100g)}g
                  </TableCell>
                  <TableCell className="text-right text-slate-600 tabular-nums">
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
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400 bg-slate-50">
          All values per 100g
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-slate-400">No ingredients found.</p>
        ) : (
          filtered.map((ing) => (
            <div
              key={ing.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-900">{ing.name}</span>
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
                  <p className="text-slate-400 text-xs">Calories</p>
                  <p className="font-medium text-slate-700 tabular-nums">{fmt(ing.caloriesPer100g)}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Protein</p>
                  <p className="font-medium text-slate-700 tabular-nums">{fmt(ing.proteinPer100g)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Carbs</p>
                  <p className="font-medium text-slate-700 tabular-nums">{fmt(ing.carbsPer100g)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Fat</p>
                  <p className="font-medium text-slate-700 tabular-nums">{fmt(ing.fatPer100g)}g</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
