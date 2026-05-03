-- Add optional metadata fields to clients
ALTER TABLE "clients" ADD COLUMN "diet_type" TEXT;
ALTER TABLE "clients" ADD COLUMN "excluded_foods" TEXT;
ALTER TABLE "clients" ADD COLUMN "preferred_foods" TEXT;
ALTER TABLE "clients" ADD COLUMN "training_time" TEXT;
ALTER TABLE "clients" ADD COLUMN "training_days" INTEGER;
ALTER TABLE "clients" ADD COLUMN "cooking_time" TEXT;
ALTER TABLE "clients" ADD COLUMN "meal_prep_friendly" BOOLEAN;
