'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import IdeaCard from '@/components/IdeaCard'
import { CATEGORIES, type Idea } from '@/lib/demoData'

export default function LibraryClient({ ideas }: { ideas: Idea[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ideas.filter((i) => {
      const matchesCat = category === 'All' || i.category === category
      const matchesQ = !q || [i.title, i.tagline, i.description, ...i.tags].join(' ').toLowerCase().includes(q)
      return matchesCat && matchesQ
    })
  }, [ideas, query, category])

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ideas, tags, keywords…"
            aria-label="Search ideas"
            className="w-full pl-11 pr-4 py-3 rounded-full border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat ? 'bg-accent text-white' : 'bg-bg-200 text-black/70 hover:bg-bg-300'
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
      ) : (
        <div className="text-center py-24 rounded-20 bg-bg-200">
          <p className="text-muted">No ideas match "{query}". Try a different search or category.</p>
        </div>
      )}
    </>
  )
}
