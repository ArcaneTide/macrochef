-- AlterTable: add activeSlots and slotDistribution to meal_plans
ALTER TABLE "meal_plans" ADD COLUMN "active_slots" JSONB NOT NULL DEFAULT '["breakfast","lunch","dinner","snack1"]';
ALTER TABLE "meal_plans" ADD COLUMN "slot_distribution" JSONB;
