// Framework-agnostic email helper. Talks to the Resend REST API directly with
// fetch, so there is no SDK dependency to install. Used by the welcome webhook
// (app/api/hooks/welcome). The one-off CSV blast in scripts/send-thankyou.mjs
// keeps its own inline copy so it can run with zero project imports.

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export function fromAddress(): string {
  // e.g. "biz <hi@yourdomain.com>". Falls back to Resend's shared test sender.
  return process.env.RESEND_FROM || 'biz <onboarding@resend.dev>'
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://hidden-ideas.vercel.app'
}

// The branded thank-you. `name` is optional; falls back to a warm generic.
export function thankYouEmail(name?: string | null): { subject: string; html: string; text: string } {
  const hi = name && name.trim() ? `Hi ${escapeHtml(name.trim())},` : 'Hi there,'
  const url = siteUrl()
  const subject = 'Thanks for joining biz 🎉'

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FFFDF5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#141414;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#FFE111;border:2px solid #141414;border-radius:24px;box-shadow:4px 4px 0 #141414;padding:32px 28px;text-align:center;">
      <div style="font-size:26px;font-weight:800;letter-spacing:-0.02em;">biz</div>
      <h1 style="font-size:26px;line-height:1.2;margin:18px 0 8px;font-weight:800;">Thanks for signing up! 🎉</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 auto 22px;max-width:380px;">${hi} welcome aboard. You now have free access to fact-checked, India-ready business roadmaps — registration, licences, fees in ₹, suppliers, market and timeline for any idea.</p>
      <a href="${url}/builder" style="display:inline-block;background:#141414;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:999px;">Build your first roadmap →</a>
    </div>
    <p style="font-size:13px;line-height:1.6;color:#5B5B52;text-align:center;margin:20px 0 0;">
      You're getting this because you signed up at <a href="${url}" style="color:#2E5BFF;">biz</a>.<br>
      Not you? Just ignore this email.
    </p>
  </div>
</body></html>`

  const text = `${name && name.trim() ? `Hi ${name.trim()},` : 'Hi there,'} thanks for signing up at biz! You now have free access to fact-checked, India-ready business roadmaps. Build your first one: ${url}/builder`

  return { subject, html, text }
}

// Send one email via Resend. Throws on non-2xx so callers can log/retry.
export async function sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromAddress(), to, subject, html, text }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend ${res.status}: ${detail}`)
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
