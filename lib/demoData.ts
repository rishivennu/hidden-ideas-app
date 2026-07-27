// Built-in library of hidden business ideas. Powers the app even with an empty
// database, so users always see rich, engaging content. Admin-added reels merge on top.

export interface DemoStep {
  order: number
  title: string
  description: string
  deliverable?: string
}

export interface DemoRoadmap {
  id: string
  name: string
  duration_days: number
  cost_estimate: string
  difficulty: number // 1-5
  steps: DemoStep[]
}

export interface Idea {
  slug: string
  title: string
  tagline: string
  category: string
  description: string
  passiveScore: number   // 1-5 passive-income potential
  startupCost: string
  monthlyPotential: string
  difficulty: number     // 1-5
  timeToFirst: string    // time to first revenue
  tags: string[]
  roadmaps: DemoRoadmap[]
}

export const CATEGORIES = [
  'All',
  'E-commerce',
  'Content',
  'Digital Products',
  'Local Services',
  'Automation',
  'Real Estate',
  'Finance',
] as const

export const IDEAS: Idea[] = [
  {
    slug: 'micro-fulfillment-kiosk',
    title: 'Micro-Fulfillment Kiosk',
    tagline: 'Turn unused retail corners into tiny fulfillment hubs.',
    category: 'Local Services',
    description:
      'Partner with local convenience stores to place a small managed shelf of fast-moving products on a revenue-share deal. Low cost, quick to test, and scalable to multiple locations.',
    passiveScore: 3,
    startupCost: '₹15k–₹40k',
    monthlyPotential: '₹1.5L–₹6L',
    difficulty: 2,
    timeToFirst: '2–4 weeks',
    tags: ['retail', 'inventory', 'local', 'revenue-share'],
    roadmaps: [
      {
        id: 'mfk-mvp',
        name: 'Weekend MVP',
        duration_days: 30,
        cost_estimate: '₹15k–₹40k',
        difficulty: 2,
        steps: [
          { order: 1, title: 'Find a retail partner', description: 'Pitch 5 local stores a 15–20% revenue share for shelf space.', deliverable: 'Signed 30-day trial' },
          { order: 2, title: 'Source inventory', description: 'Pick 10–15 fast-moving SKUs from a local distributor.', deliverable: '₹12k starter stock' },
          { order: 3, title: 'Set up the kiosk', description: 'Use a 3-shelf display, clear labels and price tags.', deliverable: 'Live kiosk' },
          { order: 4, title: 'Track weekly sell-through', description: 'A simple sheet tracking units sold per SKU.', deliverable: 'Week-1 data' },
        ],
      },
      {
        id: 'mfk-scale',
        name: 'Local Scale',
        duration_days: 90,
        cost_estimate: '₹80k–₹2.5L',
        difficulty: 3,
        steps: [
          { order: 1, title: 'Expand to 3 locations', description: 'Replicate the model at nearby stores.' },
          { order: 2, title: 'Negotiate volume margins', description: 'Order larger quantities for 10–15% distributor discounts.' },
          { order: 3, title: 'Hire a restock runner', description: 'Pay per-visit to free your own time.' },
        ],
      },
    ],
  },
  {
    slug: 'niche-newsletter-engine',
    title: 'Niche Newsletter Engine',
    tagline: 'A tiny paid newsletter for an underserved profession.',
    category: 'Content',
    description:
      'Pick a narrow professional niche, publish a weekly curated newsletter, and monetize through sponsorships and a paid tier. Compounds into a durable, mostly-passive asset.',
    passiveScore: 4,
    startupCost: '₹0–₹8k',
    monthlyPotential: '₹80k–₹8L',
    difficulty: 2,
    timeToFirst: '4–8 weeks',
    tags: ['writing', 'audience', 'sponsorship', 'email'],
    roadmaps: [
      {
        id: 'nne-launch',
        name: 'Launch in 30 Days',
        duration_days: 30,
        cost_estimate: '₹0–₹4k',
        difficulty: 2,
        steps: [
          { order: 1, title: 'Pick a sharp niche', description: 'Underserved + has money (e.g. dental office managers).', deliverable: 'Niche + angle' },
          { order: 2, title: 'Set up free tooling', description: 'Use a free email platform and a simple landing page.', deliverable: 'Signup page' },
          { order: 3, title: 'Publish 4 weekly issues', description: 'Curate 5 useful links + one original insight each week.', deliverable: '4 issues live' },
          { order: 4, title: 'Get first 100 subs', description: 'Post in niche communities and DM 20 ideal readers.', deliverable: '100 subscribers' },
        ],
      },
      {
        id: 'nne-monetize',
        name: 'Monetize',
        duration_days: 60,
        cost_estimate: '₹0',
        difficulty: 3,
        steps: [
          { order: 1, title: 'Sell your first sponsor slot', description: 'Reach out to 10 relevant tools once you pass 500 subs.' },
          { order: 2, title: 'Add a paid tier', description: 'Bundle a deep-dive or database for ₹800/mo.' },
        ],
      },
    ],
  },
  {
    slug: 'digital-template-shop',
    title: 'Digital Template Shop',
    tagline: 'Sell templates that solve one painful task.',
    category: 'Digital Products',
    description:
      'Build a small catalog of high-quality templates (Notion, spreadsheets, design kits) for a specific audience. Make once, sell infinitely — the classic passive digital product.',
    passiveScore: 5,
    startupCost: '₹0–₹4k',
    monthlyPotential: '₹40k–₹5L',
    difficulty: 2,
    timeToFirst: '1–3 weeks',
    tags: ['notion', 'templates', 'design', 'passive'],
    roadmaps: [
      {
        id: 'dts-first',
        name: 'First Product',
        duration_days: 21,
        cost_estimate: '₹0',
        difficulty: 1,
        steps: [
          { order: 1, title: 'Find a repeat pain', description: 'A task your audience redoes constantly.', deliverable: 'Problem statement' },
          { order: 2, title: 'Build one polished template', description: 'Make it genuinely better than the free versions.', deliverable: 'v1 template' },
          { order: 3, title: 'List it on a marketplace', description: 'Gumroad or a template marketplace with strong screenshots.', deliverable: 'Live listing' },
        ],
      },
      {
        id: 'dts-catalog',
        name: 'Build a Catalog',
        duration_days: 60,
        cost_estimate: '₹0–₹4k',
        difficulty: 2,
        steps: [
          { order: 1, title: 'Ship 5 related templates', description: 'Cover a full workflow so buyers return.' },
          { order: 2, title: 'Bundle + upsell', description: 'Offer a discounted bundle to lift average order value.' },
        ],
      },
    ],
  },
  {
    slug: 'review-site-affiliate',
    title: 'Micro Review Site',
    tagline: 'Rank for buyer keywords, earn affiliate commissions.',
    category: 'Content',
    description:
      'Build a tiny content site targeting high-intent "best X for Y" searches in a narrow category. Earn recurring affiliate income as it ranks. Slow to start, very passive once established.',
    passiveScore: 5,
    startupCost: '₹4k–₹16k',
    monthlyPotential: '₹25k–₹4L',
    difficulty: 3,
    timeToFirst: '3–6 months',
    tags: ['seo', 'affiliate', 'content', 'evergreen'],
    roadmaps: [
      {
        id: 'rsa-build',
        name: 'Build & Rank',
        duration_days: 90,
        cost_estimate: '₹4k–₹12k',
        difficulty: 3,
        steps: [
          { order: 1, title: 'Find low-competition buyer keywords', description: 'Long-tail "best…for…" phrases with weak results.', deliverable: 'Keyword list' },
          { order: 2, title: 'Publish 15 focused articles', description: 'Genuinely helpful comparisons with affiliate links.', deliverable: '15 posts' },
          { order: 3, title: 'Earn backlinks', description: 'Guest posts and niche directories.', deliverable: 'First links' },
        ],
      },
    ],
  },
  {
    slug: 'automation-agency',
    title: 'No-Code Automation Agency',
    tagline: 'Wire up tools that save businesses hours weekly.',
    category: 'Automation',
    description:
      'Small businesses waste hours on manual data entry. Sell done-for-you automations connecting their apps. High margin, retainer potential, no code required.',
    passiveScore: 2,
    startupCost: '₹0–₹8k',
    monthlyPotential: '₹2.5L–₹12L',
    difficulty: 3,
    timeToFirst: '2–5 weeks',
    tags: ['no-code', 'b2b', 'service', 'retainer'],
    roadmaps: [
      {
        id: 'aa-first',
        name: 'First 3 Clients',
        duration_days: 45,
        cost_estimate: '₹0–₹5k',
        difficulty: 3,
        steps: [
          { order: 1, title: 'Master one automation platform', description: 'Learn a no-code connector deeply.', deliverable: 'Skill baseline' },
          { order: 2, title: 'Build 2 demo automations', description: 'Show a clear before/after time saving.', deliverable: 'Demos' },
          { order: 3, title: 'Pitch 20 local businesses', description: 'Lead with hours saved per week.', deliverable: '3 signed clients' },
        ],
      },
    ],
  },
  {
    slug: 'rent-your-gear',
    title: 'Peer-to-Peer Gear Rental',
    tagline: 'Rent out expensive tools you already own.',
    category: 'Real Estate',
    description:
      'Cameras, drones, power tools, party equipment — expensive items people need occasionally. List what you own on rental marketplaces and reinvest into more inventory.',
    passiveScore: 4,
    startupCost: '₹0 (use what you own)',
    monthlyPotential: '₹25k–₹2.5L',
    difficulty: 1,
    timeToFirst: '1–2 weeks',
    tags: ['rental', 'assets', 'marketplace', 'local'],
    roadmaps: [
      {
        id: 'rg-start',
        name: 'Start Renting',
        duration_days: 21,
        cost_estimate: '₹0',
        difficulty: 1,
        steps: [
          { order: 1, title: 'List 3 items you own', description: 'High-value, occasional-use gear.', deliverable: 'Live listings' },
          { order: 2, title: 'Set clear terms + deposit', description: 'Protect against damage with a deposit and simple contract.', deliverable: 'Rental terms' },
          { order: 3, title: 'Reinvest profits', description: 'Buy the most-requested item you do not yet own.' },
        ],
      },
    ],
  },
  {
    slug: 'dividend-content-portfolio',
    title: 'Faceless Content Portfolio',
    tagline: 'Build faceless channels that pay ad revenue.',
    category: 'Content',
    description:
      'Create faceless short-form channels around evergreen niches using stock footage and voiceover. A portfolio of small channels compounds into meaningful ad + sponsorship income.',
    passiveScore: 4,
    startupCost: '₹0–₹12k',
    monthlyPotential: '₹15k–₹3L',
    difficulty: 2,
    timeToFirst: '4–10 weeks',
    tags: ['short-form', 'faceless', 'ads', 'evergreen'],
    roadmaps: [
      {
        id: 'dcp-launch',
        name: 'Launch a Channel',
        duration_days: 45,
        cost_estimate: '₹0–₹8k',
        difficulty: 2,
        steps: [
          { order: 1, title: 'Pick an evergreen niche', description: 'Facts, tips, or how-tos with broad appeal.', deliverable: 'Niche + format' },
          { order: 2, title: 'Batch 20 short videos', description: 'Templated script + stock footage + voiceover.', deliverable: '20 videos' },
          { order: 3, title: 'Post daily for 30 days', description: 'Consistency signals the algorithm.', deliverable: 'Posting streak' },
        ],
      },
    ],
  },
  {
    slug: 'local-lead-gen',
    title: 'Local Lead-Gen Sites',
    tagline: 'Own a lead funnel, rent it to local pros.',
    category: 'Finance',
    description:
      'Build a simple site that ranks for a local service ("emergency plumber [city]"), capture leads, and sell them to a local business on a monthly retainer. A durable local asset.',
    passiveScore: 5,
    startupCost: '₹4k–₹16k',
    monthlyPotential: '₹40k–₹3L per site',
    difficulty: 3,
    timeToFirst: '2–4 months',
    tags: ['seo', 'local', 'leads', 'retainer'],
    roadmaps: [
      {
        id: 'llg-build',
        name: 'Build One Asset',
        duration_days: 90,
        cost_estimate: '₹4k–₹12k',
        difficulty: 3,
        steps: [
          { order: 1, title: 'Pick a service + city', description: 'High-value job, low online competition.', deliverable: 'Target chosen' },
          { order: 2, title: 'Build a focused local page', description: 'Clear call, phone tracking, local SEO basics.', deliverable: 'Ranking page' },
          { order: 3, title: 'Sell the leads', description: 'Offer a local pro a free trial, then a monthly rate.', deliverable: 'First retainer' },
        ],
      },
    ],
  },
]

export function getIdea(slug: string): Idea | undefined {
  return IDEAS.find((i) => i.slug === slug)
}

export function searchIdeas(query: string): Idea[] {
  const q = query.trim().toLowerCase()
  if (!q) return IDEAS
  return IDEAS.filter((i) =>
    [i.title, i.tagline, i.description, i.category, ...i.tags]
      .join(' ').toLowerCase().includes(q)
  )
}
