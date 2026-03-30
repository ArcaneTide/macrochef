import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { calcRecipeMacrosPerServing } from "@/lib/macros";
import { RecipeListClient } from "@/components/recipes/recipe-list-client";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "Recipes — MacroΠie" };

export default async function RecipesPage() {
  const [session, lang] = await Promise.all([auth(), getLang()]);
  if (!session?.user?.id) redirect("/login");

  const recipes = await db.recipe.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      ingredients: {
        include: { ingredient: true },
      },
    },
  });

  const recipeItems = recipes.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    cuisine: recipe.cuisine,
    mealType: recipe.mealType as string | null,
    status: recipe.status as string,
    servings: recipe.servings,
    ingredientCount: recipe.ingredients.length,
    macrosPerServing: calcRecipeMacrosPerServing(
      recipe.ingredients.map((ri) => ({
        ingredient: ri.ingredient,
        quantityGrams: ri.quantityGrams,
      })),
      recipe.servings
    ),
  }));

  return (
    <div className="py-5 sm:py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-[#F5F1EB]">{t("Recipes", lang)}</h1>
        <p className="text-slate-500 dark:text-[#A0998E] text-sm mt-1">
          {t("Recipes page description", lang)}
        </p>
      </div>
      <RecipeListClient recipes={recipeItems} lang={lang} />
    </div>
  );
}
