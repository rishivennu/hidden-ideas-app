import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

function isAdmin(email?: string | null): boolean {
  const list = (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  return !!email && list.includes(email.toLowerCase())
}

// Issues a one-time signed upload URL so the browser can send the video file
// STRAIGHT to Supabase Storage — bypassing the 4.5 MB Vercel request-body cap.
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isAdmin(user.email)) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  let body: { filename?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const raw = (body.filename || 'video.mp4').toLowerCase()
  const ext = (raw.split('.').pop() || 'mp4').replace(/[^a-z0-9]/g, '').slice(0, 5) || 'mp4'
  const path = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin.storage.from('reels').createSignedUploadUrl(path)
  if (error || !data) return NextResponse.json({ error: 'Could not create upload URL: ' + (error?.message ?? 'unknown') }, { status: 500 })

  const publicUrl = admin.storage.from('reels').getPublicUrl(path).data.publicUrl
  return NextResponse.json({ path: data.path, token: data.token, publicUrl })
}
