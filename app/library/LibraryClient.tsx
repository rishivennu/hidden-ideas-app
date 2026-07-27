'use client'

import { useState, useMemo } from 'react'
import { Search, Heart, ArrowDownWideNarrow } from 'lucide-react'
import IdeaCard from '@/components/IdeaCard'
import { CATEGORIES, type Idea } from '@/lib/demoData'
import { useSaved } from '@/lib/useSaved'

// Parse the leading number out of a ₹ range like "₹15k–₹40k" / "₹1.5L–₹6L".
function toNumber(v: string): number {
  const m = v.replace(/,/g, '').match(/([\d.]+)\s*([kKlLcr]*)/)
  if (!m) return 0
  let n = parseFloat(m[1])
  const u = m[2].toLowerCase()
  if (u.startsWith('k')) n *= 1_000
  else if (u.startsWith('l')) n *= 100_000
  else if (u.startsWith('cr')) n *= 10_000_000
  return n
}

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'cost-low', label: 'Lowest cost' },
  { id: 'potential-high', label: 'Highest potential' },
  { id: 'passive-high', label: 'Most passive' },
] as const
type SortId = (typeof SORTS)[number]['id']

export default function LibraryClient({ ideas }: { ideas: Idea[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [sort, setSort] = useState<SortId>('featured')
  const [onlySaved, setOnlySaved] = useState(false)
  const { saved, isSaved, ready, count } = useSaved()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = ideas.filter((i) => {
      const matchesCat = category === 'All' || i.category === category
      const matchesQ = !q || [i.title, i.tagline, i.description, ...i.tags].join(' ').toLowerCase().includes(q)
      const matchesSaved = !onlySaved || isSaved(i.slug)
      return matchesCat && matchesQ && matchesSaved
    })
    list = [...list]
    if (sort === 'cost-low') list.sort((a, b) => toNumber(a.startupCost) - toNumber(b.startupCost))
    else if (sort === 'potential-high') list.sort((a, b) => toNumber(b.monthlyPotential) - toNumber(a.monthlyPotential))
    else if (sort === 'passive-high') list.sort((a, b) => b.passiveScore - a.passiveScore)
    return list
  }, [ideas, query, category, sort, onlySaved, isSaved, saved])

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ideas, tags, keywords…"
              aria-label="Search ideas"
              className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-ink bg-white text-sm shadow-hard-sm focus:outline-none focus:-translate-y-0.5 focus:shadow-hard transition-all"
            />
          </div>

          {/* Sort */}
          <label className="relative inline-flex items-center">
            <ArrowDownWideNarrow className="absolute left-3 w-4 h-4 text-ink pointer-events-none" aria-hidden="true" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              aria-label="Sort ideas"
              className="appearance-none pl-9 pr-8 py-3 rounded-full border-2 border-ink bg-white text-sm font-semibold shadow-hard-sm cursor-pointer focus:outline-none"
            >
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>

          {/* Saved toggle */}
          <button
            onClick={() => setOnlySaved((v) => !v)}
            aria-pressed={onlySaved}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-full border-2 border-ink text-sm font-bold shadow-hard-sm transition-all hover:-translate-y-0.5 ${onlySaved ? 'bg-biz-pink text-white' : 'bg-white text-ink'}`}
          >
            <Heart className={`w-4 h-4 ${onlySaved ? 'fill-white' : 'fill-biz-pink text-biz-pink'}`} aria-hidden="true" />
            Saved{ready && count > 0 ? ` (${count})` : ''}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 border-ink transition-all ${
                category === cat ? 'bg-ink text-white' : 'bg-white text-ink hover:-translate-y-0.5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((idea, i) => <IdeaCard key={idea.slug} idea={idea} index={i} />)}
        </div>
      ) : onlySaved && ready && count === 0 ? (
        <div className="text-center py-24 rounded-28 border-2 border-dashed border-ink/25 bg-paper">
          <Heart className="w-8 h-8 mx-auto mb-3 text-biz-pink fill-biz-pink" aria-hidden="true" />
          <p className="font-display font-semibold text-lg">No saved ideas yet</p>
          <p className="text-muted text-sm mt-1">Tap the ♥ on any idea to keep it here — it stays across visits.</p>
        </div>
      ) : (
        <div className="text-center py-24 rounded-28 border-2 border-ink bg-paper shadow-hard-sm">
          <p className="text-muted">No ideas match "{query}". Try a different search or category.</p>
        </div>
      )}
    </>
  )
}
