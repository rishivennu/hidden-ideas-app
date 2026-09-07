import { NextRequest, NextResponse } from 'next/server'
import { uploadVideoToGemini, waitForActive, deleteGeminiFile } from '@/lib/geminiVideo'

export const runtime = 'nodejs'
export const maxDuration = 60

const MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest']
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

const SYSTEM = `You are a meticulous Indian business-setup research analyst. You will be given a short-form business video (or just its title/description) and must produce a comprehensive, fact-checked, ACTIONABLE roadmap for starting that business IN INDIA.

Rules:
- First understand the business idea the video actually describes (watch/listen to it), then build the roadmap for THAT idea.
- Be concrete, realistic and specific to India. Use real Indian regulatory bodies (e.g. FSSAI, GST/GSTN, MCA, Udyam/MSME, local Municipal Corporation, Shops & Establishment Act, Pollution Control Board) and correct license names.
- All monetary values MUST be in Indian Rupees using the Rs symbol.
- For suppliers/manufacturers, give a useful category and an "indiamartQuery" the user can paste into IndiaMART. Do NOT invent specific company names or phone numbers.
- For competitors, name real, well-known Indian players where confident; otherwise describe the competitor type.
- Never fabricate exact statutes, fees or numbers you are unsure of — give a realistic range and note where to verify.
- Keep every text field tight, skimmable and free of markdown. No preamble.`

const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    niche: { type: 'string' },
    difficulty: { type: 'string', enum: ['Beginner', 'Moderate', 'Advanced'] },
    totalTimeline: { type: 'string' },
    estimatedCost: { type: 'string' },
    registration: { type: 'array', items: { type: 'object', properties: { step: { type: 'string' }, detail: { type: 'string' } }, required: ['step', 'detail'] } },
    licenses: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, authority: { type: 'string' }, mandatory: { type: 'boolean' }, cost: { type: 'string' }, notes: { type: 'string' } }, required: ['name', 'authority', 'mandatory'] } },
    fees: { type: 'array', items: { type: 'object', properties: { item: { type: 'string' }, amount: { type: 'string' }, frequency: { type: 'string' } }, required: ['item', 'amount'] } },
    suppliers: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, whatToLookFor: { type: 'string' }, indiamartQuery: { type: 'string' }, priceRange: { type: 'string' } }, required: ['category', 'indiamartQuery'] } },
    market: { type: 'object', properties: { overview: { type: 'string' }, trends: { type: 'array', items: { type: 'string' } }, competitors: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, positioning: { type: 'string' } }, required: ['name', 'positioning'] } } }, required: ['overview', 'trends', 'competitors'] },
    timeline: { type: 'array', items: { type: 'object', properties: { phase: { type: 'string' }, duration: { type: 'string' }, milestones: { type: 'array', items: { type: 'string' } } }, required: ['phase', 'duration', 'milestones'] } },
    challenges: { type: 'array', items: { type: 'object', properties: { challenge: { type: 'string' }, solution: { type: 'string' } }, required: ['challenge', 'solution'] } },
  },
  required: ['title', 'summary', 'difficulty', 'totalTimeline', 'estimatedCost', 'registration', 'licenses', 'fees', 'suppliers', 'market', 'timeline', 'challenges'],
}

function rid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function isFetchableVideo(url?: string | null): boolean {
  if (!url) return false
  if (/instagram\.com|youtu\.?be|tiktok\.com/i.test(url)) return false
  return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url)
}

function mimeFor(url: string): string {
  if (/\.webm(\?|$)/i.test(url)) return 'video/webm'
  if (/\.mov(\?|$)/i.test(url)) return 'video/quicktime'
  return 'video/mp4'
}

interface Parts { parts: ({ text: string } | { fileData: { mimeType: string; fileUri: string } })[] }

async function callGemini(model: string, contents: Parts[], key: string) {
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents,
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.4 },
  }
  const res = await fetch(`${BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) return { ok: false, status: res.status, body: await res.text().catch(() => '') }
  const j = await res.json()
  const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
  return { ok: true, status: 200, text }
}

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return NextResponse.json({ error: 'The roadmap engine is not configured yet (missing GEMINI_API_KEY).' }, { status: 503 })

  let input: { videoUrl?: string | null; title?: string; description?: string | null }
  try { input = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const title = (input.title || '').trim()
  if (!title) return NextResponse.json({ error: 'Missing reel title.' }, { status: 400 })
  const description = (input.description || '').trim()

  let geminiFileName: string | null = null
  let videoPart: { fileData: { mimeType: string; fileUri: string } } | null = null
  if (isFetchableVideo(input.videoUrl)) {
    try {
      const vres = await fetch(input.videoUrl as string)
      if (vres.ok) {
        const buf = Buffer.from(await vres.arrayBuffer())
        if (buf.byteLength > 0 && buf.byteLength <= MAX_VIDEO_BYTES) {
          const mime = mimeFor(input.videoUrl as string)
          const file = await uploadVideoToGemini(buf, mime, key)
          if (file && (await waitForActive(file.name, key))) {
            geminiFileName = file.name
            videoPart = { fileData: { mimeType: file.mimeType, fileUri: file.uri } }
          } else if (file) {
            await deleteGeminiFile(file.name, key)
          }
        }
      }
    } catch { /* fall through to text-only */ }
  }

  const guidance = [`Reel title: ${title}.`]
  if (description) guidance.push(`Reel description: ${description}.`)
  const promptText = videoPart
    ? `Watch this business reel and build the full India roadmap for the idea it describes. ${guidance.join(' ')}`
    : `Build the full India roadmap for this business idea. ${guidance.join(' ')}`

  const contents: Parts[] = [{ parts: videoPart ? [videoPart, { text: promptText }] : [{ text: promptText }] }]

  let lastErr = 'The roadmap engine is busy. Please try again in a moment.'
  try {
    for (const model of MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await callGemini(model, contents, key)
          if (r.ok && r.text) {
            let parsed: Record<string, unknown>
            try { parsed = JSON.parse(r.text) } catch { lastErr = 'The engine returned an unreadable response. Please try again.'; break }
            const roadmap = {
              id: rid(),
              ...parsed,
              title: (parsed.title as string) || title,
              model: model + (videoPart ? ' (video)' : ' (text)'),
              createdAt: Date.now(),
              input: { topic: title },
              fromVideo: !!videoPart,
            }
            return NextResponse.json(roadmap)
          }
          if (r.status === 503 || r.status === 429) { lastErr = 'High demand right now.'; await sleep(700); continue }
          lastErr = `Model ${model} error ${r.status}.`
          break
        } catch (e) {
          lastErr = e instanceof Error ? e.message : 'Network error.'
          await sleep(500)
        }
      }
    }
  } finally {
    if (geminiFileName) await deleteGeminiFile(geminiFileName, key)
  }
  return NextResponse.json({ error: `Could not generate a roadmap right now. ${lastErr}` }, { status: 503 })
}
