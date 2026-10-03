-- ============================================================
-- MGL 365 — Add interest_excursions column to onboarding_submissions
-- Run in Supabase SQL Editor
-- ============================================================

ALTER TABLE "mgl-365".onboarding_submissions
  ADD COLUMN IF NOT EXISTS interest_excursions boolean NOT NULL DEFAULT false;

-- Also add interest_miscellaneous if missing (added via wizard but not in original schema)
ALTER TABLE "mgl-365".onboarding_submissions
  ADD COLUMN IF NOT EXISTS interest_miscellaneous boolean NOT NULL DEFAULT false;
