-- ============================================================
-- MGL 365 - Seed Activities from Partner Price Lists
-- Run AFTER onboarding-schema.sql
-- ============================================================

-- Clear existing (optional — comment out if you have custom data)
-- DELETE FROM "mgl-365".activities;

-- ============================================================
-- HEALING HANDS SPA
-- ============================================================
INSERT INTO "mgl-365".activities (name, description, price, duration, category, sort_order, active) VALUES

('Healing Hands Signature Treatment',
 'Choose your essential oil to reset your mind, body and spirit. Starts with Tibetan singing bowl and 5 minutes of mindfulness, then a medley of Swedish, aromatherapy, Indian head and reflexology massage, concluding with Tibetan singing bowls and herbal tea.',
 185, '90 minutes', 'Spa', 10, true),

('Deep Tissue Massage',
 'Targeted deep tissue massage to release muscle tension.',
 145, '60 minutes', 'Spa', 11, true),

('Energizing Massage',
 'Revitalizing massage to restore energy and vitality.',
 120, '60 minutes', 'Spa', 12, true),

('Healing Stone Massage',
 'Hot stone massage to melt away tension and restore balance.',
 155, '60 minutes', 'Spa', 13, true),

('Prenatal Massage',
 'Gentle massage designed for expectant mothers.',
 125, '60 minutes', 'Spa', 14, true),

('Anti-Aging Facial with Cryotherapy',
 'Advanced anti-aging facial treatment with cryotherapy.',
 135, '60 minutes', 'Spa', 15, true),

('Hydrating Facial',
 'Deep hydrating facial to restore moisture and glow.',
 125, '60 minutes', 'Spa', 16, true),

-- ============================================================
-- BAREFOOT ANTIGUA — BOAT TOURS
-- ============================================================

('Barefoot Day — Half Day (Barefoot boat)',
 'West coast beaches, Cades Reef snorkelling/subwinging, fishing, looking for sea turtles, lunch stop. Price up to 6 people. Add-ons available (Prickly Pear, Sting Ray City, etc.).',
 800, 'Half day', 'Boat Tours', 20, true),

('Barefoot Day — Full Day (Barefoot boat)',
 'West coast beaches, Cades Reef snorkelling/subwinging, fishing, looking for sea turtles, lunch stop. Price up to 6 people.',
 950, 'Full day', 'Boat Tours', 21, true),

('Barefoot Day — Half Day (Sea Sea Rider)',
 'West coast beaches, Cades Reef snorkelling/subwinging, fishing, looking for sea turtles. 32ft Boston Whaler, up to 6 people.',
 975, 'Half day', 'Boat Tours', 22, true),

('Barefoot Day — Full Day (Sea Sea Rider)',
 'West coast beaches, Cades Reef snorkelling/subwinging, fishing, looking for sea turtles. 32ft Boston Whaler, up to 6 people.',
 1150, 'Full day', 'Boat Tours', 23, true),

('Barefoot Day — Half Day (Raft-A-Kai/Hotfoot)',
 'West coast beaches, Cades Reef snorkelling/subwinging, fishing, looking for sea turtles. 33–36ft boat, up to 6 people.',
 1200, 'Half day', 'Boat Tours', 24, true),

('Barefoot Day — Full Day (Raft-A-Kai/Hotfoot)',
 'West coast beaches, Cades Reef snorkelling/subwinging, fishing, looking for sea turtles. 33–36ft boat, up to 6 people.',
 1450, 'Full day', 'Boat Tours', 25, true),

('Circumnavigation of Antigua (Sea Sea Rider)',
 'Full day trip around the entire island of Antigua (~7 hours). Price up to 8 people. Sting Ray City stop available at no extra boat charge.',
 1675, 'Full day (~7 hrs)', 'Boat Tours', 30, true),

('Circumnavigation of Antigua (Raft-A-Kai/Hotfoot)',
 'Full day trip around the entire island of Antigua (~7 hours). Price up to 8 people.',
 1875, 'Full day (~7 hrs)', 'Boat Tours', 31, true),

('Barbuda Day Trip (Raft-A-Kai/Hotfoot)',
 'Full day trip to sister island Barbuda (~7.5 hrs). Open ocean crossing approx 1hr 10-20 mins each way. Price up to 8 people. Add-ons: Pink Sand Beach, Bird Sanctuary.',
 2000, 'Full day (~7.5 hrs)', 'Boat Tours', 35, true),

('Barbuda Day Trip (Barevibez/Irievibez)',
 'Full day trip to sister island Barbuda (~7.5 hrs). Open ocean crossing approx 1hr 10-20 mins each way. 40ft luxury Nortech. Price up to 8 people.',
 2150, 'Full day (~7.5 hrs)', 'Boat Tours', 36, true),

