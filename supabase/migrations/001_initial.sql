-- Hidden Ideas — Initial Schema
-- Run this in your Supabase SQL Editor or via supabase db push

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  duration_seconds int,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid REFERENCES reels(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,     -- Supabase Storage path: e.g. "guides/micro-fulfillment.pdf"
  summary text,
  is_gated boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES guides(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_days int,
  cost_estimate text,
  difficulty smallint CHECK (difficulty BETWEEN 1 AND 5),
  steps jsonb,               -- [{order, title, description, deliverable}]
  created_at timestamptz DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  guide_id uuid REFERENCES guides(id) ON DELETE CASCADE,
  reel_id uuid REFERENCES reels(id) ON DELETE SET NULL,
  downloaded_at timestamptz DEFAULT now()
);

CREATE TABLE saved_roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  roadmap_id uuid REFERENCES roadmaps(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, roadmap_id)
);

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX reels_slug_idx ON reels(slug);
CREATE INDEX reels_published_idx ON reels(published, created_at DESC);
CREATE INDEX guides_reel_id_idx ON guides(reel_id);
CREATE INDEX roadmaps_guide_id_idx ON roadmaps(guide_id);
CREATE INDEX downloads_user_id_idx ON downloads(user_id);
CREATE INDEX saved_roadmaps_user_id_idx ON saved_roadmaps(user_id);

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE reels           ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides          ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_roadmaps  ENABLE ROW LEVEL SECURITY;

-- Public can read published reels
CREATE POLICY "reels_public_read" ON reels
  FOR SELECT USING (published = true);

-- Public can read guides and roadmaps
CREATE POLICY "guides_public_read" ON guides
  FOR SELECT USING (true);

CREATE POLICY "roadmaps_public_read" ON roadmaps
  FOR SELECT USING (true);

-- Users can only read their own data
CREATE POLICY "users_own" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "downloads_own" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_roadmaps_own" ON saved_roadmaps
  FOR ALL USING (auth.uid() = user_id);

-- ── Trigger: auto-create user row on sign-up ────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Submissions (public idea submissions, admin-reviewed) ───────────────────

CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  email text,
  status text DEFAULT 'pending',   -- pending | approved | rejected
  created_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- No public policy: only the service-role key (server) can read/write submissions.

-- ── Storage buckets (created here so admin uploads work out of the box) ─────
-- thumbnails: public (served via public URL on reel cards)
-- guides-pdfs: private (served via short-lived signed URLs from the API)

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('thumbnails', 'thumbnails', true),
  ('guides-pdfs', 'guides-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Public read for thumbnails (public bucket also serves public URLs directly).
CREATE POLICY "thumbnails_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'thumbnails');
