import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, thankYouEmail } from '@/lib/email'

export const runtime = 'nodejs'

// Supabase Database Webhook target: fires on INSERT into auth.users, so every
// new sign-up automatically gets the thank-you email.
//
// Set up in Supabase → Database → Webhooks:
//   • Table: auth.users   • Events: INSERT   • Type: HTTP POST
//   • URL:  https://<your-site>/api/hooks/welcome
//   • HTTP header:  x-webhook-secret: <same value as SUPABASE_WEBHOOK_SECRET>
//
// The shared secret is the only thing standing between this route and the open
// internet, so it must match the env var or we reject the request.
export async function POST(req: NextRequest) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET
  if (!secret || req.headers.get('x-webhook-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  // Supabase webhook shape: { type, table, record: {...} }
  const record = payload?.record ?? {}
  const email: string | undefined = record.email
  if (!email) {
    // Not a user row we can email (e.g. phone-only). Ack so Supabase doesn't retry.
    return NextResponse.json({ skipped: 'no email' })
  }

  // Prefer a display name if the provider gave us one.
  const name: string | null =
    record.raw_user_meta_data?.full_name ||
    record.raw_user_meta_data?.name ||
    null

  try {
    const { subject, html, text } = thankYouEmail(name)
    await sendEmail(email, subject, html, text)
    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[welcome] send failed:', err)
    return NextResponse.json({ error: 'send failed' }, { status: 500 })
  }
}
