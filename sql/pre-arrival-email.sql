-- ============================================================
-- MGL 365 — Pre-arrival email tracking
-- Run in Supabase SQL Editor
-- ============================================================

ALTER TABLE "mgl-365".bookings
  ADD COLUMN IF NOT EXISTS pre_arrival_sent_at timestamptz;

-- Default email template for the pre-arrival week email
INSERT INTO "mgl-365".email_templates (trigger, subject, body, active)
VALUES (
  'pre_arrival_week',
  'Your stay at {{villa_name}} is one week away!',
  'Hi {{guest_first_name}},

We''re so excited to welcome you to {{villa_name}} on {{check_in}}! Your stay is just one week away and we wanted to share a summary of everything we have confirmed for you.

{{services_html}}

If there''s anything else you''d like to add — additional excursions, dining arrangements, transport, or anything at all — please don''t hesitate to reply to this email and we''ll do our best to make it happen before your arrival.

We look forward to making your stay truly memorable.

Warm regards,
The MGL 365 Team',
  true
)
ON CONFLICT (trigger) DO NOTHING;
