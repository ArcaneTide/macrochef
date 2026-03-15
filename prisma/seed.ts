import { PrismaClient } from '@prisma/client';
import ingredients from './ingredients-seed.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ingredients...');
  
  let count = 0;
  for (const ing of ingredients) {
    await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {},
      create: {
        name: ing.name,
        usdaFdcId: ing.usda_fdc_id,
        category: ing.category as any,
        caloriesPer100g: ing.calories_per_100g,
        proteinPer100g: ing.protein_per_100g,
        carbsPer100g: ing.carbs_per_100g,
        fatPer100g: ing.fat_per_100g,
        fiberPer100g: ing.fiber_per_100g,
        isVerified: ing.is_verified,
      },
    });
    count++;
  }
  
  console.log(`Seeded ${count} ingredients.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });