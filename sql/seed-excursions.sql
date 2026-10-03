-- ============================================================
-- MGL 365 — Seed Excursion Activities
-- Run in Supabase SQL Editor
-- Update pricing, duration, and descriptions via Admin > Activities
-- ============================================================

INSERT INTO "mgl-365".activities (name, description, price, duration, category, sort_order, active) VALUES

('Beach Hopping',
 'Explore a selection of Antigua''s most beautiful beaches in one unforgettable trip. Your guide will take you to hidden coves and popular spots around the island.',
 NULL, 'Half day', 'Excursions', 100, true),

('Half Day Tour',
 'A curated half-day tour of Antigua''s highlights, including scenic viewpoints, local villages, and cultural landmarks.',
 NULL, 'Half day', 'Excursions', 101, true),

('Turtle Adventure',
 'Watch Antigua''s sea turtles in their natural habitat. This guided experience takes you to known nesting and feeding areas around the island.',
 NULL, 'Half day', 'Excursions', 102, true),

('Hiking Trips',
 'Guided hiking through Antigua''s lush interior and coastal trails, including panoramic viewpoints and natural landmarks.',
 NULL, 'Half day', 'Excursions', 103, true),

('Historical Sight Tour',
 'Discover Antigua''s rich colonial and pre-Columbian history with a guided tour of the island''s most significant historical sites.',
 NULL, 'Half day', 'Excursions', 104, true),

('Antigua Inside Out Tour',
 'A comprehensive full-island exploration covering Antigua''s history, culture, nature, and hidden gems — the complete experience.',
 NULL, 'Full day', 'Excursions', 105, true),

('English Harbour Tour',
 'Explore the historic English Harbour area, including Nelson''s Dockyard UNESCO World Heritage Site and Shirley Heights.',
 NULL, 'Half day', 'Excursions', 106, true),

('Stingray City Tour',
 'Interact with friendly southern stingrays in their natural shallow-water habitat — a truly memorable Antiguan experience.',
 NULL, 'Half day', 'Excursions', 107, true)

ON CONFLICT DO NOTHING;
