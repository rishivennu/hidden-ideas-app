import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const WINDOW_MS = 60_000

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
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many submissions. Try again in a minute.' }, { status: 429 })
  }

  let body: { title?: string; description?: string; email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const title = body.title?.trim()
  const description = body.description?.trim() ?? null
  const email = body.email?.trim() ?? null

  if (!title || title.length < 4) {
    return NextResponse.json({ error: 'Please enter a descriptive title (min 4 characters).' }, { status: 400 })
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminSupabaseClient()
  } catch (e) {
    console.error('Submit config error:', e)
    return NextResponse.json({ error: 'Server is not configured to save submissions (missing SUPABASE_SERVICE_ROLE_KEY). Contact the site owner.' }, { status: 500 })
  }

  const { error } = await admin.from('submissions').insert({ title, description, email })

  if (error) {
    console.error('Submission insert error:', error)
    // 42P01 = undefined_table — the migration hasn't been run on this database.
    if (error.code === '42P01') {
      return NextResponse.json({ error: 'Submissions table is missing. Run migration 001_initial.sql in Supabase.' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to save submission. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
