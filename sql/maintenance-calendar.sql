-- ============================================================
-- MGL 365 — Maintenance calendar fields
-- Run in Supabase SQL Editor
-- ============================================================

ALTER TABLE "mgl-365".maintenance_issues
  ADD COLUMN IF NOT EXISTS scheduled_date date,
  ADD COLUMN IF NOT EXISTS assigned_to    text;
