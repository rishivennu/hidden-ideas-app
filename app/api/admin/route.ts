import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

function isAdmin(email?: string | null): boolean {
  const list = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  return !!email && list.includes(email.toLowerCase())
}

async function requireAdmin() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401, error: 'Not signed in' }
  if (!isAdmin(user.email)) return { ok: false as const, status: 403, error: 'Not authorized' }
  return { ok: true as const, user }
}

function slugify(title: string): string {
  const base = title.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base}-${Math.random().toString(36).slice(2, 7)}`
}

// ── List reels + submissions (admin dashboard data) ─────────────────────────
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const admin = createAdminSupabaseClient()
  const [{ data: reels }, { data: submissions }] = await Promise.all([
    admin.from('reels').select('id, title, slug, published, created_at').order('created_at', { ascending: false }),
    admin.from('submissions').select('*').order('created_at', { ascending: false }).limit(50),
  ])

  const analytics = await getAnalytics(admin)

  return NextResponse.json({ reels: reels ?? [], submissions: submissions ?? [], analytics })
}

// Aggregate visits + downloads for the admin infographics. Degrades to zeros
// if the analytics_events table hasn't been migrated yet.
async function getAnalytics(admin: ReturnType<typeof createAdminSupabaseClient>) {
  const empty = { totalVisits: 0, totalDownloads: 0, series: [] as { date: string; visits: number; downloads: number }[], topIdeas: [] as { slug: string; count: number }[], ready: false }
  try {
    const since = new Date()
    since.setDate(since.getDate() - 13)
    since.setHours(0, 0, 0, 0)

    const [visitsHead, downloadsHead, recent] = await Promise.all([
      admin.from('analytics_events').select('id', { count: 'exact', head: true }).eq('type', 'visit'),
      admin.from('analytics_events').select('id', { count: 'exact', head: true }).eq('type', 'download'),
      admin.from('analytics_events').select('type, slug, created_at').gte('created_at', since.toISOString()).limit(20000),
    ])

    if (visitsHead.error || downloadsHead.error || recent.error) return empty

    // Build a 14-day daily series
    const days: { date: string; visits: number; downloads: number }[] = []
    const idx: Record<string, number> = {}
    for (let i = 0; i < 14; i++) {
      const d = new Date(since)
      d.setDate(since.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      idx[key] = days.length
      days.push({ date: key, visits: 0, downloads: 0 })
    }
    const dlCounts: Record<string, number> = {}
    for (const row of recent.data ?? []) {
      const key = String(row.created_at).slice(0, 10)
      const at = idx[key]
      if (at !== undefined) {
        if (row.type === 'download') days[at].downloads++
        else days[at].visits++
      }
      if (row.type === 'download' && row.slug) dlCounts[row.slug] = (dlCounts[row.slug] ?? 0) + 1
    }
    const topIdeas = Object.entries(dlCounts)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalVisits: visitsHead.count ?? 0,
      totalDownloads: downloadsHead.count ?? 0,
      series: days,
      topIdeas,
      ready: true,
    }
  } catch {
    return empty
  }
}

// ── Create a full idea: reel + guide + roadmaps (with file uploads) ─────────
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const admin = createAdminSupabaseClient()

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const title = (form.get('title') as string | null)?.trim()
  const description = (form.get('description') as string | null)?.trim() || null
  const videoUrl = (form.get('videoUrl') as string | null)?.trim() || null
  const durationRaw = (form.get('duration') as string | null)?.trim()
  const duration = durationRaw ? parseInt(durationRaw, 10) : null
  const guideTitle = (form.get('guideTitle') as string | null)?.trim() || null
  const guideSummary = (form.get('guideSummary') as string | null)?.trim() || null
  const roadmapsRaw = (form.get('roadmaps') as string | null) ?? '[]'
  const thumbnail = form.get('thumbnail') as File | null
  const pdf = form.get('pdf') as File | null

  if (!title || title.length < 4) {
    return NextResponse.json({ error: 'Title is required (min 4 characters).' }, { status: 400 })
  }

  let roadmaps: { name: string; duration_days?: number; cost_estimate?: string; difficulty?: number; steps?: unknown }[]
  try {
    roadmaps = JSON.parse(roadmapsRaw)
    if (!Array.isArray(roadmaps)) throw new Error()
  } catch {
    return NextResponse.json({ error: 'Roadmaps must be valid JSON.' }, { status: 400 })
  }

  const slug = slugify(title)

  // 1. Upload thumbnail (public bucket) → public URL
  let thumbnailUrl: string | null = null
  if (thumbnail && thumbnail.size > 0) {
    const ext = thumbnail.name.split('.').pop() || 'jpg'
    const path = `${slug}.${ext}`
    const { error: upErr } = await admin.storage.from('thumbnails')
      .upload(path, thumbnail, { upsert: true, contentType: thumbnail.type })
    if (upErr) {
      console.error('Thumbnail upload error:', upErr)
      return NextResponse.json({ error: 'Thumbnail upload failed: ' + upErr.message }, { status: 500 })
    }
    thumbnailUrl = admin.storage.from('thumbnails').getPublicUrl(path).data.publicUrl
  }

  // 2. Insert reel
  const { data: reel, error: reelErr } = await admin.from('reels').insert({
    title, slug, description,
    thumbnail_url: thumbnailUrl,
    video_url: videoUrl,
    duration_seconds: duration,
    published: true,
  }).select('id, slug').single()

  if (reelErr || !reel) {
    console.error('Reel insert error:', reelErr)
    return NextResponse.json({ error: 'Failed to create reel: ' + (reelErr?.message ?? '') }, { status: 500 })
  }

  // 3. Upload PDF (private bucket) + create guide
  let guideId: string | null = null
  if (pdf && pdf.size > 0) {
    const filePath = `guides/${slug}.pdf`
    const { error: pdfErr } = await admin.storage.from('guides-pdfs')
      .upload(filePath, pdf, { upsert: true, contentType: 'application/pdf' })
    if (pdfErr) {
      console.error('PDF upload error:', pdfErr)
      return NextResponse.json({ error: 'PDF upload failed: ' + pdfErr.message }, { status: 500 })
    }
    const { data: guide, error: guideErr } = await admin.from('guides').insert({
      reel_id: reel.id,
      title: guideTitle ?? `${title} — Setup Guide`,
      file_path: filePath,
      summary: guideSummary,
    }).select('id').single()
    if (guideErr || !guide) {
      console.error('Guide insert error:', guideErr)
      return NextResponse.json({ error: 'Failed to create guide: ' + (guideErr?.message ?? '') }, { status: 500 })
    }
    guideId = guide.id
  }

  // 4. Insert roadmaps (linked to the guide)
  if (guideId && roadmaps.length > 0) {
    const rows = roadmaps.map((rm) => ({
      guide_id: guideId,
      name: rm.name,
      duration_days: rm.duration_days ?? null,
      cost_estimate: rm.cost_estimate ?? null,
      difficulty: rm.difficulty ?? null,
      steps: rm.steps ?? null,
    }))
    const { error: rmErr } = await admin.from('roadmaps').insert(rows)
    if (rmErr) {
      console.error('Roadmap insert error:', rmErr)
      return NextResponse.json({ error: 'Reel created, but roadmaps failed: ' + rmErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, slug: reel.slug })
}

// ── Delete a reel (cascades guide + roadmaps) ───────────────────────────────
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const admin = createAdminSupabaseClient()
  const { error } = await admin.from('reels').delete().eq('id', id)
  if (error) {
    console.error('Delete reel error:', error)
    return NextResponse.json({ error: 'Failed to delete reel.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
