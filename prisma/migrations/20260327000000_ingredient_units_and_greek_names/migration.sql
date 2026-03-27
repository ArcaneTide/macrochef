-- Add display unit to recipe_ingredients (g, ml, tsp, tbsp, pinch)
-- quantity_grams always stores the actual gram equivalent; unit is display metadata
ALTER TABLE "recipe_ingredients" ADD COLUMN "unit" TEXT NOT NULL DEFAULT 'g';

-- Add optional Greek name to ingredients for i18n
ALTER TABLE "ingredients" ADD COLUMN "name_el" TEXT;
