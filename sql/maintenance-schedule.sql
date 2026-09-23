-- MGL 365 — Maintenance Schedule (replaces ad-hoc maintenance table)
-- Run this in Supabase SQL Editor

-- Drop old maintenance table (empty — just created, no data lost)
DROP TABLE IF EXISTS "mgl-365".maintenance CASCADE;

-- ─── RECURRING SCHEDULES ─────────────────────────────────────────────────────

CREATE TABLE "mgl-365".maintenance_schedules (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  villa_id           uuid        REFERENCES "mgl-365".villas(id) ON DELETE CASCADE,
  name               text        NOT NULL,
  description        text,
  frequency_days     int         NOT NULL DEFAULT 90,
  last_completed     date,
  next_due           date,
  notify_email       text,
  notify_days_before int         NOT NULL DEFAULT 7,
  active             boolean     NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ─── COMPLETION HISTORY ───────────────────────────────────────────────────────

CREATE TABLE "mgl-365".maintenance_logs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id    uuid        REFERENCES "mgl-365".maintenance_schedules(id) ON DELETE CASCADE,
  completed_date date        NOT NULL DEFAULT current_date,
  notes          text,
  cost           numeric(10,2),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── TRIGGERS & SECURITY ─────────────────────────────────────────────────────

CREATE TRIGGER maintenance_schedules_updated_at
  BEFORE UPDATE ON "mgl-365".maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION "mgl-365".set_updated_at();

ALTER TABLE "mgl-365".maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mgl-365".maintenance_logs      ENABLE ROW LEVEL SECURITY;

GRANT ALL ON "mgl-365".maintenance_schedules TO anon, authenticated, service_role;
GRANT ALL ON "mgl-365".maintenance_logs      TO anon, authenticated, service_role;

-- ─── SEED: COMMON TASKS ──────────────────────────────────────────────────────
-- Uncomment and customise after running, or add via the admin panel.
-- INSERT INTO "mgl-365".maintenance_schedules (villa_id, name, frequency_days, notify_days_before)
-- SELECT id, 'Air Conditioning Service', 90, 14 FROM "mgl-365".villas;
-- SELECT id, 'Bug Spraying',             60,  7 FROM "mgl-365".villas;
-- SELECT id, 'Pool Cleaning',            14,  3 FROM "mgl-365".villas;
