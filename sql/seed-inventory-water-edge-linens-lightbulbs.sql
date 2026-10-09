-- ============================================================
-- MGL 365 — Water Edge: Linen & Lightbulb Inventory Baseline
-- Adds items to inventory_items and appends entries to the
-- existing "Baseline import" check (or creates one if absent).
-- Towels marked 0 — need physical count. Run once in Supabase.
-- ============================================================

DO $$
DECLARE
  v_villa_id uuid;
  v_check_id uuid;
BEGIN
  SELECT id INTO v_villa_id
  FROM "mgl-365".villas
  WHERE name ILIKE '%water edge%'
  LIMIT 1;

  IF v_villa_id IS NULL THEN
    RAISE EXCEPTION 'Villa "Water Edge" not found.';
  END IF;

  -- ── 1. Insert catalog items ───────────────────────────────────────────────

  INSERT INTO "mgl-365".inventory_items (villa_id, category, name, sort_order) VALUES

    -- Bed linens
    (v_villa_id, 'Bed linens', 'King flat sheets',            0),
    (v_villa_id, 'Bed linens', 'King fitted sheets',          1),
    (v_villa_id, 'Bed linens', 'Twin flat sheets',            2),
    (v_villa_id, 'Bed linens', 'Twin fitted sheets',          3),
    (v_villa_id, 'Bed linens', 'King duvets',                 4),
    (v_villa_id, 'Bed linens', 'Twin duvets',                 5),
    (v_villa_id, 'Bed linens', 'Mattress protectors',         6),
    (v_villa_id, 'Bed linens', 'King pillowcases',            7),
    (v_villa_id, 'Bed linens', 'Decorative king pillowcases', 8),

    -- Towels (quantities to be counted)
    (v_villa_id, 'Towels', 'Beach towels', 0),
    (v_villa_id, 'Towels', 'Bath towels',  1),
    (v_villa_id, 'Towels', 'Hand towels',  2),
    (v_villa_id, 'Towels', 'Washcloths',   3),

    -- Lightbulbs — Laundry
    (v_villa_id, 'Lightbulbs — Laundry', 'Ceiling lights (12V 35W MR16 two-pin)', 0),

    -- Lightbulbs — Kitchen
    (v_villa_id, 'Lightbulbs — Kitchen', 'Breakfast counter spotlights (12V 50W MR16 GU5.3)', 0),

    -- Lightbulbs — Living room
    (v_villa_id, 'Lightbulbs — Living room', 'Wall sconces (5W GU5.3 MR16 round two-pin)', 0),
    (v_villa_id, 'Lightbulbs — Living room', 'Lamp bulbs (LED screw-in)',                  1),

    -- Lightbulbs — Dining room
    (v_villa_id, 'Lightbulbs — Dining room', 'Ceiling lights (3W 3000K)',          0),
    (v_villa_id, 'Lightbulbs — Dining room', 'Accent spotlight (pointy two-pin MR16)', 1),
    (v_villa_id, 'Lightbulbs — Dining room', 'Lamp bulbs (LED screw-in)',           2),

    -- Lightbulbs — TV room
    (v_villa_id, 'Lightbulbs — TV room', 'Ceiling lights (3W 3000K)',          0),
    (v_villa_id, 'Lightbulbs — TV room', 'Accent spotlight (pointy two-pin MR16)', 1),
    (v_villa_id, 'Lightbulbs — TV room', 'Lamp bulbs (LED screw-in)',           2),

    -- Lightbulbs — Guest bathroom
    (v_villa_id, 'Lightbulbs — Guest bathroom', 'Ceiling lights (5W GU5.3 MR16)', 0),

    -- Lightbulbs — Bedroom 1
    (v_villa_id, 'Lightbulbs — Bedroom 1', 'Bathroom ceiling lights',     0),
    (v_villa_id, 'Lightbulbs — Bedroom 1', 'Bathroom mirror lights',      1),
    (v_villa_id, 'Lightbulbs — Bedroom 1', 'Lamp bulbs (LED screw-in)',   2),
    (v_villa_id, 'Lightbulbs — Bedroom 1', 'Closet lights (unknown type)',3),
    (v_villa_id, 'Lightbulbs — Bedroom 1', 'Wall sconce bulb',            4),

    -- Lightbulbs — Bedroom 2
    (v_villa_id, 'Lightbulbs — Bedroom 2', 'Lamp bulbs (LED screw-in)',                  0),
    (v_villa_id, 'Lightbulbs — Bedroom 2', 'Closet/hallway spotlights (MR16 12V 20W halogen)', 1),
    (v_villa_id, 'Lightbulbs — Bedroom 2', 'Bathroom ceiling lights',                    2),

    -- Lightbulbs — Bedroom 3
    (v_villa_id, 'Lightbulbs — Bedroom 3', 'Lamp bulbs (LED screw-in)',   0),
    (v_villa_id, 'Lightbulbs — Bedroom 3', 'Bathroom ceiling lights',     1),
    (v_villa_id, 'Lightbulbs — Bedroom 3', 'Closet light (unknown type)', 2),

    -- Lightbulbs — Bedroom 4
    (v_villa_id, 'Lightbulbs — Bedroom 4', 'Bed lamp bulbs (LED screw-in)',     0),
    (v_villa_id, 'Lightbulbs — Bedroom 4', 'Closet lights',                     1),
    (v_villa_id, 'Lightbulbs — Bedroom 4', 'Bathroom ceiling lights',           2),
    (v_villa_id, 'Lightbulbs — Bedroom 4', 'Bathroom mirror bulbs (LED screw-in)', 3),

    -- Lightbulbs — Garden
    (v_villa_id, 'Lightbulbs — Garden', 'Garden spotlights (MR16 12V 50W two-pin)', 0),

    -- Lightbulbs — Outside front
    (v_villa_id, 'Lightbulbs — Outside front', 'Exterior LED screw-in', 0),

    -- Lightbulbs — Outside back
    (v_villa_id, 'Lightbulbs — Outside back', 'Pool area LED screw-in',  0),
    (v_villa_id, 'Lightbulbs — Outside back', 'Bar area LED screw-in',   1),
    (v_villa_id, 'Lightbulbs — Outside back', 'Recessed ceiling lights', 2),

    -- Lightbulbs — Fans & chandelier
    (v_villa_id, 'Lightbulbs — Fans & chandelier', 'Fan light bulbs (to be sourced)', 0),
    (v_villa_id, 'Lightbulbs — Fans & chandelier', 'Chandelier bulbs',               1);

  -- ── 2. Find existing baseline check (or create one) ───────────────────────

  SELECT id INTO v_check_id
  FROM "mgl-365".inventory_checks
  WHERE villa_id = v_villa_id
    AND checked_by = 'Baseline import'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_check_id IS NULL THEN
    INSERT INTO "mgl-365".inventory_checks (villa_id, check_date, checked_by)
    VALUES (v_villa_id, CURRENT_DATE, 'Baseline import')
    RETURNING id INTO v_check_id;
    RAISE NOTICE 'Created new baseline check: %', v_check_id;
  ELSE
    RAISE NOTICE 'Appending to existing baseline check: %', v_check_id;
  END IF;

  -- ── 3. Insert baseline quantities ─────────────────────────────────────────

  INSERT INTO "mgl-365".inventory_check_entries (check_id, item_id, quantity)
  SELECT v_check_id, i.id, b.qty
  FROM (VALUES

    -- Bed linens
    ('Bed linens', 'King flat sheets',             9),
    ('Bed linens', 'King fitted sheets',           7),
    ('Bed linens', 'Twin flat sheets',             8),
    ('Bed linens', 'Twin fitted sheets',           7),
    ('Bed linens', 'King duvets',                  9),
    ('Bed linens', 'Twin duvets',                  6),
    ('Bed linens', 'Mattress protectors',          3),
    ('Bed linens', 'King pillowcases',            15),
    ('Bed linens', 'Decorative king pillowcases', 24),

    -- Towels (0 = not yet counted — update after physical count)
    ('Towels', 'Beach towels', 0),
    ('Towels', 'Bath towels',  0),
    ('Towels', 'Hand towels',  0),
    ('Towels', 'Washcloths',   0),

    -- Lightbulbs
    ('Lightbulbs — Laundry',        'Ceiling lights (12V 35W MR16 two-pin)',                   4),

    ('Lightbulbs — Kitchen',        'Breakfast counter spotlights (12V 50W MR16 GU5.3)',        5),

    ('Lightbulbs — Living room',    'Wall sconces (5W GU5.3 MR16 round two-pin)',              12),
    ('Lightbulbs — Living room',    'Lamp bulbs (LED screw-in)',                                3),

    ('Lightbulbs — Dining room',    'Ceiling lights (3W 3000K)',                                4),
    ('Lightbulbs — Dining room',    'Accent spotlight (pointy two-pin MR16)',                   1),
    ('Lightbulbs — Dining room',    'Lamp bulbs (LED screw-in)',                                3),

    ('Lightbulbs — TV room',        'Ceiling lights (3W 3000K)',                                4),
    ('Lightbulbs — TV room',        'Accent spotlight (pointy two-pin MR16)',                   1),
    ('Lightbulbs — TV room',        'Lamp bulbs (LED screw-in)',                                3),

    ('Lightbulbs — Guest bathroom', 'Ceiling lights (5W GU5.3 MR16)',                          0),

    ('Lightbulbs — Bedroom 1',      'Bathroom ceiling lights',                                  5),
    ('Lightbulbs — Bedroom 1',      'Bathroom mirror lights',                                   2),
    ('Lightbulbs — Bedroom 1',      'Lamp bulbs (LED screw-in)',                                5),
    ('Lightbulbs — Bedroom 1',      'Closet lights (unknown type)',                             2),
    ('Lightbulbs — Bedroom 1',      'Wall sconce bulb',                                         0),

    ('Lightbulbs — Bedroom 2',      'Lamp bulbs (LED screw-in)',                                1),
    ('Lightbulbs — Bedroom 2',      'Closet/hallway spotlights (MR16 12V 20W halogen)',        3),
    ('Lightbulbs — Bedroom 2',      'Bathroom ceiling lights',                                  5),

    ('Lightbulbs — Bedroom 3',      'Lamp bulbs (LED screw-in)',                                2),
    ('Lightbulbs — Bedroom 3',      'Bathroom ceiling lights',                                  5),
    ('Lightbulbs — Bedroom 3',      'Closet light (unknown type)',                              1),

    ('Lightbulbs — Bedroom 4',      'Bed lamp bulbs (LED screw-in)',                            0),
    ('Lightbulbs — Bedroom 4',      'Closet lights',                                            3),
    ('Lightbulbs — Bedroom 4',      'Bathroom ceiling lights',                                  8),
    ('Lightbulbs — Bedroom 4',      'Bathroom mirror bulbs (LED screw-in)',                     2),

    ('Lightbulbs — Garden',         'Garden spotlights (MR16 12V 50W two-pin)',                10),

    ('Lightbulbs — Outside front',  'Exterior LED screw-in',                                    6),

    ('Lightbulbs — Outside back',   'Pool area LED screw-in',                                   4),
    ('Lightbulbs — Outside back',   'Bar area LED screw-in',                                    2),
    ('Lightbulbs — Outside back',   'Recessed ceiling lights',                                 20),

    ('Lightbulbs — Fans & chandelier', 'Fan light bulbs (to be sourced)',                       0),
    ('Lightbulbs — Fans & chandelier', 'Chandelier bulbs',                                      8)

  ) AS b(cat, name, qty)
  JOIN "mgl-365".inventory_items i
    ON i.villa_id = v_villa_id
   AND i.category = b.cat
   AND i.name = b.name;

  RAISE NOTICE 'Linen & lightbulb import complete for Water Edge.';
END $$;
