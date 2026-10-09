-- ============================================================
-- MGL 365 — Water Edge Kitchen Inventory Baseline Import
-- Source: May 8, 2026 spreadsheet
-- Notes/Condition/duplicate rows stripped; Old+New quantities summed.
-- Run in Supabase SQL Editor (run once).
-- ============================================================

DO $$
DECLARE
  v_villa_id uuid;
  v_check_id uuid;
BEGIN
  -- Locate Water Edge villa
  SELECT id INTO v_villa_id
  FROM "mgl-365".villas
  WHERE name ILIKE '%water edge%'
  LIMIT 1;

  IF v_villa_id IS NULL THEN
    RAISE EXCEPTION 'Villa "Water Edge" not found. Check villa name in villas table.';
  END IF;

  -- ── 1. Insert catalog items ───────────────────────────────────────────────

  INSERT INTO "mgl-365".inventory_items (villa_id, category, name, sort_order) VALUES

    -- Cutlery
    (v_villa_id, 'Cutlery', 'Dinner forks',            0),
    (v_villa_id, 'Cutlery', 'Salad forks',             1),
    (v_villa_id, 'Cutlery', 'Dinner knives',           2),
    (v_villa_id, 'Cutlery', 'Small spreading spoons',  3),
    (v_villa_id, 'Cutlery', 'Soup spoons',             4),
    (v_villa_id, 'Cutlery', 'Teaspoons',               5),
    (v_villa_id, 'Cutlery', 'Steak knives',            6),
    (v_villa_id, 'Cutlery', 'Butter knives',           7),
    (v_villa_id, 'Cutlery', 'Plastic spoons',          8),
    (v_villa_id, 'Cutlery', 'Plastic forks',           9),

    -- Kitchen equipment
    (v_villa_id, 'Kitchen equipment', 'Knife sharpener',        0),
    (v_villa_id, 'Kitchen equipment', 'Kitchen shears',         1),
    (v_villa_id, 'Kitchen equipment', 'NutriBullet',            2),
    (v_villa_id, 'Kitchen equipment', 'Juicer',                 3),
    (v_villa_id, 'Kitchen equipment', 'Plastic measuring jar',  4),
    (v_villa_id, 'Kitchen equipment', 'Mandoline',              5),
    (v_villa_id, 'Kitchen equipment', 'Kitchen scale',          6),
    (v_villa_id, 'Kitchen equipment', 'Immersion blender',      7),
    (v_villa_id, 'Kitchen equipment', 'Handheld blender',       8),
    (v_villa_id, 'Kitchen equipment', 'Nespresso coffee machine', 9),
    (v_villa_id, 'Kitchen equipment', 'Drip coffee machine',   10),
    (v_villa_id, 'Kitchen equipment', 'Two-slice toaster',     11),
    (v_villa_id, 'Kitchen equipment', 'Kettle',                12),
    (v_villa_id, 'Kitchen equipment', 'Small blender',         13),

    -- Table linens & placemats
    (v_villa_id, 'Table linens & placemats', 'Square placemats',              0),
    (v_villa_id, 'Table linens & placemats', 'Round brown placemats',         1),
    (v_villa_id, 'Table linens & placemats', 'Blue striped plastic placemats',2),
    (v_villa_id, 'Table linens & placemats', 'Square stone placemats',        3),
    (v_villa_id, 'Table linens & placemats', 'Grey tablecloths',              4),
    (v_villa_id, 'Table linens & placemats', 'Teal tablecloths',              5),
    (v_villa_id, 'Table linens & placemats', 'Turquoise cloth napkins',       6),
    (v_villa_id, 'Table linens & placemats', 'Light blue cloth napkins',      7),
    (v_villa_id, 'Table linens & placemats', 'Grey cloth napkins',            8),
    (v_villa_id, 'Table linens & placemats', 'Wooden napkin rings',           9),

    -- Kitchen utensils
    (v_villa_id, 'Kitchen utensils', 'Red plastic wine bucket',    0),
    (v_villa_id, 'Kitchen utensils', 'Pitcher',                    1),
    (v_villa_id, 'Kitchen utensils', 'Drinking straws',            2),
    (v_villa_id, 'Kitchen utensils', 'Mixing bowl set with lids',  3),
    (v_villa_id, 'Kitchen utensils', 'Large mixing bowl',          4),
    (v_villa_id, 'Kitchen utensils', 'Wooden cutting boards',      5),
    (v_villa_id, 'Kitchen utensils', 'Large plastic cutting board',6),
    (v_villa_id, 'Kitchen utensils', 'Small plastic cutting board',7),
    (v_villa_id, 'Kitchen utensils', 'Flat plastic cutting boards',8),
    (v_villa_id, 'Kitchen utensils', 'Standing graters',           9),
    (v_villa_id, 'Kitchen utensils', 'Steamer plate',             10),
    (v_villa_id, 'Kitchen utensils', 'Large mesh strainer',       11),
    (v_villa_id, 'Kitchen utensils', 'Small mesh strainer',       12),
    (v_villa_id, 'Kitchen utensils', 'Large whisk',               13),
    (v_villa_id, 'Kitchen utensils', 'BBQ tongs',                 14),
    (v_villa_id, 'Kitchen utensils', 'BBQ fork',                  15),
    (v_villa_id, 'Kitchen utensils', 'Large ladles',              16),
    (v_villa_id, 'Kitchen utensils', 'Small ladle',               17),
    (v_villa_id, 'Kitchen utensils', 'Serving utensil set',       18),
    (v_villa_id, 'Kitchen utensils', 'Cake/pie serving spatulas', 19),
    (v_villa_id, 'Kitchen utensils', 'Spatula',                   20),
    (v_villa_id, 'Kitchen utensils', 'Large tongs',               21),
    (v_villa_id, 'Kitchen utensils', 'Small tongs',               22),
    (v_villa_id, 'Kitchen utensils', 'Long cooking spoon',        23),
    (v_villa_id, 'Kitchen utensils', 'Black plastic utensil set', 24),
    (v_villa_id, 'Kitchen utensils', 'Small whisk',               25),
    (v_villa_id, 'Kitchen utensils', 'Wooden serving spoons',     26),
    (v_villa_id, 'Kitchen utensils', 'Wooden cooking spoons',     27),

    -- Baskets & decor
    (v_villa_id, 'Baskets & decor', 'Decorative metal basket/bowl', 0),
    (v_villa_id, 'Baskets & decor', 'Small wicker coffee basket',   1),
    (v_villa_id, 'Baskets & decor', 'Large wicker welcome basket',  2),
    (v_villa_id, 'Baskets & decor', 'Glass tealight holders',       3),
    (v_villa_id, 'Baskets & decor', 'Ashtray',                      4),

    -- Dinnerware (Old + New rows summed)
    (v_villa_id, 'Dinnerware', 'Large dinner plates',  0),  -- 11 old + 11 new = 22
    (v_villa_id, 'Dinnerware', 'Salad plates',         1),  -- 11 old + 11 new = 22
    (v_villa_id, 'Dinnerware', 'Soup bowls',           2),  -- 13 mixed + 10 new = 23
    (v_villa_id, 'Dinnerware', 'Ice cream bowls',      3),
    (v_villa_id, 'Dinnerware', 'Plastic dinner plates',4),
    (v_villa_id, 'Dinnerware', 'Plastic salad plates', 5),
    (v_villa_id, 'Dinnerware', 'Plastic soup bowls',   6),
    (v_villa_id, 'Dinnerware', 'Small glass ramekins', 7),
    (v_villa_id, 'Dinnerware', 'Large white ramekins', 8),
    (v_villa_id, 'Dinnerware', 'Glass dessert flutes', 9),
    (v_villa_id, 'Dinnerware', 'Dessert glasses',     10),

    -- Serving platters & display
    (v_villa_id, 'Serving platters & display', 'Narrow serving platters',        0),
    (v_villa_id, 'Serving platters & display', 'Clear glass bowl',               1),
    (v_villa_id, 'Serving platters & display', 'Medium clear glass bowl',        2),
    (v_villa_id, 'Serving platters & display', 'Silver side plate',              3),
    (v_villa_id, 'Serving platters & display', 'Gold side plate',                4),
    (v_villa_id, 'Serving platters & display', 'Large fish platter',             5),
    (v_villa_id, 'Serving platters & display', 'Small fish plates',              6),
    (v_villa_id, 'Serving platters & display', 'Round glass plate',              7),
    (v_villa_id, 'Serving platters & display', 'Long narrow glass serving dish', 8),
    (v_villa_id, 'Serving platters & display', 'Rectangular ceramic platter',    9),
    (v_villa_id, 'Serving platters & display', 'Large oval white platter',      10),
    (v_villa_id, 'Serving platters & display', 'Large square white platter',    11),
    (v_villa_id, 'Serving platters & display', 'Large creamer jugs',            12),
    (v_villa_id, 'Serving platters & display', 'Small creamer jug',             13),
    (v_villa_id, 'Serving platters & display', 'Sugar jar with lid',            14),
    (v_villa_id, 'Serving platters & display', 'Small ketchup ramekin',         15),
    (v_villa_id, 'Serving platters & display', 'Gravy jug',                     16),

    -- Bakeware
    (v_villa_id, 'Bakeware', '12-cup muffin tin',        0),
    (v_villa_id, 'Bakeware', '6-cup muffin tin',         1),
    (v_villa_id, 'Bakeware', 'Pie tin',                  2),
    (v_villa_id, 'Bakeware', '13 x 9 metal baking dish', 3),
    (v_villa_id, 'Bakeware', 'Metal baking sheet',       4),
    (v_villa_id, 'Bakeware', '9 x 9 glass Pyrex dishes', 5),

    -- Mugs & saucers
    (v_villa_id, 'Mugs & saucers', 'Regular mugs',       0),
    (v_villa_id, 'Mugs & saucers', 'Large mugs',         1),
    (v_villa_id, 'Mugs & saucers', 'Cappuccino mugs',    2),
    (v_villa_id, 'Mugs & saucers', 'Espresso mugs',      3),
    (v_villa_id, 'Mugs & saucers', 'Espresso saucers',   4),
    (v_villa_id, 'Mugs & saucers', 'Cappuccino saucers', 5),
    (v_villa_id, 'Mugs & saucers', 'Tea saucers',        6),

    -- Glassware & barware
    (v_villa_id, 'Glassware & barware', 'Champagne flutes',            0),
    (v_villa_id, 'Glassware & barware', 'White acrylic wine glasses',  1),
    (v_villa_id, 'Glassware & barware', 'Red wine glasses',            2),
    (v_villa_id, 'Glassware & barware', 'Martini glasses',             3),
    (v_villa_id, 'Glassware & barware', 'Assorted glasses',            4),
    (v_villa_id, 'Glassware & barware', 'Shot glasses',                5),
    (v_villa_id, 'Glassware & barware', 'Small acrylic tumblers',      6),
    (v_villa_id, 'Glassware & barware', 'Red stemless wine glasses',   7),
    (v_villa_id, 'Glassware & barware', 'Lowball glasses',             8),
    (v_villa_id, 'Glassware & barware', 'Tall glass water tumblers',   9),
    (v_villa_id, 'Glassware & barware', 'Narrow tall water tumblers', 10),
    (v_villa_id, 'Glassware & barware', 'Assorted plastic water glasses', 11),
    (v_villa_id, 'Glassware & barware', 'Cocktail shaker',            12),

    -- Cookware
    (v_villa_id, 'Cookware', 'Stainless 8-quart pot',    0),
    (v_villa_id, 'Cookware', 'Stainless small pots',     1),
    (v_villa_id, 'Cookware', 'Stainless medium pot',     2),
    (v_villa_id, 'Cookware', 'Stainless medium saucepan',3),
    (v_villa_id, 'Cookware', 'Stainless large saucepan', 4),
    (v_villa_id, 'Cookware', 'Blue 5-quart pot',         5),
    (v_villa_id, 'Cookware', 'Blue 4-quart pot',         6),
    (v_villa_id, 'Cookware', 'Small blue pots',          7),
    (v_villa_id, 'Cookware', 'Deep blue saucepan',       8),
    (v_villa_id, 'Cookware', '8-inch ceramic saucepan',  9),

    -- Kitchen textiles
    (v_villa_id, 'Kitchen textiles', 'Oven mitt',        0),
    (v_villa_id, 'Kitchen textiles', 'Kitchen towels',   1),
    (v_villa_id, 'Kitchen textiles', 'Microfiber cloths',2),
    (v_villa_id, 'Kitchen textiles', 'Apron',            3);

  -- ── 2. Create the baseline inventory check ────────────────────────────────

  INSERT INTO "mgl-365".inventory_checks (villa_id, check_date, checked_by)
  VALUES (v_villa_id, '2026-05-08', 'Baseline import')
  RETURNING id INTO v_check_id;

  -- ── 3. Insert baseline quantities (Old + New summed where applicable) ─────

  INSERT INTO "mgl-365".inventory_check_entries (check_id, item_id, quantity)
  SELECT v_check_id, i.id, b.qty
  FROM (VALUES
    -- Cutlery
    ('Cutlery', 'Dinner forks',            29),  -- 8 old + 21 new
    ('Cutlery', 'Salad forks',             25),  -- 7 old + 18 new
    ('Cutlery', 'Dinner knives',           29),  -- 8 old + 21 new
    ('Cutlery', 'Small spreading spoons',   4),
    ('Cutlery', 'Soup spoons',             28),  -- 3 old + 25 new
    ('Cutlery', 'Teaspoons',               23),  -- 18 new + 5 old
    ('Cutlery', 'Steak knives',            19),  -- 12 new + 7 old
    ('Cutlery', 'Butter knives',            4),
    ('Cutlery', 'Plastic spoons',           3),
    ('Cutlery', 'Plastic forks',            2),

    -- Kitchen equipment
    ('Kitchen equipment', 'Knife sharpener',          1),
    ('Kitchen equipment', 'Kitchen shears',           3),
    ('Kitchen equipment', 'NutriBullet',              1),
    ('Kitchen equipment', 'Juicer',                   1),
    ('Kitchen equipment', 'Plastic measuring jar',    1),
    ('Kitchen equipment', 'Mandoline',                1),
    ('Kitchen equipment', 'Kitchen scale',            1),
    ('Kitchen equipment', 'Immersion blender',        1),
    ('Kitchen equipment', 'Handheld blender',         1),
    ('Kitchen equipment', 'Nespresso coffee machine', 1),
    ('Kitchen equipment', 'Drip coffee machine',      1),
    ('Kitchen equipment', 'Two-slice toaster',        1),
    ('Kitchen equipment', 'Kettle',                   1),
    ('Kitchen equipment', 'Small blender',            1),

    -- Table linens & placemats
    ('Table linens & placemats', 'Square placemats',               10),
    ('Table linens & placemats', 'Round brown placemats',          12),
    ('Table linens & placemats', 'Blue striped plastic placemats',  9),
    ('Table linens & placemats', 'Square stone placemats',         12),
    ('Table linens & placemats', 'Grey tablecloths',                2),
    ('Table linens & placemats', 'Teal tablecloths',                2),
    ('Table linens & placemats', 'Turquoise cloth napkins',        10),
    ('Table linens & placemats', 'Light blue cloth napkins',       10),
    ('Table linens & placemats', 'Grey cloth napkins',              2),
    ('Table linens & placemats', 'Wooden napkin rings',            12),

    -- Kitchen utensils
    ('Kitchen utensils', 'Red plastic wine bucket',     1),
    ('Kitchen utensils', 'Pitcher',                     1),
    ('Kitchen utensils', 'Drinking straws',          1000),
    ('Kitchen utensils', 'Mixing bowl set with lids',   5),
    ('Kitchen utensils', 'Large mixing bowl',           1),
    ('Kitchen utensils', 'Wooden cutting boards',       3),
    ('Kitchen utensils', 'Large plastic cutting board', 1),
    ('Kitchen utensils', 'Small plastic cutting board', 1),
    ('Kitchen utensils', 'Flat plastic cutting boards', 3),
    ('Kitchen utensils', 'Standing graters',            2),
    ('Kitchen utensils', 'Steamer plate',               1),
    ('Kitchen utensils', 'Large mesh strainer',         1),
    ('Kitchen utensils', 'Small mesh strainer',         1),
    ('Kitchen utensils', 'Large whisk',                 1),
    ('Kitchen utensils', 'BBQ tongs',                   1),
    ('Kitchen utensils', 'BBQ fork',                    1),
    ('Kitchen utensils', 'Large ladles',                2),
    ('Kitchen utensils', 'Small ladle',                 1),
    ('Kitchen utensils', 'Serving utensil set',         1),
    ('Kitchen utensils', 'Cake/pie serving spatulas',   2),
    ('Kitchen utensils', 'Spatula',                     1),
    ('Kitchen utensils', 'Large tongs',                 1),
    ('Kitchen utensils', 'Small tongs',                 2),
    ('Kitchen utensils', 'Long cooking spoon',          1),
    ('Kitchen utensils', 'Black plastic utensil set',   1),
    ('Kitchen utensils', 'Small whisk',                 1),
    ('Kitchen utensils', 'Wooden serving spoons',       3),
    ('Kitchen utensils', 'Wooden cooking spoons',       3),

    -- Baskets & decor
    ('Baskets & decor', 'Decorative metal basket/bowl', 1),
    ('Baskets & decor', 'Small wicker coffee basket',   1),
    ('Baskets & decor', 'Large wicker welcome basket',  1),
    ('Baskets & decor', 'Glass tealight holders',       4),
    ('Baskets & decor', 'Ashtray',                      1),

    -- Dinnerware
    ('Dinnerware', 'Large dinner plates',  22),  -- 11 old + 11 new
    ('Dinnerware', 'Salad plates',         22),  -- 11 old + 11 new
    ('Dinnerware', 'Soup bowls',           23),  -- 13 mixed + 10 new
    ('Dinnerware', 'Ice cream bowls',      11),
    ('Dinnerware', 'Plastic dinner plates', 7),
    ('Dinnerware', 'Plastic salad plates',  8),
    ('Dinnerware', 'Plastic soup bowls',    3),
    ('Dinnerware', 'Small glass ramekins', 12),
    ('Dinnerware', 'Large white ramekins',  5),
    ('Dinnerware', 'Glass dessert flutes',  8),
    ('Dinnerware', 'Dessert glasses',       2),

    -- Serving platters & display
    ('Serving platters & display', 'Narrow serving platters',        3),
    ('Serving platters & display', 'Clear glass bowl',               1),
    ('Serving platters & display', 'Medium clear glass bowl',        1),
    ('Serving platters & display', 'Silver side plate',              1),
    ('Serving platters & display', 'Gold side plate',                1),
    ('Serving platters & display', 'Large fish platter',             1),
    ('Serving platters & display', 'Small fish plates',              6),
    ('Serving platters & display', 'Round glass plate',              1),
    ('Serving platters & display', 'Long narrow glass serving dish', 1),
    ('Serving platters & display', 'Rectangular ceramic platter',    1),
    ('Serving platters & display', 'Large oval white platter',       1),
    ('Serving platters & display', 'Large square white platter',     2),
    ('Serving platters & display', 'Large creamer jugs',             2),
    ('Serving platters & display', 'Small creamer jug',              1),
    ('Serving platters & display', 'Sugar jar with lid',             1),
    ('Serving platters & display', 'Small ketchup ramekin',          1),
    ('Serving platters & display', 'Gravy jug',                      1),

    -- Bakeware
    ('Bakeware', '12-cup muffin tin',        1),
    ('Bakeware', '6-cup muffin tin',         1),
    ('Bakeware', 'Pie tin',                  1),
    ('Bakeware', '13 x 9 metal baking dish', 1),
    ('Bakeware', 'Metal baking sheet',       1),
    ('Bakeware', '9 x 9 glass Pyrex dishes', 2),

    -- Mugs & saucers
    ('Mugs & saucers', 'Regular mugs',       11),
    ('Mugs & saucers', 'Large mugs',          5),
    ('Mugs & saucers', 'Cappuccino mugs',     4),
    ('Mugs & saucers', 'Espresso mugs',       1),
    ('Mugs & saucers', 'Espresso saucers',    6),
    ('Mugs & saucers', 'Cappuccino saucers',  6),
    ('Mugs & saucers', 'Tea saucers',        10),

    -- Glassware & barware
    ('Glassware & barware', 'Champagne flutes',             30),
    ('Glassware & barware', 'White acrylic wine glasses',   11),
    ('Glassware & barware', 'Red wine glasses',              7),
    ('Glassware & barware', 'Martini glasses',               4),
    ('Glassware & barware', 'Assorted glasses',              7),
    ('Glassware & barware', 'Shot glasses',                  7),
    ('Glassware & barware', 'Small acrylic tumblers',       36),
    ('Glassware & barware', 'Red stemless wine glasses',     6),
    ('Glassware & barware', 'Lowball glasses',               4),
    ('Glassware & barware', 'Tall glass water tumblers',     7),
    ('Glassware & barware', 'Narrow tall water tumblers',    2),
    ('Glassware & barware', 'Assorted plastic water glasses',6),
    ('Glassware & barware', 'Cocktail shaker',               1),

    -- Cookware
    ('Cookware', 'Stainless 8-quart pot',     1),
    ('Cookware', 'Stainless small pots',      2),
    ('Cookware', 'Stainless medium pot',      1),
    ('Cookware', 'Stainless medium saucepan', 1),
    ('Cookware', 'Stainless large saucepan',  1),
    ('Cookware', 'Blue 5-quart pot',          1),
    ('Cookware', 'Blue 4-quart pot',          1),
    ('Cookware', 'Small blue pots',           2),
    ('Cookware', 'Deep blue saucepan',        1),
    ('Cookware', '8-inch ceramic saucepan',   1),

    -- Kitchen textiles
    ('Kitchen textiles', 'Oven mitt',         1),
    ('Kitchen textiles', 'Kitchen towels',    6),
    ('Kitchen textiles', 'Microfiber cloths', 1),
    ('Kitchen textiles', 'Apron',             1)

  ) AS b(cat, name, qty)
  JOIN "mgl-365".inventory_items i
    ON i.villa_id = v_villa_id
   AND i.category = b.cat
   AND i.name = b.name;

  RAISE NOTICE 'Water Edge inventory import complete. % items added. Baseline check ID: %',
    (SELECT COUNT(*) FROM "mgl-365".inventory_items WHERE villa_id = v_villa_id),
    v_check_id;

END $$;
