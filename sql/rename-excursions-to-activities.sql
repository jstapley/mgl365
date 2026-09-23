-- MGL 365 — Rename excursions table to activities
ALTER TABLE "mgl-365".excursions RENAME TO activities;

-- Rename the trigger
ALTER TRIGGER excursions_updated_at ON "mgl-365".activities RENAME TO activities_updated_at;

-- Rename the RLS policy
ALTER POLICY "public_read_active_excursions" ON "mgl-365".activities
  RENAME TO "public_read_active_activities";
