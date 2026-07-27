# Hidden Ideas

Short business-idea reels → actionable roadmaps → downloadable setup guides.
Built with Next.js 14 (App Router) + Supabase.

## Pages
| Route | What it does |
|-------|--------------|
| `/` | Home — grid of published reels |
| `/reels/[slug]` | Reel detail — video, roadmaps, gated PDF download |
| `/submit` | Public idea submission form |
| `/admin` | **Admin dashboard** — upload thumbnail + PDF, create reels/guides/roadmaps, review submissions (email-gated) |
| `/privacy`, `/terms` | Legal pages |
| `/auth/callback` | Completes magic-link / Google sign-in |

## Setup (one time)

### 1. Environment variables (Vercel → Settings → Environment Variables)
See `.env.example`. You need:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`  (Supabase → Settings → API → service_role — keep secret)
- `ADMIN_EMAILS`  (comma-separated emails allowed into `/admin`)
- `NEXT_PUBLIC_SITE_URL`  (your production URL, optional)

### 2. Database
In Supabase → SQL Editor, run `supabase/migrations/001_initial.sql`.
This creates all tables **and the storage buckets** (`thumbnails` public, `guides-pdfs` private).
Optionally run `supabase/seed.sql` for one sample reel.

### 3. Auth redirect URLs
Supabase → Authentication → URL Configuration → add your site URL and
`https://your-app.vercel.app/auth/callback` to the redirect allow-list.

## How content flows
1. Go to `/admin`, sign in with an `ADMIN_EMAILS` account.
2. Fill the form: title, description, upload a **thumbnail image**, paste a **video URL**,
   upload a **guide PDF**, add roadmaps.
3. Hit **Publish** — the server (service-role) uploads files to Storage and inserts the
   records. The reel is immediately live on `/` and `/reels/[slug]` for all users.
4. The PDF stays private; users must sign in, then get a 10-minute signed download URL.

## Local dev
```
npm install
npm run dev
```
