-- ============================================================
-- MGL 365 — Booking Services (Confirmed guest services)
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS "mgl-365".booking_services (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            uuid        NOT NULL REFERENCES "mgl-365".bookings(id) ON DELETE CASCADE,
  service_name          text        NOT NULL,
  provider              text,
  service_date          date,
  service_time          text,
  cost_usd              numeric(10,2),
  cost_xcd              numeric(10,2),
  pickup_location       text,
  notes                 text,
  pushed_to_commissions boolean     NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_services_booking_idx
  ON "mgl-365".booking_services(booking_id);

ALTER TABLE "mgl-365".booking_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_booking_services"
  ON "mgl-365".booking_services FOR ALL
  TO service_role USING (true) WITH CHECK (true);

GRANT ALL ON "mgl-365".booking_services TO service_role;
