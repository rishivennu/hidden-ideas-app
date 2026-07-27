-- ── Analytics events (page visits + roadmap downloads) ──────────────────────
-- Powers the admin infographics. Inserted server-side via the service role,
-- so no public RLS insert policy is needed.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('visit', 'download')),
  slug text,
  path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_type_created_idx
  ON public.analytics_events (type, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
-- No public policy: only the service-role key (server) reads/writes events.
