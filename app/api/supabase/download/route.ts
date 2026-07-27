import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabaseServer'

// Simple in-memory rate limiter (per IP, resets on cold start)
// For production, replace with Upstash Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const WINDOW_MS = 60_000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: { guideId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { guideId } = body
  if (!guideId || typeof guideId !== 'string') {
    return NextResponse.json({ error: 'guideId is required' }, { status: 400 })
  }

  // Check auth — if guide requires sign-in, validate JWT
  const userSupabase = createServerSupabaseClient()
  const { data: { user } } = await userSupabase.auth.getUser()

  // Fetch guide record (using admin to bypass RLS for this lookup)
  const admin = createAdminSupabaseClient()
  const { data: guide, error: guideError } = await admin
    .from('guides')
    .select('id, file_path, title')
    .eq('id', guideId)
    .single()

  if (guideError || !guide) {
    return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
  }

  // For gated content, require auth
  // (Add your gating logic here — currently all guides require sign-in)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  // Generate signed URL (10-minute expiry)
  const { data: signedData, error: signedError } = await admin.storage
    .from('guides-pdfs')
    .createSignedUrl(guide.file_path, 600)

  if (signedError || !signedData?.signedUrl) {
    console.error('Signed URL error:', signedError)
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
  }

   // Log download
  if (user) {
    const { error: logError } = await admin.from('downloads').insert({
      user_id: user.id,
      guide_id: guide.id,
    })
    if (logError) console.error('Download log error:', logError)
  }

  return NextResponse.json({
    url: signedData.signedUrl,
    expiresAt: new Date(Date.now() + 600_000).toISOString(),
    title: guide.title,
  })
}
