import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { ArchiveRecipeButton } from "@/components/recipes/archive-recipe-button";

export const metadata = { title: "Edit Recipe — MacroChef" };

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [recipe, ingredients] = await Promise.all([
    db.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    db.ingredient.findMany({
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
    }),
  ]);

  if (!recipe || recipe.userId !== session.user.id) {
    notFound();
  }

  const initialData = {
    id: recipe.id,
    title: recipe.title,
    servings: recipe.servings,
    instructions: recipe.instructions,
    cuisine: recipe.cuisine,
    mealType: recipe.mealType as string | null,
    status: recipe.status as string,
    ingredients: recipe.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      quantityGrams: ri.quantityGrams,
    })),
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900">Edit Recipe</h1>
          <p className="text-slate-500 text-sm mt-1 truncate">{recipe.title}</p>
        </div>
        <div className="shrink-0 pt-1">
          <ArchiveRecipeButton id={recipe.id} title={recipe.title} />
        </div>
      </div>
      <RecipeForm availableIngredients={ingredients} initialData={initialData} />
    </div>
  );
}
