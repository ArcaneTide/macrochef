import { db } from "@/lib/db";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "New Recipe — MacroPie" };

export default async function NewRecipePage() {
  const [ingredients, lang] = await Promise.all([
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
    getLang(),
  ]);

  return (
    <div className="py-5 sm:py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-[#F5F1EB]">{t("New Recipe", lang)}</h1>
        <p className="text-slate-500 dark:text-[#A0998E] text-sm mt-1">{t("Build a macro-accurate recipe", lang)}</p>
      </div>
      <RecipeForm availableIngredients={ingredients} lang={lang} />
    </div>
  );
}
