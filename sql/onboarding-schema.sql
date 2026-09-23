-- ============================================================
-- MGL 365 - Onboarding & Forms Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add category to activities
ALTER TABLE "mgl-365".activities
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Other';

-- 2. Add onboarding fields to bookings
ALTER TABLE "mgl-365".bookings
  ADD COLUMN IF NOT EXISTS onboarding_token uuid UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Backfill tokens for existing bookings that don't have one
UPDATE "mgl-365".bookings
SET onboarding_token = gen_random_uuid()
WHERE onboarding_token IS NULL;

-- 3. Liability forms (one per villa, editable by PM)
CREATE TABLE IF NOT EXISTS "mgl-365".liability_forms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  villa_id    uuid REFERENCES "mgl-365".villas(id) ON DELETE CASCADE,
  content     text NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- One row per villa (upsert on villa_id)
CREATE UNIQUE INDEX IF NOT EXISTS liability_forms_villa_id_idx
  ON "mgl-365".liability_forms(villa_id);

-- Seed one blank liability form per villa if none exists
INSERT INTO "mgl-365".liability_forms (villa_id, content)
SELECT id, ''
FROM "mgl-365".villas
WHERE id NOT IN (SELECT villa_id FROM "mgl-365".liability_forms WHERE villa_id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION "mgl-365".liability_forms_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS liability_forms_updated_at ON "mgl-365".liability_forms;
CREATE TRIGGER liability_forms_updated_at
  BEFORE UPDATE ON "mgl-365".liability_forms
  FOR EACH ROW EXECUTE FUNCTION "mgl-365".liability_forms_updated_at();

-- 4. Onboarding submissions (one per booking)
CREATE TABLE IF NOT EXISTS "mgl-365".onboarding_submissions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          uuid NOT NULL REFERENCES "mgl-365".bookings(id) ON DELETE CASCADE,
  client_id           uuid REFERENCES "mgl-365".clients(id),
  -- Liability
  agreed_to_liability boolean NOT NULL DEFAULT false,
  liability_signed_at timestamptz,
  -- Service interests
  interest_spa        boolean NOT NULL DEFAULT false,
  interest_tours      boolean NOT NULL DEFAULT false,
  interest_wine       boolean NOT NULL DEFAULT false,
  interest_transport  boolean NOT NULL DEFAULT false,
  interest_chef       boolean NOT NULL DEFAULT false,
  interest_provisioning boolean NOT NULL DEFAULT false,
  -- Selected items (array of {activity_id, quantity, notes})
  selected_activities jsonb NOT NULL DEFAULT '[]',
  -- Free-text fields
  guest_notes         text,
  num_guests          int,
  arrival_flight      text,
  departure_flight    text,
  -- Meta
  submitted_at        timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS onboarding_submissions_booking_idx
  ON "mgl-365".onboarding_submissions(booking_id);

-- 5. RLS policies
ALTER TABLE "mgl-365".liability_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mgl-365".onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS — admin portal uses service key, so no extra policy needed.
-- Public read for liability forms (needed for guest-facing onboarding page)
CREATE POLICY "service_role_all_liability_forms"
  ON "mgl-365".liability_forms FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_onboarding_submissions"
  ON "mgl-365".onboarding_submissions FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Grants
GRANT ALL ON "mgl-365".liability_forms TO service_role;
GRANT ALL ON "mgl-365".onboarding_submissions TO service_role;
