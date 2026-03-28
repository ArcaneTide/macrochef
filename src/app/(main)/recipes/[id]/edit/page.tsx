import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { ArchiveRecipeButton } from "@/components/recipes/archive-recipe-button";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "Edit Recipe — MacroLock" };

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, lang] = await Promise.all([auth(), getLang()]);
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
        nameEl: true,
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
      unit: ri.unit,
    })),
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="mb-6">
        <nav className="flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500 mb-1.5">
          <a href="/recipes" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{t("Recipes", lang)}</a>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[200px]">{recipe.title}</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-slate-100">{t("Edit Recipe", lang)}</h1>
          <div className="shrink-0 pt-1">
            <ArchiveRecipeButton id={recipe.id} title={recipe.title} lang={lang} />
          </div>
        </div>
      </div>
      <RecipeForm availableIngredients={ingredients} initialData={initialData} lang={lang} />
    </div>
  );
}
