'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Compass, ExternalLink, BookOpen, Lightbulb, ArrowUpRight } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Idea } from '@/lib/demoData'
import { fadeUpItem, staggerContainer } from '@/lib/motion'

interface WebResult { title: string; url: string; snippet: string }
interface Summary { title: string; extract: string; url: string; thumbnail: string | null }
interface Results { query: string; ideas: Idea[]; summary: Summary | null; web: WebResult[] }

const SUGGESTIONS = ['dropshipping', 'vending machines', 'print on demand', 'airbnb arbitrage', 'affiliate marketing']

export default function ExplorePage() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(query: string) {
    if (!query.trim()) return
    setLoading(true); setError(null); setResults(null)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setResults(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent text-sm font-medium px-4 py-1.5 mb-4">
              <Compass className="w-4 h-4" aria-hidden="true" /> Smart research bot
            </div>
            <h1 className="text-title mb-3">Research any business topic</h1>
            <p className="text-muted max-w-xl mx-auto">Type a topic. The bot pulls matching ideas from our library, a quick overview, and related links from around the web — organized for you.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); run(q) }} className="relative max-w-2xl mx-auto mb-4">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. vending machines, digital products, local SEO…"
              aria-label="Research a topic"
              className="w-full pl-13 pr-32 py-4 rounded-full border border-black/10 bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
              style={{ paddingLeft: '3.25rem' }}
            />
            <button type="submit" disabled={loading || !q.trim()} className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setQ(s); run(s) }} className="text-xs bg-bg-200 hover:bg-bg-300 rounded-full px-3 py-1.5 text-black/70 transition-colors">{s}</button>
            ))}
          </div>

          {error && <p role="alert" className="text-center text-red-500">{error}</p>}
          {loading && <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" /></div>}

          <AnimatePresence>
            {results && (
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-10">
                {/* Matching ideas */}
                {results.ideas.length > 0 && (
                  <motion.section variants={fadeUpItem}>
                    <h2 className="flex items-center gap-2 font-semibold mb-4"><Lightbulb className="w-5 h-5 text-accent" /> Ideas in our library</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {results.ideas.map((idea) => (
                        <Link key={idea.slug} href={`/ideas/${idea.slug}`} className="glass-card p-4 flex items-start justify-between gap-3 group hover:-translate-y-0.5 transition-transform">
                          <div>
                            <p className="font-medium group-hover:text-accent transition-colors">{idea.title}</p>
                            <p className="text-sm text-muted mt-0.5">{idea.tagline}</p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-accent shrink-0 mt-1" aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Overview */}
                {results.summary && (
                  <motion.section variants={fadeUpItem}>
                    <h2 className="flex items-center gap-2 font-semibold mb-4"><BookOpen className="w-5 h-5 text-accent" /> Overview</h2>
                    <div className="glass-card p-6 flex gap-5">
                      {results.summary.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={results.summary.thumbnail} alt="" className="w-20 h-20 rounded-14 object-cover shrink-0 hidden sm:block" />
                      )}
                      <div>
                        <h3 className="font-semibold mb-1">{results.summary.title}</h3>
                        <p className="text-sm text-muted leading-relaxed">{results.summary.extract}</p>
                        {results.summary.url && (
                          <a href={results.summary.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-accent mt-3">
                            Read more <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.section>
                )}

                {/* Web results */}
                {results.web.length > 0 && (
                  <motion.section variants={fadeUpItem}>
                    <h2 className="flex items-center gap-2 font-semibold mb-4"><Compass className="w-5 h-5 text-accent" /> From around the web</h2>
                    <div className="space-y-2">
                      {results.web.map((w, i) => (
                        <a key={i} href={w.url} target="_blank" rel="noopener noreferrer" className="glass-card p-4 flex items-start justify-between gap-3 group hover:-translate-y-0.5 transition-transform">
                          <div>
                            <p className="font-medium text-sm group-hover:text-accent transition-colors">{w.title}</p>
                            <p className="text-xs text-muted mt-0.5 line-clamp-2">{w.snippet}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted shrink-0 mt-0.5" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </motion.section>
                )}

                {results.ideas.length === 0 && !results.summary && results.web.length === 0 && (
                  <p className="text-center text-muted py-10">No results for "{results.query}". Try a broader topic.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  )
}
