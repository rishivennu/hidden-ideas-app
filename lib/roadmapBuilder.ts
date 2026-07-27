// Deterministic roadmap generator + localStorage store for the /builder tool.
// Takes a user's idea + constraints and produces a detailed, phased,
// start-to-finish plan the user can edit, track, save and export.

export type Experience = 'beginner' | 'intermediate' | 'pro'

export interface BuilderInput {
  title: string
  goal: string
  category: string
  budget: number // total rupees
  weeks: number // total timeframe in weeks
  hoursPerWeek: number
  experience: Experience
}

export interface BuiltStep {
  id: string
  title: string
  description: string
  deliverable: string
  days: number
  cost: number // rupees
  done: boolean
}

export interface BuiltPhase {
  id: string
  name: string
  summary: string
  color: string
  steps: BuiltStep[]
}

export interface BuiltRoadmap {
  id: string
  title: string
  goal: string
  category: string
  input: BuilderInput
  phases: BuiltPhase[]
  createdAt: number
  updatedAt: number
}

interface Tpl { title: string; description: string; deliverable: string }

const PHASE_META = [
  { name: 'Validate the idea', summary: 'Prove people want this before you spend real money.', color: '#8FD3FF', dayW: 0.10, costW: 0.05 },
  { name: 'Set up foundations', summary: 'Get the name, money and tools in place.', color: '#FFE111', dayW: 0.12, costW: 0.20 },
  { name: 'Build the MVP', summary: 'Create the smallest version that delivers real value.', color: '#FF5CA8', dayW: 0.30, costW: 0.40 },
  { name: 'Launch', summary: 'Put it live and tell the world.', color: '#7B6EF6', dayW: 0.15, costW: 0.15 },
  { name: 'Get first customers', summary: 'Turn attention into your first revenue.', color: '#FF6A2B', dayW: 0.18, costW: 0.12 },
  { name: 'Grow & systemize', summary: 'Make it repeatable and plan the next 90 days.', color: '#2FB457', dayW: 0.15, costW: 0.08 },
]

