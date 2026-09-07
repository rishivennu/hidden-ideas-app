// Gemini Files API helpers — upload a video once, wait for it to finish
// processing, then it can be referenced by URI in a generateContent call.
// Server-only (uses the raw GEMINI_API_KEY). Runtime must be 'nodejs'.

const UPLOAD_BASE = 'https://generativelanguage.googleapis.com/upload/v1beta/files'
const FILES_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export interface GeminiFile { uri: string; name: string; mimeType: string }

// Resumable upload of raw bytes. Returns the file resource or null on failure.
export async function uploadVideoToGemini(
  bytes: Buffer,
  mimeType: string,
  key: string,
): Promise<GeminiFile | null> {
  const size = bytes.byteLength
  const start = await fetch(UPLOAD_BASE, {
    method: 'POST',
    headers: {
      'x-goog-api-key': key,
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': String(size),
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: { display_name: 'reel-video' } }),
  })
  if (!start.ok) return null
  const uploadUrl = start.headers.get('x-goog-upload-url')
  if (!uploadUrl) return null

  const up = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'x-goog-api-key': key,
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
      'Content-Length': String(size),
    },
    body: bytes as unknown as BodyInit,
  })
  if (!up.ok) return null
  const j = await up.json().catch(() => null)
  const f = j?.file
  if (!f?.uri || !f?.name) return null
  return { uri: f.uri, name: f.name, mimeType: f.mimeType ?? mimeType }
}

// Poll until the uploaded file is ACTIVE (video needs a few seconds to process).
export async function waitForActive(name: string, key: string, tries = 12): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(`${FILES_BASE}/${name}`, { headers: { 'x-goog-api-key': key } })
    if (res.ok) {
      const j = await res.json().catch(() => null)
      if (j?.state === 'ACTIVE') return true
      if (j?.state === 'FAILED') return false
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  return false
}

// Best-effort cleanup so uploaded reels don't accumulate in the Files store.
export async function deleteGeminiFile(name: string, key: string): Promise<void> {
  try { await fetch(`${FILES_BASE}/${name}`, { method: 'DELETE', headers: { 'x-goog-api-key': key } }) } catch {}
}
