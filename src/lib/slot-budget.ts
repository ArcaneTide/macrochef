import type { MacroTotals } from "@/lib/macros";

export type SlotBudgets = Record<string, MacroTotals>;

const SERVING_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

// Steps used by autoBalanceDay (0.75–2.0 only)
const BALANCE_STEPS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

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

function balanceScore(total: MacroTotals, target: MacroTotals): number {
  return (
    0.4  * Math.abs(total.calories - target.calories) / (target.calories || 1) +
    0.3  * Math.abs(total.protein  - target.protein)  / (target.protein  || 1) +
    0.15 * Math.abs(total.carbs    - target.carbs)    / (target.carbs    || 1) +
    0.15 * Math.abs(total.fat      - target.fat)      / (target.fat      || 1)
  );
}

/**
 * Finds the optimal servings for each recipe in a day so total macros are as
 * close as possible to dailyTarget.
 * Steps: 0.75–2.0, step 0.25. Brute-force for ≤4 recipes; coordinate-descent
 * for 5+.
 */
export function autoBalanceDay(
  recipes: Array<{ macrosPerServing: MacroTotals }>,
  dailyTarget: MacroTotals
): number[] {
  const n = recipes.length;
  if (n === 0) return [];

  if (n <= 4) {
    let best: number[] = new Array(n).fill(1.0);
    let bestScore = Infinity;
    const cur = new Array(n).fill(0) as number[];

    function recurse(idx: number, acc: MacroTotals) {
      if (idx === n) {
        const s = balanceScore(acc, dailyTarget);
        if (s < bestScore) { bestScore = s; best = [...cur]; }
        return;
      }
      const m = recipes[idx].macrosPerServing;
      for (const sv of BALANCE_STEPS) {
        cur[idx] = sv;
        recurse(idx + 1, {
          calories: acc.calories + m.calories * sv,
          protein:  acc.protein  + m.protein  * sv,
          carbs:    acc.carbs    + m.carbs    * sv,
          fat:      acc.fat      + m.fat      * sv,
        });
      }
    }

    recurse(0, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    return best;
  }

  // Coordinate descent (2 rounds) for 5+ recipes
  const servings = new Array(n).fill(1.0) as number[];
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < n; i++) {
      const others = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const m = recipes[j].macrosPerServing;
        const s = servings[j];
        others.calories += m.calories * s;
        others.protein  += m.protein  * s;
        others.carbs    += m.carbs    * s;
        others.fat      += m.fat      * s;
      }
      const mi = recipes[i].macrosPerServing;
      let bestS = servings[i];
      let bestScore = Infinity;
      for (const sv of BALANCE_STEPS) {
        const score = balanceScore({
          calories: others.calories + mi.calories * sv,
          protein:  others.protein  + mi.protein  * sv,
          carbs:    others.carbs    + mi.carbs    * sv,
          fat:      others.fat      + mi.fat      * sv,
        }, dailyTarget);
        if (score < bestScore) { bestScore = score; bestS = sv; }
      }
      servings[i] = bestS;
    }
  }
  return servings;
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
