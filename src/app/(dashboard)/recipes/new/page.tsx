import { db } from "@/lib/db";
import { RecipeForm } from "@/components/recipes/recipe-form";

export const metadata = { title: "New Recipe — MacroChef" };

export default async function NewRecipePage() {
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
    },
  });

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">New Recipe</h1>
        <p className="text-slate-500 text-sm mt-1">Build a macro-accurate recipe</p>
      </div>
      <RecipeForm availableIngredients={ingredients} />
    </div>
  );
}
