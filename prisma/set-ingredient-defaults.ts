/**
 * Data migration: set sensible defaultUnit + defaultQuantity for all ingredients.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/set-ingredient-defaults.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type DefaultRule = { unit: string; quantity: number };

function getDefaults(name: string, category: string): DefaultRule {
  const n = name.toLowerCase();

  // ── Eggs ────────────────────────────────────────────────
  if (n.includes("egg")) return { unit: "piece", quantity: 1 };

  // ── Seasonings / spices ─────────────────────────────────
  if (category === "seasoning") return { unit: "pinch", quantity: 1 };

  // ── Small-amount liquids ─────────────────────────────────
  if (
    n.includes("olive oil") || n.includes("oil") ||
    n.includes("vinegar") || n.includes("balsamic") ||
    n.includes("lemon juice") || n.includes("lime juice") ||
    n.includes("soy sauce") || n.includes("honey") ||
    n.includes("maple syrup") || n.includes("worcestershire") ||
    n.includes("hot sauce") || n.includes("fish sauce")
  ) return { unit: "tbsp", quantity: 1 };

  // ── Butter ──────────────────────────────────────────────
  if (n.includes("butter")) return { unit: "g", quantity: 10 };

  // ── Protein powder / whey ───────────────────────────────
  if (n.includes("protein powder") || n.includes("whey") || n.includes("protein shake"))
    return { unit: "g", quantity: 30 };

  // ── Cheese ──────────────────────────────────────────────
  if (n.includes("cheese") || n.includes("parmesan") || n.includes("feta") || n.includes("mozzarella"))
    return { unit: "g", quantity: 30 };

  // ── Nuts & seeds ────────────────────────────────────────
  if (
    n.includes("nut") || n.includes("almond") || n.includes("walnut") ||
    n.includes("cashew") || n.includes("pistachio") || n.includes("pecan") ||
    n.includes("seed") || n.includes("sesame") || n.includes("flax") ||
    n.includes("chia") || n.includes("hemp") || n.includes("sunflower") ||
    n.includes("pumpkin seed") || n.includes("pine nut")
  ) return { unit: "g", quantity: 20 };

  // ── Dry grains / legumes ─────────────────────────────────
  if (
    (n.includes("rice") && !n.includes("cooked")) ||
    (n.includes("pasta") && !n.includes("cooked")) ||
    (n.includes("oat") && !n.includes("cooked")) ||
    n.includes("quinoa") || n.includes("lentil") ||
    n.includes("chickpea") || n.includes("bean") || n.includes("bulgur") ||
    n.includes("couscous") || n.includes("barley")
  ) return { unit: "g", quantity: 80 };

  // ── Cooked grains ────────────────────────────────────────
  if (
    (n.includes("rice") && n.includes("cooked")) ||
    (n.includes("pasta") && n.includes("cooked")) ||
    (n.includes("oat") && n.includes("cooked"))
  ) return { unit: "g", quantity: 150 };

  // ── Meat / fish / poultry ────────────────────────────────
  if (category === "protein") return { unit: "g", quantity: 150 };

  // ── Dairy: milk / yogurt ─────────────────────────────────
  if (
    n.includes("milk") || n.includes("yogurt") || n.includes("yoghurt") ||
    n.includes("kefir") || n.includes("cream")
  ) return { unit: "g", quantity: 100 };

  // ── Everything else in dairy ─────────────────────────────
  if (category === "dairy") return { unit: "g", quantity: 100 };

  // ── Vegetables ──────────────────────────────────────────
  if (category === "vegetable") return { unit: "g", quantity: 100 };

  // ── Fruit ───────────────────────────────────────────────
  if (category === "fruit") return { unit: "g", quantity: 100 };

  // ── Fat category (oils already caught above) ─────────────
  if (category === "fat") return { unit: "g", quantity: 15 };

  // ── Carb category (grains already caught above) ──────────
  if (category === "carb") return { unit: "g", quantity: 80 };

  // ── Default ─────────────────────────────────────────────
  return { unit: "g", quantity: 100 };
}

async function main() {
  const ingredients = await prisma.ingredient.findMany({
    select: { id: true, name: true, category: true },
  });

  console.log(`Setting defaults for ${ingredients.length} ingredients…`);

  let updated = 0;
  for (const ing of ingredients) {
    const { unit, quantity } = getDefaults(ing.name, ing.category);
    await prisma.ingredient.update({
      where: { id: ing.id },
      data: { defaultUnit: unit, defaultQuantity: quantity },
    });
    updated++;
    if (updated % 20 === 0) console.log(`  ${updated}/${ingredients.length}`);
  }

  console.log(`Done. Updated ${updated} ingredients.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
