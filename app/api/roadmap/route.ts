import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// Fallback order: lite is fastest + most reliable; the others are richer but
// spike-limited. We retry each on 503/429 before moving to the next.
const MODELS = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.6-flash']
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const SYSTEM = `You are a meticulous Indian business-setup research analyst. Given a business idea (and optional niche, budget and timeframe), produce a comprehensive, fact-checked, ACTIONABLE roadmap for starting that business IN INDIA.

Rules:
- Be concrete, realistic and specific to India. Use real Indian regulatory bodies (e.g. FSSAI, GST/GSTN, MCA, Udyam/MSME, local Municipal Corporation, Shops & Establishment Act, Pollution Control Board) and correct license names.
- All monetary values MUST be in Indian Rupees using the ₹ symbol.
- For suppliers/manufacturers, give a useful category and an "indiamartQuery" the user can paste into IndiaMART to find real vendors. Do NOT invent specific company names or phone numbers.
- For competitors, name real, well-known Indian players where you are confident; otherwise describe the competitor type.
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

function buildPrompt(b: { topic: string; niche?: string; budget?: string; timeframe?: string; experience?: string }): string {
  const parts = [`Business idea: ${b.topic}.`]
  if (b.niche) parts.push(`Niche / focus: ${b.niche}.`)
  if (b.budget) parts.push(`Available budget: ${b.budget}.`)
  if (b.timeframe) parts.push(`Target timeframe: ${b.timeframe}.`)
  if (b.experience) parts.push(`Founder experience level: ${b.experience}.`)
  return parts.join(' ')
}

async function callGemini(model: string, prompt: string, key: string): Promise<{ ok: boolean; status: number; text?: string; body?: string }> {
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ parts: [{ text: prompt }] }],
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return NextResponse.json({ error: 'The roadmap engine is not configured yet (missing GEMINI_API_KEY).' }, { status: 503 })

  let input: { topic?: string; niche?: string; budget?: string; timeframe?: string; experience?: string }
  try { input = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const topic = (input.topic || '').trim()
  if (!topic) return NextResponse.json({ error: 'Please enter a business idea or topic.' }, { status: 400 })
  if (topic.length > 200) return NextResponse.json({ error: 'That topic is too long — keep it under 200 characters.' }, { status: 400 })

  const prompt = buildPrompt({ topic, niche: input.niche?.trim(), budget: input.budget?.trim(), timeframe: input.timeframe?.trim(), experience: input.experience?.trim() })

  let lastErr = 'The roadmap engine is busy. Please try again in a moment.'
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await callGemini(model, prompt, key)
        if (r.ok && r.text) {
          let parsed: Record<string, unknown>
          try { parsed = JSON.parse(r.text) } catch { lastErr = 'The engine returned an unreadable response. Please try again.'; break }
          const roadmap = {
            id: rid(),
            ...parsed,
            niche: (parsed.niche as string) || input.niche?.trim() || undefined,
            model,
            createdAt: Date.now(),
            input: { topic, niche: input.niche?.trim(), budget: input.budget?.trim(), timeframe: input.timeframe?.trim(), experience: input.experience?.trim() },
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
  return NextResponse.json({ error: `Could not generate a roadmap right now. ${lastErr}` }, { status: 503 })
}
