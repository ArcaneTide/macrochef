-- This migration was originally added by PR #13
-- (fix/ingredients-greek-and-bar) but is redundant: the
-- `name_el` column was already added by 20260327000000 in PR #12
-- which merged 18 minutes earlier.
--
-- Kept as a guarded no-op so the migration history stays intact
-- and `prisma migrate dev` against a fresh shadow DB doesn't fail.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'ingredients'
    AND column_name = 'name_el'
  ) THEN
    ALTER TABLE "ingredients" ADD COLUMN "name_el" TEXT;
  END IF;
END $$;
