-- Persist the AI-generated roadmap directly on the reel so it survives page
-- refreshes and is shown to every visitor (not just the device that made it).
alter table reels add column if not exists ai_roadmap jsonb;
