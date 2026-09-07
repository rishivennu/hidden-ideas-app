// AI (Gemini) powered business roadmap — types, client fetch helper, and a
// localStorage store for the /builder tool. The actual Gemini call happens
// server-side in app/api/roadmap/route.ts (keeps the key off the client).

export type Difficulty = 'Beginner' | 'Moderate' | 'Advanced'

export interface RoadmapInput {
  topic: string
  niche?: string
  budget?: string
  timeframe?: string
  experience?: string
}

export interface RegStep { step: string; detail: string }
export interface License { name: string; authority: string; mandatory: boolean; cost?: string; notes?: string }
export interface Fee { item: string; amount: string; frequency?: string }
export interface Supplier { category: string; whatToLookFor?: string; indiamartQuery: string; priceRange?: string }
export interface Competitor { name: string; positioning: string }
export interface Market { overview: string; trends: string[]; competitors: Competitor[] }
export interface TimelinePhase { phase: string; duration: string; milestones: string[] }
export interface Challenge { challenge: string; solution: string }

// Exactly the 7 sections the product promises, plus header meta.
export interface AIRoadmap {
  id: string
  title: string
  summary: string
  niche?: string
  difficulty: Difficulty
  totalTimeline: string
  estimatedCost: string
  registration: RegStep[]      // 1. Registration process
  licenses: License[]          // 2. Licenses & permissions
  fees: Fee[]                  // 3. Charges & fees (₹)
  suppliers: Supplier[]        // 4. Suppliers / manufacturers (IndiaMART)
  market: Market               // 5. Market insights & competitor analysis
  timeline: TimelinePhase[]    // 6. Estimated timelines
  challenges: Challenge[]      // 7. Common challenges & solutions
  model?: string
  createdAt: number
  input: RoadmapInput
}

// Build an IndiaMART search URL for a supplier query.
export function indiamartUrl(query: string): string {
  return `https://dir.indiamart.com/search.mspx?ss=${encodeURIComponent(query)}`
}

// Call the server route which talks to Gemini. Throws on failure.
export async function generateRoadmap(input: RoadmapInput, signal?: AbortSignal): Promise<AIRoadmap> {
  const res = await fetch('/api/roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data || data.error) {
    throw new Error(data?.error || `Roadmap generation failed (${res.status})`)
  }
  return data as AIRoadmap
}

// ---- localStorage store (per-device, like the old builder) ----
const KEY = 'biz:ai-roadmaps'

export function loadAll(): AIRoadmap[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
export function loadOne(id: string): AIRoadmap | null {
  return loadAll().find((r) => r.id === id) ?? null
}
export function saveRoadmap(r: AIRoadmap): void {
  if (typeof window === 'undefined') return
  const all = loadAll().filter((x) => x.id !== r.id)
  all.unshift(r)
  try { localStorage.setItem(KEY, JSON.stringify(all.slice(0, 30))) } catch {}
}
export function deleteRoadmap(id: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(KEY, JSON.stringify(loadAll().filter((r) => r.id !== id))) } catch {}
}
