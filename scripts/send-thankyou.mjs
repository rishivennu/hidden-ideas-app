#!/usr/bin/env node
// One-off thank-you blast to a list of emails via the Resend API.
//
// Usage:
//   RESEND_API_KEY=re_xxx RESEND_FROM="biz <hi@yourdomain.com>" \
//     node scripts/send-thankyou.mjs path/to/emails.csv
//   (bun scripts/send-thankyou.mjs emails.csv also works)
//
// CSV format: a header row with an "email" column (and optional "name" column),
// OR just one email per line. Examples:
//   email,name
//   a@x.com,Asha
//   b@y.com
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hidden-ideas.vercel.app'
const FROM = process.env.RESEND_FROM || 'biz <onboarding@resend.dev>'
const KEY = process.env.RESEND_API_KEY
const DRY = process.argv.includes('--dry-run')

const file = process.argv.find((a, i) => i >= 2 && !a.startsWith('--'))
if (!file) { console.error('Usage: node scripts/send-thankyou.mjs emails.csv [--dry-run]'); process.exit(1) }
if (!KEY && !DRY) { console.error('RESEND_API_KEY is not set. Add it or pass --dry-run to preview.'); process.exit(1) }

// ---- parse CSV (tolerant: header optional, email-only lines allowed) -------
const raw = readFileSync(file, 'utf8').trim()
const lines = raw.split(/\r?\n/).filter(Boolean)
let emailIdx = 0, nameIdx = -1, start = 0
const header = lines[0].toLowerCase()
if (header.includes('email')) {
  const cols = splitCsv(lines[0]).map((c) => c.trim().toLowerCase())
  emailIdx = cols.indexOf('email'); nameIdx = cols.indexOf('name'); start = 1
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const recipients = []
const seen = new Set()
for (let i = start; i < lines.length; i++) {
  const cols = splitCsv(lines[i])
  const email = (cols[emailIdx] || '').trim()
  const name = nameIdx >= 0 ? (cols[nameIdx] || '').trim() : ''
  if (!EMAIL_RE.test(email)) { console.warn(`skip invalid: ${lines[i]}`); continue }
  const low = email.toLowerCase()
  if (seen.has(low)) continue
  seen.add(low)
  recipients.push({ email, name })
}

console.log(`Parsed ${recipients.length} unique valid recipients from ${file}.`)
if (DRY) {
  console.log('--dry-run: no emails sent. First 3:', recipients.slice(0, 3))
  process.exit(0)
}

// ---- send sequentially, gently (Resend free tier ~2 req/s) -----------------
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
let ok = 0, fail = 0
for (const [i, r] of recipients.entries()) {
  const { subject, html, text } = thankYouEmail(r.name)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: r.email, subject, html, text }),
    })
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
    ok++
    process.stdout.write(`\r[${i + 1}/${recipients.length}] sent to ${r.email}            `)
  } catch (e) {
    fail++
    console.error(`\nFAILED ${r.email}: ${e.message}`)
  }
  await wait(600) // ~1.6/s, safely under the rate limit
}
console.log(`\nDone. Sent ${ok}, failed ${fail}.`)

// ---- helpers ---------------------------------------------------------------
function splitCsv(line) {
  // minimal CSV split honoring double-quoted fields
  const out = []; let cur = '', q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ } else if (c === '"') q = false; else cur += c }
    else { if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = '' } else cur += c }
  }
  out.push(cur)
  return out
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// Kept identical to lib/email.ts thankYouEmail so both channels look the same.
function thankYouEmail(name) {
  const hi = name && name.trim() ? `Hi ${escapeHtml(name.trim())},` : 'Hi there,'
  const subject = 'Thanks for joining biz 🎉'
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FFFDF5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#141414;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#FFE111;border:2px solid #141414;border-radius:24px;box-shadow:4px 4px 0 #141414;padding:32px 28px;text-align:center;">
      <div style="font-size:26px;font-weight:800;letter-spacing:-0.02em;">biz</div>
      <h1 style="font-size:26px;line-height:1.2;margin:18px 0 8px;font-weight:800;">Thanks for signing up! 🎉</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 auto 22px;max-width:380px;">${hi} welcome aboard. You now have free access to fact-checked, India-ready business roadmaps — registration, licences, fees in ₹, suppliers, market and timeline for any idea.</p>
      <a href="${SITE}/builder" style="display:inline-block;background:#141414;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:999px;">Build your first roadmap →</a>
    </div>
    <p style="font-size:13px;line-height:1.6;color:#5B5B52;text-align:center;margin:20px 0 0;">
      You're getting this because you signed up at <a href="${SITE}" style="color:#2E5BFF;">biz</a>.<br>
      Not you? Just ignore this email.
    </p>
  </div>
</body></html>`
  const text = `${name && name.trim() ? `Hi ${name.trim()},` : 'Hi there,'} thanks for signing up at biz! Build your first roadmap: ${SITE}/builder`
  return { subject, html, text }
}
