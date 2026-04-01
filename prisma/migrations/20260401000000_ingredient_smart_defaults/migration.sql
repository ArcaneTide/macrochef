-- AlterTable: add defaultUnit and defaultQuantity to ingredients
ALTER TABLE "ingredients" ADD COLUMN "default_unit" TEXT NOT NULL DEFAULT 'g';
ALTER TABLE "ingredients" ADD COLUMN "default_quantity" DOUBLE PRECISION NOT NULL DEFAULT 100;
