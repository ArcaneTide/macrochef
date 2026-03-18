"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MealType, RecipeStatus } from "@prisma/client";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
const STATUSES = ["draft", "published", "archived"] as const;

const ingredientRowSchema = z.object({
  ingredientId: z.string().uuid(),
  quantityGrams: z.number().positive(),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  servings: z.coerce.number().int().min(1).max(100),
  instructions: z.string().optional(),
  cuisine: z.string().optional(),
  mealType: z.enum(MEAL_TYPES).nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  ingredients: z.array(ingredientRowSchema).min(1, "At least one ingredient is required"),
});

export type RecipeFormInput = z.infer<typeof recipeSchema>;
export type ActionResult = { success: true; id: string } | { success: false; error: string };

async function getAuthedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

async function assertOwnership(recipeId: string, userId: string) {
  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    select: { userId: true },
  });
  if (!recipe || recipe.userId !== userId) throw new Error("Not found");
}

export async function createRecipe(data: RecipeFormInput): Promise<ActionResult> {
  try {
    const userId = await getAuthedUserId();
    const parsed = recipeSchema.parse(data);

    const recipe = await db.recipe.create({
      data: {
        userId,
        title: parsed.title,
        servings: parsed.servings,
        instructions: parsed.instructions ?? null,
        cuisine: parsed.cuisine ?? null,
        mealType: (parsed.mealType ?? null) as MealType | null,
        status: parsed.status as RecipeStatus,
        ingredients: {
          create: parsed.ingredients.map((ing, idx) => ({
            ingredientId: ing.ingredientId,
            quantityGrams: ing.quantityGrams,
            sortOrder: idx,
          })),
        },
      },
    });

    revalidatePath("/recipes");
    return { success: true, id: recipe.id };
  } catch (err) {
    console.error("createRecipe:", err);
    return { success: false, error: "Failed to create recipe" };
  }
}

export async function updateRecipe(id: string, data: RecipeFormInput): Promise<ActionResult> {
  try {
    const userId = await getAuthedUserId();
    await assertOwnership(id, userId);
    const parsed = recipeSchema.parse(data);

    await db.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      await tx.recipe.update({
        where: { id },
        data: {
          title: parsed.title,
          servings: parsed.servings,
          instructions: parsed.instructions ?? null,
          cuisine: parsed.cuisine ?? null,
          mealType: (parsed.mealType ?? null) as MealType | null,
          status: parsed.status as RecipeStatus,
          ingredients: {
            create: parsed.ingredients.map((ing, idx) => ({
              ingredientId: ing.ingredientId,
              quantityGrams: ing.quantityGrams,
              sortOrder: idx,
            })),
          },
        },
      });
    });

    revalidatePath("/recipes");
    revalidatePath(`/recipes/${id}/edit`);
    return { success: true, id };
  } catch (err) {
    console.error("updateRecipe:", err);
    return { success: false, error: "Failed to update recipe" };
  }
}

export async function deleteRecipe(id: string): Promise<ActionResult> {
  try {
    const userId = await getAuthedUserId();
    await assertOwnership(id, userId);
    await db.recipe.delete({ where: { id } });
    revalidatePath("/recipes");
    return { success: true, id };
  } catch (err) {
    console.error("deleteRecipe:", err);
    return { success: false, error: "Failed to delete recipe" };
  }
}

export async function updateRecipeStatus(
  id: string,
  status: (typeof STATUSES)[number]
): Promise<ActionResult> {
  try {
    const userId = await getAuthedUserId();
    await assertOwnership(id, userId);
    await db.recipe.update({ where: { id }, data: { status: status as RecipeStatus } });
    revalidatePath("/recipes");
    return { success: true, id };
  } catch (err) {
    console.error("updateRecipeStatus:", err);
    return { success: false, error: "Failed to update recipe status" };
  }
}
