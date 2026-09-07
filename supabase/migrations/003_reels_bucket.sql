-- Public storage bucket for reel videos uploaded from the admin panel.
-- Run once in Supabase → SQL Editor. Safe to re-run.

insert into storage.buckets (id, name, public)
values ('reels', 'reels', true)
on conflict (id) do update set public = true;

-- Anyone can READ objects in the reels bucket (so videos play on /reels).
drop policy if exists "public read reels bucket" on storage.objects;
create policy "public read reels bucket" on storage.objects
  for select using (bucket_id = 'reels');

-- NOTE: uploads happen via a signed upload URL minted server-side with the
-- service_role key (see /api/admin/upload-url), so no INSERT policy is needed
-- for the browser — the signed token authorises that single upload.
