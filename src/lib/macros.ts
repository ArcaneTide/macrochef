export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type IngredientNutrition = {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

export function calcIngredientMacros(
  ingredient: IngredientNutrition,
  quantityGrams: number
): MacroTotals {
  const f = quantityGrams / 100;
  return {
    calories: ingredient.caloriesPer100g * f,
    protein: ingredient.proteinPer100g * f,
    carbs: ingredient.carbsPer100g * f,
    fat: ingredient.fatPer100g * f,
  };
}

export function calcRecipeMacrosPerServing(
  items: Array<{ ingredient: IngredientNutrition; quantityGrams: number }>,
  servings: number
): MacroTotals {
  if (!items.length || servings <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  const totals = items.reduce(
    (acc, { ingredient, quantityGrams }) => {
      const m = calcIngredientMacros(ingredient, quantityGrams);
      return {
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    calories: totals.calories / servings,
    protein: totals.protein / servings,
    carbs: totals.carbs / servings,
    fat: totals.fat / servings,
  };
}

/** Calories contributed by macros (protein/carbs = 4 kcal/g, fat = 9 kcal/g) */
export function macroCalorieSplit(macros: MacroTotals) {
  const proteinCal = macros.protein * 4;
  const carbsCal = macros.carbs * 4;
  const fatCal = macros.fat * 9;
  const total = proteinCal + carbsCal + fatCal;
  if (total === 0) return { proteinPct: 0, carbsPct: 0, fatPct: 0 };
  return {
    proteinPct: (proteinCal / total) * 100,
    carbsPct: (carbsCal / total) * 100,
    fatPct: (fatCal / total) * 100,
  };
}

export function fmtMacro(n: number): string {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1);
}

/** Fit score thresholds: score >= GREEN is good, >= AMBER is acceptable, below is poor */
export const FIT_SCORE_GREEN = 95;
export const FIT_SCORE_AMBER = 90;

/** Fit score: 0–100. deviation = |actual - target| / target per macro, score = max(0, round((1 - mean) × 100)) */
export function calcFitScore(actual: MacroTotals, target: MacroTotals): number {
  const macros: Array<keyof MacroTotals> = ["calories", "protein", "carbs", "fat"];
  const deviations = macros.map((k) => {
    if (target[k] === 0) return actual[k] > 0 ? 1.0 : 0;
    return Math.abs(actual[k] - target[k]) / target[k];
  });
  const mean = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  return Math.max(0, Math.round((1 - mean) * 100));
}
