-- MGL 365 — Concierge Services Import
-- Step 1: Add package column to services table
ALTER TABLE "mgl-365".services
  ADD COLUMN IF NOT EXISTS package text
    check (package in ('bronze','silver','gold'));

-- Step 2: Insert all services grouped by package tier
INSERT INTO "mgl-365".services (name, description, package, sort_order, active) VALUES

-- ─── BRONZE ────────────────────────────────────────────────────────────────
('Luxury Airport Pick-up',
 'Enjoy a seamless arrival in a private, air-conditioned luxury vehicle directly to your villa.',
 'bronze', 1, true),

('Airport Express Check-in (Fast Track)',
 'Skip airport lines and fast-track through customs and immigration with VIP assistance.',
 'bronze', 2, true),

('Chef-Prepared Dinner Daily',
 'Savor freshly prepared gourmet dinners by your private in-villa chef each evening.',
 'bronze', 3, true),

('Provision Stocking for Arrival',
 'Your requested groceries and beverages will be stocked in your villa before your arrival.',
 'bronze', 4, true),

('Concierge Assistance — All Tours & Excursions',
 'Our dedicated concierge team will help plan and reserve all your tours, activities, and adventures.',
 'bronze', 5, true),

('Housekeeping — 2 Days per Stay',
 'Professional cleaning service to ensure your villa remains spotless and inviting.',
 'bronze', 6, true),

('Rental Car for Duration of Stay',
 'A comfortable, reliable rental vehicle suited to your group for effortless island exploring.',
 'bronze', 7, true),

-- ─── SILVER ────────────────────────────────────────────────────────────────
('Chef-Prepared Lunch & Dinner Daily',
 'Enjoy two chef-prepared gourmet meals each day using local and seasonal ingredients.',
 'silver', 10, true),

('Golf Cart for Local Use',
 'Convenient and fun way to get around the property or nearby beaches and restaurants.',
 'silver', 11, true),

('Provision Stocking (Arrival + Mid-Stay)',
 'Your villa is stocked with your favorites upon arrival and refreshed midway through your stay.',
 'silver', 12, true),

('Housekeeping — 3 Days per Stay',
 'Keep your space effortlessly fresh and comfortable throughout the week.',
 'silver', 13, true),

('Private Boat Tour (Curated & Coordinated)',
 'Set sail on a private boat experience — snorkeling, island-hopping, or a romantic sunset cruise — fully customized to you.',
 'silver', 14, true),

('Yoga / Pilates — 2 Sessions per Stay',
 'Unwind with two private in-villa sessions led by a certified instructor.',
 'silver', 15, true),

('Mixologist — One Cocktail Evening',
 'Enjoy a private cocktail night with a professional mixologist crafting signature drinks.',
 'silver', 16, true),

-- ─── GOLD ──────────────────────────────────────────────────────────────────
('Chef-Prepared All Meals Daily',
 'Breakfast, lunch, and dinner prepared by your private chef — fine dining in the comfort of your villa.',
 'gold', 20, true),

('Private Rum Tasting Tour & Shirley Heights Evening Experience',
 'Sample Antigua''s finest rums with a guided tasting, then enjoy the island''s most iconic sunset party at Shirley Heights — live steel band, local BBQ, and unforgettable views.',
 'gold', 21, true),

('In-Villa Spa Day (Massages, Facials, Hair & Nails)',
 'Full pampering experience without leaving your villa — professional therapists at your service.',
 'gold', 22, true),

('Personal Photographer Session',
 'Capture the beauty of your stay with a professional photoshoot — perfect for memories or social sharing.',
 'gold', 23, true),

('Mixologist — 2 Nights per Stay',
 'Your private bartender returns for multiple evenings of creative cocktails and island-inspired drinks.',
 'gold', 24, true),

('Yoga / Pilates — 4 Sessions per Stay',
 'Stay balanced and centered with four private sessions tailored to your pace and preferences.',
 'gold', 25, true);
