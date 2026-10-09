-- ============================================================
-- MGL 365 — Structured Inventory Rebuild
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Drop free-text columns from existing inventory_checks
--    (replaces linens/kitchen/lightbulbs/other with structured entries)
ALTER TABLE "mgl-365".inventory_checks DROP COLUMN IF EXISTS linens;
ALTER TABLE "mgl-365".inventory_checks DROP COLUMN IF EXISTS kitchen;
ALTER TABLE "mgl-365".inventory_checks DROP COLUMN IF EXISTS lightbulbs;
ALTER TABLE "mgl-365".inventory_checks DROP COLUMN IF EXISTS other;

-- 2. Item catalog (per villa, ordered by sort_order)
CREATE TABLE IF NOT EXISTS "mgl-365".inventory_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  villa_id    uuid        NOT NULL REFERENCES "mgl-365".villas(id) ON DELETE CASCADE,
  category    text        NOT NULL,
  name        text        NOT NULL,
  sort_order  integer     NOT NULL DEFAULT 0,
  active      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_items_villa_sort_idx
  ON "mgl-365".inventory_items(villa_id, sort_order);

-- 3. Per-check quantity entries
CREATE TABLE IF NOT EXISTS "mgl-365".inventory_check_entries (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id   uuid        NOT NULL REFERENCES "mgl-365".inventory_checks(id) ON DELETE CASCADE,
  item_id    uuid        NOT NULL REFERENCES "mgl-365".inventory_items(id) ON DELETE CASCADE,
  quantity   integer     NOT NULL DEFAULT 0,
  notes      text,
  UNIQUE (check_id, item_id)
);

CREATE INDEX IF NOT EXISTS inventory_entries_check_idx
  ON "mgl-365".inventory_check_entries(check_id);

-- 4. RLS
ALTER TABLE "mgl-365".inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mgl-365".inventory_check_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_inventory_items"
  ON "mgl-365".inventory_items FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_inventory_entries"
  ON "mgl-365".inventory_check_entries FOR ALL
  TO service_role USING (true) WITH CHECK (true);

GRANT ALL ON "mgl-365".inventory_items TO service_role;
GRANT ALL ON "mgl-365".inventory_check_entries TO service_role;
