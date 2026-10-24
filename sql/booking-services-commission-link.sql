-- ============================================================
-- Link commission_entries back to booking_services
-- so deleting a service auto-removes its commission entry.
-- Run in Supabase SQL Editor.
-- ============================================================

ALTER TABLE "mgl-365".commission_entries
  ADD COLUMN IF NOT EXISTS booking_service_id uuid
    REFERENCES "mgl-365".booking_services(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS commission_entries_booking_service_idx
  ON "mgl-365".commission_entries(booking_service_id);