('The Cuda Experience — Option 1',
 'Quick snorkel trip and beach stop on our smallest boat (18ft Saintoise). Pickup at west coast hotel, stop at Cades Reef for snorkelling, beach stop for swim, drop back to hotel.',
 400, '3 hours', 'Boat Tours', 40, true),

('The Cuda Experience — Option 2',
 'Pickup at west coast hotel, stop at Cades Reef for snorkelling, lunch at west coast restaurant (lunch not included), beach stop for swim, drop back to hotel.',
 450, '4 hours', 'Boat Tours', 41, true),

('Sunset Cruise (Barefoot boat)',
 'Slow cruise along Antigua''s stunning west coast as the sun sets. Includes our famous Barefoot Rum Punch "Ting with a Sting." Up to 6 people.',
 600, '2+ hours', 'Boat Tours', 45, true),

('Sunset Cruise (Sea Sea Rider)',
 'Slow cruise along Antigua''s stunning west coast as the sun sets. Includes drinks. 32ft Boston Whaler, up to 6 people.',
 825, '2+ hours', 'Boat Tours', 46, true),

('In-Shore Light Tackle Fishing (Barefoot)',
 'Stay close to shore catching snapper, barracuda, jacks, tarpon etc. Up to 3.5 hours, up to 6 people.',
 675, 'Up to 3.5 hours', 'Boat Tours', 50, true),

('Wakeboarding (1–2 people)',
 'Learn or perfect wakeboarding on the Barefoot boat. Price per person.',
 155, '1.5 hours', 'Boat Tours', 55, true),

-- ============================================================
-- TRANSPORT
-- ============================================================

('Airport Transfer',
 'Private airport transfer to/from the villa. Pricing depends on group size — contact your property manager for a quote.',
 NULL, NULL, 'Transport', 60, true),

('Car Rental — Kia Picanto',
 'Economy car rental via DP Rentals. Paperwork, inspection and payment completed directly with rental company on arrival.',
 45, 'Per day', 'Transport', 65, true),

('Car Rental — Toyota Corolla',
 'Mid-size car rental via DP Rentals.',
 50, 'Per day', 'Transport', 66, true),

('Car Rental — Hyundai Creta / Kia Sportage',
 'SUV car rental via DP Rentals.',
 65, 'Per day', 'Transport', 67, true),

('Car Rental — Honda CRV',
 'SUV car rental via DP Rentals.',
 80, 'Per day', 'Transport', 68, true),

('Car Rental — Jeep Wrangler',
 'Jeep Wrangler rental via DP Rentals.',
 110, 'Per day', 'Transport', 69, true),

-- ============================================================
-- CHEF / CATERING
-- All rates include up to 6 guests. Extra guests: +$25 USD/person.
-- Provisions (food, beverages) are reimbursed separately by the guest.
-- Optional add-ons: Additional courses +$25/course | Service assistance/butler +$100
-- ============================================================

('Chef — Breakfast',
 'In-villa chef breakfast service for up to 6 guests. Additional guests: +$25 USD/person. Food and provisions are reimbursed separately. Use the notes field to list dietary needs, allergies, or special requests.',
 185, 'Per service', 'Chef', 70, true),

('Chef — Lunch or Dinner',
 'In-villa chef lunch or dinner service (family-style, up to 3 courses) for up to 6 guests. Additional guests: +$25 USD/person. Additional courses: +$25/course. Provisions reimbursed separately. Use notes for allergies or special requests.',
 250, 'Per service', 'Chef', 71, true),

('Chef — Breakfast + Lunch or Dinner',
 'In-villa chef service covering breakfast plus either lunch or dinner for up to 6 guests. Additional guests: +$25 USD/person. Additional courses: +$25/course. Provisions reimbursed separately. Use notes for preferences, allergies, or special requests.',
 350, 'Per service', 'Chef', 72, true),

('Chef — Breakfast + Lunch + Dinner',
 'Full day in-villa chef service covering all three meals for up to 6 guests. Additional guests: +$25 USD/person. Additional courses: +$25/course. Provisions reimbursed separately. Use notes for preferences, allergies, or special requests.',
 450, 'Per service', 'Chef', 73, true),

('Chef — Four-Course Dinner',
 'Elevated four-course dinner experience for up to 6 guests. Additional guests: +$25 USD/person. Additional courses: +$25/course. Provisions reimbursed separately. Use notes for menu preferences, allergies, or special occasions.',
 300, 'Per service', 'Chef', 74, true)

ON CONFLICT DO NOTHING;
