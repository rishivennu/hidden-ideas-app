-- ============================================================
-- 002_analytics.sql — Hidden Ideas App — analytics events
-- Run once AFTER 001_initial.sql in:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

create table if not exists analytics_events (
  id         bigserial primary key,
  type       text not null check (type in ('visit', 'download')),
  slug       text,
  path       text,
  created_at timestamptz not null default now()
);

-- Index for fast count queries by type
create index if not exists analytics_events_type_idx on analytics_events(type);
-- Index for daily series queries
create index if not exists analytics_events_created_idx on analytics_events(created_at desc);

-- Row-level security: no public read (only service-role key can read)
alter table analytics_events enable row level security;
-- Service role bypasses RLS automatically — no policy needed for admin reads.
-- Allow the server (service role) to insert events from /api/track
-- Note: insert is done via service-role key which bypasses RLS.
