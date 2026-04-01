-- Fix ingredient default quantities for fruits, vegetables, and dairy
-- Fruits → piece/1
UPDATE "ingredients" SET "default_unit" = 'piece', "default_quantity" = 1 WHERE "id" = 'ece387dc-3e22-493f-8f79-fc1ab59483cb'; -- Apple
UPDATE "ingredients" SET "default_unit" = 'piece', "default_quantity" = 1 WHERE "id" = '3e01c9a0-233f-4396-aa6b-d229cc372318'; -- Orange
UPDATE "ingredients" SET "default_unit" = 'piece', "default_quantity" = 1 WHERE "id" = '68e45acd-0c39-421b-b1d9-0d1a963397d0'; -- Banana
UPDATE "ingredients" SET "default_unit" = 'piece', "default_quantity" = 1 WHERE "id" = '7752cf87-7726-44fb-95f0-69b0964467f0'; -- Mango

-- Fruits → fixed gram quantities
UPDATE "ingredients" SET "default_unit" = 'g', "default_quantity" = 200 WHERE "id" = 'cc199852-4354-4a83-b142-7783e0810fa8'; -- Watermelon
UPDATE "ingredients" SET "default_unit" = 'g', "default_quantity" = 30  WHERE "id" = '3472c897-0ca6-454f-8f49-a884f29f5f4e'; -- Dates, Medjool
UPDATE "ingredients" SET "default_unit" = 'g', "default_quantity" = 30  WHERE "id" = '23c26ed0-4a2f-4e9c-8fcf-0bdf7907b6f1'; -- Raisins

-- Vegetables
UPDATE "ingredients" SET "default_unit" = 'g',     "default_quantity" = 5   WHERE "id" = '3c55f486-6e7d-4ed9-917e-3c36c7fe9c0e'; -- Garlic, raw
UPDATE "ingredients" SET "default_unit" = 'piece', "default_quantity" = 1   WHERE "id" = 'a87e4664-8321-4498-ab8f-88e9abb27d4c'; -- Cucumber

-- Dairy → ml/200
UPDATE "ingredients" SET "default_unit" = 'ml', "default_quantity" = 200 WHERE "id" = 'd2476749-d2d1-492f-94a0-8172dedb4ea1'; -- Whole milk
UPDATE "ingredients" SET "default_unit" = 'ml', "default_quantity" = 200 WHERE "id" = 'ff1f56a1-56b2-4eaf-bfac-936334cddd2a'; -- Semi-skimmed milk
UPDATE "ingredients" SET "default_unit" = 'ml', "default_quantity" = 200 WHERE "id" = '2ddf42e5-ed31-4145-b1a6-68047e8aa34c'; -- Skimmed milk
