-- MGL 365 Admin Panel — Supabase Schema
-- Run this in the Supabase SQL Editor for your project.
-- Schema: mgl-365 (must already exist or be created first)

create schema if not exists "mgl-365";

-- ─── VILLAS ──────────────────────────────────────────────────────────────────

create table "mgl-365".villas (
  id               uuid          primary key default gen_random_uuid(),
  name             text          not null,
  slug             text          not null unique,
  description      text,
  image_url        text,
  bedrooms         int,
  max_guests       int,
  price_per_night  numeric(10,2),
  active           boolean       not null default true,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

-- ─── SERVICES ────────────────────────────────────────────────────────────────

create table "mgl-365".services (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  active      boolean     not null default true,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── CLIENTS ─────────────────────────────────────────────────────────────────

create table "mgl-365".clients (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text,
  phone       text,
  nationality text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── BOOKINGS ────────────────────────────────────────────────────────────────

create table "mgl-365".bookings (
  id            uuid        primary key default gen_random_uuid(),
  villa_id      uuid        references "mgl-365".villas(id) on delete set null,
  client_id     uuid        references "mgl-365".clients(id) on delete set null,
  check_in      date        not null,
  check_out     date        not null,
  guests        int,
  package       text,
  status        text        not null default 'pending'
                            check (status in ('pending','confirmed','cancelled','completed')),
  total_amount  numeric(10,2),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── CONTACT SUBMISSIONS ─────────────────────────────────────────────────────

create table "mgl-365".contact_submissions (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  phone      text,
  message    text        not null,
  status     text        not null default 'unread'
                         check (status in ('unread','read','replied')),
  created_at timestamptz not null default now()
);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────

create or replace function "mgl-365".set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger villas_updated_at
  before update on "mgl-365".villas
  for each row execute function "mgl-365".set_updated_at();

create trigger services_updated_at
  before update on "mgl-365".services
  for each row execute function "mgl-365".set_updated_at();

create trigger clients_updated_at
  before update on "mgl-365".clients
  for each row execute function "mgl-365".set_updated_at();

create trigger bookings_updated_at
  before update on "mgl-365".bookings
  for each row execute function "mgl-365".set_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

alter table "mgl-365".villas              enable row level security;
alter table "mgl-365".services            enable row level security;
alter table "mgl-365".clients             enable row level security;
alter table "mgl-365".bookings            enable row level security;
alter table "mgl-365".contact_submissions enable row level security;

-- Public read access for active villas & services (frontend use)
create policy "public_read_active_villas" on "mgl-365".villas
  for select using (active = true);

create policy "public_read_active_services" on "mgl-365".services
  for select using (active = true);

-- All other operations go through the service-role key (bypasses RLS)
-- No additional policies needed for admin — use SUPABASE_SERVICE_ROLE_KEY.
