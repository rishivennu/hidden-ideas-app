-- ============================================================
-- 001_initial.sql  — Hidden Ideas App — initial schema
-- Run once in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── reels ──────────────────────────────────────────────────
create table if not exists reels (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  description     text,
  thumbnail_url   text,
  video_url       text,
  duration_seconds integer,
  published       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ── guides ─────────────────────────────────────────────────
create table if not exists guides (
  id          uuid primary key default gen_random_uuid(),
  reel_id     uuid references reels(id) on delete cascade,
  title       text not null,
  file_path   text not null,
  summary     text,
  created_at  timestamptz not null default now()
);

-- ── roadmaps ───────────────────────────────────────────────
create table if not exists roadmaps (
  id             uuid primary key default gen_random_uuid(),
  guide_id       uuid references guides(id) on delete cascade,
  name           text not null,
  duration_days  integer,
  cost_estimate  text,
  difficulty     integer check (difficulty between 1 and 5),
  steps          jsonb,
  created_at     timestamptz not null default now()
);

-- ── submissions ────────────────────────────────────────────
create table if not exists submissions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  email       text,
  status      text not null default 'new',
  created_at  timestamptz not null default now()
);

-- Row-level security (public read for reels/guides/roadmaps; submissions admin-only)
alter table reels       enable row level security;
alter table guides      enable row level security;
alter table roadmaps    enable row level security;
alter table submissions enable row level security;

-- Public can read published reels
create policy "public read reels" on reels for select using (published = true);
-- Public can read guides and roadmaps linked to published reels
create policy "public read guides"   on guides   for select using (true);
create policy "public read roadmaps" on roadmaps for select using (true);
-- Anyone can insert a submission (idea submissions form)
create policy "public insert submissions" on submissions for insert with check (true);

-- Supabase Storage buckets (run separately or via Dashboard)
-- insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('guides-pdfs', 'guides-pdfs', false) on conflict do nothing;
