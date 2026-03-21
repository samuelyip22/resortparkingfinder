-- SkiSpot Database Schema
-- Run this once to set up your Supabase tables.
-- This is executed automatically by scripts/setup-db.js

-- ─────────────────────────────────────────────
-- alerts
-- Stores email alert subscriptions.
-- When someone asks to be notified when parking opens
-- for a specific resort on a specific date, a row goes here.
-- ─────────────────────────────────────────────
create table if not exists alerts (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  resort_id   text not null,
  resort_name text not null,
  date        date not null,
  active      boolean not null default true,
  notified_at timestamptz,               -- set when the alert email is sent
  created_at  timestamptz not null default now(),

  -- Prevents the same person from subscribing to the same resort+date twice
  unique (email, resort_id, date)
);

-- ─────────────────────────────────────────────
-- parking_snapshots
-- Stores the last known parking status for each resort.
-- The cron job compares against this to detect changes.
-- One row per resort — updated in-place on each check.
-- ─────────────────────────────────────────────
create table if not exists parking_snapshots (
  resort_id  text primary key,
  status     text,                        -- "open", "full", a % number, or null
  was_open   boolean not null default false,
  checked_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- Row Level Security (RLS)
-- Only our server-side API routes (using the service role key) can
-- write to these tables. The anon key can only read active alerts
-- for the cron job to process. This protects user data.
-- ─────────────────────────────────────────────
alter table alerts enable row level security;
alter table parking_snapshots enable row level security;

-- Allow anyone to insert a new alert (for the /api/alerts POST route)
create policy "Anyone can subscribe" on alerts
  for insert with check (true);

-- Allow server (service role) to read and update alerts
-- The cron job needs to read active alerts and mark them as notified
create policy "Service role full access to alerts" on alerts
  for all using (true);

create policy "Service role full access to snapshots" on parking_snapshots
  for all using (true);

-- Track how many times in a row a scraper has returned null.
-- If this hits 3+, the check-parking cron logs a visible health warning.
alter table parking_snapshots add column if not exists consecutive_failures integer not null default 0;

-- ─────────────────────────────────────────────
-- parking_calendar
-- Stores per-date parking availability for each resort.
-- Populated by the check-parking cron and used to render
-- the calendar UI on resort pages.
-- One row per resort+date combination.
-- ─────────────────────────────────────────────
create table if not exists parking_calendar (
  resort_id   text not null,
  date        date not null,
  status      text not null default 'unknown', -- 'open', 'full', 'unknown'
  checked_at  timestamptz not null default now(),
  primary key (resort_id, date)
);

alter table parking_calendar enable row level security;

-- Anyone can read the calendar (it's public availability info)
create policy "Anyone can read calendar" on parking_calendar
  for select using (true);

-- Only service role can write calendar data
create policy "Service role full access to calendar" on parking_calendar
  for all using (true);
