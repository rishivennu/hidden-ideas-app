import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

// Records a lightweight analytics event (visit | download). Fire-and-forget:
// never blocks or errors the user's request. If the table doesn't exist yet,
// it silently no-ops so the site keeps working before the migration is run.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const type = body?.type === 'download' ? 'download' : 'visit'
    const slug = typeof body?.slug === 'string' ? body.slug.slice(0, 120) : null
    const path = typeof body?.path === 'string' ? body.path.slice(0, 200) : null

    const admin = createAdminSupabaseClient()
    await admin.from('analytics_events').insert({ type, slug, path })
  } catch {
    // swallow — analytics must never break the app
  }
  return NextResponse.json({ ok: true })
}