// Generic step bank per phase (index matches PHASE_META).
const GENERIC: Tpl[][] = [
  [
    { title: 'Clarify the offer', description: 'Write one sentence: who it is for and the problem it solves.', deliverable: 'One-line value prop' },
    { title: 'Study 5 competitors', description: 'List 5 people or companies already doing this. Note their pricing and gaps.', deliverable: 'Competitor sheet' },
    { title: 'Talk to 10 potential customers', description: 'Short calls or DMs to confirm the pain is real and worth paying for.', deliverable: '10 interview notes' },
    { title: 'Size the money', description: 'Estimate what one customer pays and how many you can realistically reach.', deliverable: 'Rough revenue math' },
    { title: 'Make the go / no-go call', description: 'Green-light only if demand and margin both look real.', deliverable: 'Go decision' },
  ],
  [
    { title: 'Lock the name & domain', description: 'Pick a name, buy the domain, set up a professional email.', deliverable: 'Name + domain' },
    { title: 'Money & compliance', description: 'Open a separate account and note the licences or GST you will need.', deliverable: 'Bank + compliance list' },
    { title: 'Brand starter kit', description: 'Simple logo, colors, a one-line bio and profile photos.', deliverable: 'Brand kit' },
    { title: 'Pick your tools', description: 'Choose the 3-4 tools you will actually use. No bloat.', deliverable: 'Tool list + logins' },
  ],
  [
    { title: 'Define the smallest version', description: 'List only the features or steps needed for v1. Cut everything else.', deliverable: 'MVP scope' },
    { title: 'Build the core', description: 'Create the product or service that delivers the core value.', deliverable: 'Working v1' },
    { title: 'Set up delivery', description: 'Decide how the customer receives it: page, checkout, DM or in person.', deliverable: 'Delivery flow' },
    { title: 'Price it', description: 'Set launch pricing with room for an early-bird founder discount.', deliverable: 'Pricing' },
    { title: 'Test with 3 people', description: 'Get 3 friendly users to run through it end-to-end; fix what breaks.', deliverable: 'Fixed v1' },
  ],
  [
    { title: 'Build a simple landing page', description: 'One page: promise, proof, price and a clear call to action.', deliverable: 'Live page' },
    { title: 'Prepare launch content', description: 'Write 5 posts plus one pinned announcement telling your story.', deliverable: 'Content pack' },
    { title: 'Set up payments', description: 'Wire up Razorpay / UPI / Stripe so you can actually get paid.', deliverable: 'Working checkout' },
    { title: 'Go live', description: 'Publish, post everywhere and message everyone who might care.', deliverable: 'Public launch' },
  ],
  [
    { title: 'Run an outreach sprint', description: 'DM or email ~10 warm leads a day for two weeks straight.', deliverable: 'Outreach log' },
    { title: 'Collect proof', description: 'Ask every early user for a testimonial or a before/after result.', deliverable: '3+ testimonials' },
    { title: 'Run one paid experiment', description: 'Test a single paid or referral channel with a tiny budget.', deliverable: 'Channel test result' },
    { title: 'Hit your first revenue milestone', description: 'Push hard to reach your first concrete revenue target.', deliverable: 'First revenue' },
  ],
  [
    { title: 'Write your SOPs', description: 'Document how each recurring task gets done, step by step.', deliverable: 'SOP doc' },
    { title: 'Automate the repetitive', description: 'Automate or template your top 3 time-sinks.', deliverable: '3 automations' },
    { title: 'Set weekly metrics', description: 'Track leads, sales and revenue in one simple dashboard.', deliverable: 'Metrics sheet' },
    { title: 'Plan the next 90 days', description: 'Pick the single lever to scale and set your next target.', deliverable: '90-day plan' },
  ],
]

// Category-specific steps injected into the phase at the given index.
const CATEGORY_EXTRAS: Record<string, { phase: number; step: Tpl }[]> = {
  'E-commerce': [
    { phase: 2, step: { title: 'Source your first products', description: 'Line up a supplier or manufacturer for your initial stock.', deliverable: 'First inventory' } },
    { phase: 3, step: { title: 'List on a marketplace', description: 'Also list on Amazon / Flipkart / an Instagram shop for reach.', deliverable: 'Live listings' } },
  ],
  'Content': [
    { phase: 2, step: { title: 'Produce 5 pillar pieces', description: 'Batch-create your 5 strongest posts or videos.', deliverable: 'Content bank' } },
    { phase: 5, step: { title: 'Set a publishing calendar', description: 'A consistent schedule you can actually sustain.', deliverable: 'Content calendar' } },
  ],
  'Digital Products': [
    { phase: 2, step: { title: 'Create the digital asset', description: 'Package your template / course / tool for download.', deliverable: 'Downloadable product' } },
    { phase: 3, step: { title: 'Set up instant delivery', description: 'Use Gumroad / Payhip so purchases auto-deliver.', deliverable: 'Auto-delivery store' } },
  ],
  'Local Services': [
    { phase: 0, step: { title: 'Map your service area', description: 'Define the neighborhoods and radius you will cover.', deliverable: 'Service-area map' } },
    { phase: 3, step: { title: 'Get listed locally', description: 'Set up a Google Business Profile and join local groups.', deliverable: 'Local listings' } },
  ],
  'Automation': [
    { phase: 2, step: { title: 'Map the workflow end-to-end', description: 'Diagram every trigger, step and output before building.', deliverable: 'Workflow map' } },
    { phase: 2, step: { title: 'Wire up the automation', description: 'Connect the tools / APIs and handle the error cases.', deliverable: 'Working automation' } },
  ],
  'Real Estate': [
    { phase: 0, step: { title: 'Analyze 5 deals on paper', description: 'Run the numbers on 5 real listings before committing.', deliverable: 'Deal analysis' } },
    { phase: 1, step: { title: 'Line up financing', description: 'Talk to 2 lenders or partners about the capital you need.', deliverable: 'Financing plan' } },
  ],
  'Finance': [
    { phase: 1, step: { title: 'Sort licences & compliance', description: 'Confirm any SEBI / RBI / registration requirements up front.', deliverable: 'Compliance checklist' } },
    { phase: 5, step: { title: 'Add a second revenue stream', description: 'Layer on a complementary offer once the first one works.', deliverable: 'New revenue stream' } },
  ],
}

