-- ============================================================
-- MGL 365 — Inventory Checks
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS "mgl-365".inventory_checks (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  villa_id   uuid        NOT NULL REFERENCES "mgl-365".villas(id) ON DELETE CASCADE,
  check_date date        NOT NULL,
  checked_by text        NOT NULL DEFAULT '',
  linens     text,
  kitchen    text,
  other      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_checks_villa_date_idx
  ON "mgl-365".inventory_checks(villa_id, check_date DESC);

ALTER TABLE "mgl-365".inventory_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_inventory"
  ON "mgl-365".inventory_checks FOR ALL
  TO service_role USING (true) WITH CHECK (true);

GRANT ALL ON "mgl-365".inventory_checks TO service_role;
