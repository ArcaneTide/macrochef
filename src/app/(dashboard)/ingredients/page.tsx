import { db } from "@/lib/db";
import { IngredientClient } from "@/components/ingredients/ingredient-client";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Ingredients — MacroChef" };

export default async function IngredientsPage() {
  const ingredients = await db.ingredient.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      caloriesPer100g: true,
      proteinPer100g: true,
      carbsPer100g: true,
      fatPer100g: true,
      isVerified: true,
    },
  });

  const verifiedCount = ingredients.filter((i) => i.isVerified).length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Ingredient Library</h1>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3 w-3" />
            {verifiedCount} USDA verified
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          {ingredients.length} ingredients · All nutrition values are per 100g · Read-only library
        </p>
      </div>

      <IngredientClient ingredients={ingredients} />
    </div>
  );
}