function rid(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function formatINR(n: number): string {
  if (n <= 0) return '₹0'
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(1)}cr`
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(1)}L`
  if (n >= 1e3) return `₹${Math.round(n / 1e3)}k`
  return `₹${Math.round(n)}`
}

export function buildRoadmap(input: BuilderInput): BuiltRoadmap {
  const totalDays = Math.max(7, Math.round(input.weeks * 7))
  const extras = CATEGORY_EXTRAS[input.category] ?? []

  const phases: BuiltPhase[] = PHASE_META.map((meta, i) => {
    const tpls: Tpl[] = [...GENERIC[i]]

    // inject category-specific steps
    for (const e of extras) if (e.phase === i) tpls.push(e.step)

    // experience tweaks
    if (input.experience === 'beginner' && i === 0) {
      tpls.unshift({ title: 'Learn the fundamentals', description: 'Spend a few focused hours understanding how this business actually works.', deliverable: 'Notes / short course done' })
    }
    if (input.experience === 'pro' && i === 5) {
      tpls.push({ title: 'Launch a premium tier', description: 'Add a higher-priced offer for your best customers.', deliverable: 'Premium offer live' })
    }

    const phaseDays = Math.max(tpls.length, Math.round(totalDays * meta.dayW))
    const phaseCost = Math.round(input.budget * meta.costW)
    const perDays = Math.max(1, Math.round(phaseDays / tpls.length))
    const perCost = Math.round(phaseCost / tpls.length / 100) * 100

    return {
      id: rid(),
      name: meta.name,
      summary: meta.summary,
      color: meta.color,
      steps: tpls.map((t) => ({ id: rid(), ...t, days: perDays, cost: perCost, done: false })),
    }
  })

  const now = Date.now()
  return {
    id: rid(),
    title: input.title.trim() || 'My business roadmap',
    goal: input.goal.trim(),
    category: input.category,
    input,
    phases,
    createdAt: now,
    updatedAt: now,
  }
}

// ---- Derived helpers ----
export function totalDays(r: BuiltRoadmap): number {
  return r.phases.reduce((s, p) => s + p.steps.reduce((a, b) => a + b.days, 0), 0)
}
export function totalCost(r: BuiltRoadmap): number {
  return r.phases.reduce((s, p) => s + p.steps.reduce((a, b) => a + b.cost, 0), 0)
}
export function progress(r: BuiltRoadmap): { done: number; total: number; pct: number } {
  let done = 0, total = 0
  for (const p of r.phases) for (const s of p.steps) { total++; if (s.done) done++ }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

// ---- localStorage store ----
const KEY = 'biz:roadmaps'

export function loadAll(): BuiltRoadmap[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
export function loadOne(id: string): BuiltRoadmap | null {
  return loadAll().find((r) => r.id === id) ?? null
}
export function saveRoadmap(r: BuiltRoadmap): void {
  if (typeof window === 'undefined') return
  const all = loadAll().filter((x) => x.id !== r.id)
  all.unshift({ ...r, updatedAt: Date.now() })
  try { localStorage.setItem(KEY, JSON.stringify(all.slice(0, 30))) } catch {}
}
export function deleteRoadmap(id: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(KEY, JSON.stringify(loadAll().filter((r) => r.id !== id))) } catch {}
}
