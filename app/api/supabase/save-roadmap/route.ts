import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const userSupabase = createServerSupabaseClient()
  const { data: { user } } = await userSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: { roadmapId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { roadmapId } = body
  if (!roadmapId || typeof roadmapId !== 'string') {
    return NextResponse.json({ error: 'roadmapId is required' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  // Verify roadmap exists
  const { data: roadmap } = await admin.from('roadmaps').select('id').eq('id', roadmapId).single()
  if (!roadmap) return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })

  // Upsert to avoid duplicates
  const { error } = await admin.from('saved_roadmaps').upsert({
    user_id: user.id,
    roadmap_id: roadmapId,
  }, { onConflict: 'user_id,roadmap_id' })

  if (error) {
    console.error('Save roadmap error:', error)
    return NextResponse.json({ error: 'Failed to save roadmap' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const userSupabase = createServerSupabaseClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const roadmapId = searchParams.get('roadmapId')
  if (!roadmapId) return NextResponse.json({ error: 'roadmapId is required' }, { status: 400 })

  const admin = createAdminSupabaseClient()
  await admin.from('saved_roadmaps').delete().eq('user_id', user.id).eq('roadmap_id', roadmapId)

  return NextResponse.json({ success: true })
}
