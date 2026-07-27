import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — stores the session in COOKIES (via @supabase/ssr) so the
// server (middleware, API routes, server components) can read the same session.
// Using the plain createClient here would store the session in localStorage,
// which the server cannot see — causing 'signed in on client, signed out on server'.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export interface Reel {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  duration_seconds: number | null
  published: boolean
  created_at: string
}

export interface Guide {
  id: string
  reel_id: string
  title: string
  file_path: string
  summary: string | null
  created_at: string
}

export interface RoadmapStep {
  order: number
  title: string
  description: string
  deliverable?: string
}

export interface Roadmap {
  id: string
  guide_id: string
  name: string
  duration_days: number | null
  cost_estimate: string | null
  difficulty: number | null
  steps: RoadmapStep[] | null
  created_at: string
}
