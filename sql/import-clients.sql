-- MGL 365 — Client Import
-- Filtered to real contacts with usable data. Social media handles, bots, and
-- entries with no contact info were excluded.
-- Tags from the original CSV are stored in the notes field.

INSERT INTO "mgl-365".clients (name, email, phone, notes, created_at, updated_at) VALUES
  ('Claire Wogan',       'claire@wogancoffee.com',       '447909528032',  'Interested in: water-edge, cool-house',                                                                                         '2026-09-16T02:19:43-04:00', now()),
  ('Hayley Ludwig',      'hayley.ludwig@fora.travel',    '19177341088',   'Source: contact-form',                                                                                                          '2026-09-02T19:05:36-04:00', now()),
  ('Jan Guido',          'jan@hellotucasa.com',           '13054971724',   'Source: contact-form',                                                                                                          '2026-08-30T01:01:53-04:00', now()),
  ('Timmery Walvoord',   'timmerywalvoord@gmail.com',    '14026609401',   'Interested in: cool-house',                                                                                                     '2026-07-13T21:03:47-04:00', now()),
  ('Myranda Barreau',    'sereneseadreams@gmail.com',    '19177419786',   'Source: contact-form',                                                                                                          '2026-06-21T12:56:50-04:00', now()),
  ('Michelle Glick',     'strops24@yahoo.com',           '12687885895',   'Source: contact-form. Status: replied',                                                                                         '2026-06-10T18:34:24-04:00', now()),
  ('Brooke Foulk',       'befoulk@gmail.com',            '14237421714',   'Interested in: water-edge',                                                                                                     '2026-06-07T11:16:54-04:00', now()),
  ('Rob Kucharczuk',     'rtkuch@yahoo.com',             '16107306932',   'Source: contact-form. Status: replied',                                                                                         '2026-05-28T10:56:40-04:00', now()),
  ('Libby Clark',        'libbytom625@gmail.com',        '12077527433',   'Source: contact-form',                                                                                                          '2026-05-07T18:26:53-04:00', now()),
  ('Lorna Bryant',       'loricb626@yahoo.com',          '12072823077',   'Source: contact-form',                                                                                                          '2026-05-07T09:14:29-04:00', now()),
  ('Melinda Scholl',     'melinda.scholl@gmail.com',     '12676428847',   'Interested in: cool-house',                                                                                                     '2026-05-01T09:44:13-04:00', now()),
  ('Chris Devereux',     'crd945@gmail.com',             '447540762615',  'Interested in: cool-house',                                                                                                     '2026-01-17T08:38:53-04:00', now()),
  ('Megan Archambeault', 'marchambeault@icloud.com',     '17022497884',   'Interested in: cool-house',                                                                                                     '2025-12-30T10:56:16-04:00', now()),
  ('Amina Alam',         'aminaalam1@gmail.com',         '13477021267',   'Interested in: cool-house',                                                                                                     '2025-12-13T17:05:41-04:00', now()),
  ('Elena Marangon',     'e.waikiki@gmail.com',          '393483922272',  'Source: contact-form',                                                                                                          '2025-12-13T08:21:28-04:00', now()),
  ('Jamie Arnan',        'jamiearnan@gmail.com',         '12687885675',   'Interested in: cool-house',                                                                                                     '2025-11-18T10:45:27-04:00', now()),
  ('Jeff Stapley',       'jeff.stapley@live.ca',         '17052790364',   'Interested in: cool-house, starfish-lower, starfish-upper, water-edge. Services: airport-transport, chef, car, spa, jet-ski, golf-cart, yoga, zipline. Status: replied', '2025-11-17T15:18:50-04:00', now()),
  ('Daniel Edwards',     'daniel.websolution9@gmail.com','918454479454',  'Source: contact-form',                                                                                                          '2025-11-10T08:32:50-04:00', now());
