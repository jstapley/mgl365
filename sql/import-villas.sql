-- MGL 365 — Villa Import
-- Inserts the 4 managed villas into the database.

INSERT INTO "mgl-365".villas (name, slug, description, bedrooms, max_guests, active) VALUES
  (
    'Water Edge',
    'water-edge',
    'Set directly along the pristine white sands of Jolly Harbour, Villa Water''s Edge (also known as Marina House) is a coastal gem that combines refined elegance with relaxed seaside living. With four beautifully appointed bedrooms, this villa comfortably hosts up to eight guests — making it ideal for families or groups seeking a peaceful, upscale escape.',
    4,
    8,
    true
  ),
  (
    'Cool House',
    'cool-house',
    'Escape to the ultimate Caribbean getaway at Cool House, a stunning 5-bedroom island retreat that perfectly blends modern elegance with relaxed island living. Every detail has been thoughtfully designed, from premium finishes to expansive living spaces, making it one of the true gems of Antigua''s beautiful western cape.',
    5,
    10,
    true
  ),
  (
    'Starfish House Upper',
    'starfish-house-upper',
    'Wake up to breathtaking ocean views, sip coffee on your private balcony, and unwind in a breezy island retreat just minutes from Antigua''s best beaches and Jolly Harbour. Perched on the west coast of Antigua in Ffryes Estate, St. Mary''s, Starfish House Upper is a private one-bedroom hideaway designed for relaxed island living.',
    1,
    2,
    true
  ),
  (
    'Starfish House Lower',
    'starfish-house-lower',
    'Your next dream vacation is waiting here at Starfish House Lower, a tranquil seaside retreat on Antigua''s west coast in Ffryes Estate, St. Mary''s. Designed for luxurious, relaxed living with breathtaking ocean vistas, this home captures the very essence of island escape. From the entire front façade of the property, you''re greeted by sweeping, unobstructed views of the Caribbean Sea and Valley Church Beach.',
    3,
    6,
    true
  );
