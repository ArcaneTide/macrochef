import type { MacroTotals } from "@/lib/macros";

export type SlotBudgets = Record<string, MacroTotals>;

const SERVING_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];

/**
 * Returns the serving multiplier (0.5–3.0, step 0.25) that minimises weighted
 * distance from slotBudget.
 * Weights: calories 40%, protein 30%, carbs 15%, fat 15%.
 */
export function suggestServings(
  recipeMacrosPerServing: MacroTotals,
  slotBudget: MacroTotals
): number {
  let best = 1.0;
  let bestScore = Infinity;

  for (const s of SERVING_STEPS) {
    const score =
      0.4 * Math.abs(recipeMacrosPerServing.calories * s - slotBudget.calories) /
        (slotBudget.calories || 1) +
      0.3 * Math.abs(recipeMacrosPerServing.protein * s - slotBudget.protein) /
        (slotBudget.protein || 1) +
      0.15 * Math.abs(recipeMacrosPerServing.carbs * s - slotBudget.carbs) /
        (slotBudget.carbs || 1) +
      0.15 * Math.abs(recipeMacrosPerServing.fat * s - slotBudget.fat) /
        (slotBudget.fat || 1);
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
  }

  return best;
}

/**
 * Compute per-slot macro budgets from daily targets.
 * If slotDistribution is null, splits equally across activeSlots.
 * If slotDistribution is provided, uses those percentages (expected to sum to 100).
 */
export function computeSlotBudgets(
  targets: {
    calorieTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
  },
  activeSlots: string[],
  slotDistribution: Record<string, number> | null
): SlotBudgets {
  if (activeSlots.length === 0) return {};
  const result: SlotBudgets = {};
  for (const slot of activeSlots) {
    const pct = slotDistribution
      ? (slotDistribution[slot] ?? 0) / 100
      : 1 / activeSlots.length;
    result[slot] = {
      calories: Math.round(targets.calorieTarget * pct),
      protein: Math.round(targets.proteinTarget * pct * 10) / 10,
      carbs: Math.round(targets.carbsTarget * pct * 10) / 10,
      fat: Math.round(targets.fatTarget * pct * 10) / 10,
    };
  }
  return result;
}
