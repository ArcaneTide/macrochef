import { db } from "@/lib/db";
import { IngredientClient } from "@/components/ingredients/ingredient-client";
import { ShieldCheck } from "lucide-react";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "Ingredients — MacroLock" };

export default async function IngredientsPage() {
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
        isVerified: true,
      },
    }),
    getLang(),
  ]);

  const verifiedCount = ingredients.filter((i) => i.isVerified).length;

  return (
    <div className="py-5 sm:py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-[#F5F1EB] whitespace-nowrap">{t("Ingredient Library", lang)}</h1>
          <span className="flex items-center gap-1 rounded-full bg-[#EDF1EB] px-2.5 py-0.5 text-xs font-medium text-[#5A6B4F] border border-[#c5d0bf]">
            <ShieldCheck className="h-3 w-3" />
            {verifiedCount} {t("USDA verified", lang)}
          </span>
        </div>
        <p className="text-slate-500 dark:text-[#A0998E] text-sm">
          {ingredients.length} {ingredients.length !== 1 ? t("ingredient plural", lang) : t("ingredient singular", lang)} · {t("Read-only library", lang)}
        </p>
      </div>

      <IngredientClient ingredients={ingredients} lang={lang} />
    </div>
  );
}
