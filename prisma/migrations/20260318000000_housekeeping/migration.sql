-- AlterTable: meal_assignments.recipe_id — change ON DELETE from RESTRICT to CASCADE
-- so deleting a recipe also removes its meal assignments.
ALTER TABLE "meal_assignments" DROP CONSTRAINT "meal_assignments_recipe_id_fkey";
ALTER TABLE "meal_assignments" ADD CONSTRAINT "meal_assignments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
