-- MGL 365 — Excursions & Maintenance Tables

-- ─── EXCURSIONS ───────────────────────────────────────────────────────────────

create table "mgl-365".excursions (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  price       numeric(10,2),
  duration    text,
  max_guests  int,
  active      boolean     not null default true,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger excursions_updated_at
  before update on "mgl-365".excursions
  for each row execute function "mgl-365".set_updated_at();

alter table "mgl-365".excursions enable row level security;

create policy "public_read_active_excursions" on "mgl-365".excursions
  for select using (active = true);

GRANT ALL ON "mgl-365".excursions TO anon, authenticated, service_role;

-- ─── MAINTENANCE ──────────────────────────────────────────────────────────────

create table "mgl-365".maintenance (
  id            uuid        primary key default gen_random_uuid(),
  villa_id      uuid        references "mgl-365".villas(id) on delete set null,
  title         text        not null,
  description   text,
  priority      text        not null default 'medium'
                            check (priority in ('low','medium','high')),
  status        text        not null default 'pending'
                            check (status in ('pending','in_progress','completed')),
  cost          numeric(10,2),
  notes         text,
  reported_date date        not null default current_date,
  resolved_date date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger maintenance_updated_at
  before update on "mgl-365".maintenance
  for each row execute function "mgl-365".set_updated_at();

alter table "mgl-365".maintenance enable row level security;

GRANT ALL ON "mgl-365".maintenance TO anon, authenticated, service_role;
