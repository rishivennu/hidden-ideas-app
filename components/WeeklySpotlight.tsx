'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, TrendingUp, IndianRupee, Clock, ArrowUpRight, Check, Loader2 } from 'lucide-react'
import type { Idea } from '@/lib/demoData'
import SaveButton from './SaveButton'

// "Idea of the week" — the featured idea is picked deterministically on the
// server (by ISO week) so it rotates weekly. Includes an email capture that
// feeds the same submissions table your Submit page + analytics use.
export default function WeeklySpotlight({ idea, art }: { idea: Idea; art: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setState('error'); setMsg('Enter a valid email.'); return }
    setState('loading')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Weekly idea digest signup', description: `Subscribed via Idea of the Week: ${idea.title}`, email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
      setState('done')
    } catch (err) {
      setState('error'); setMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="biz-card overflow-hidden grid lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left — the idea */}
        <div className="relative bg-yellow p-8 sm:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-ink">
          <div className="flex items-center justify-between mb-5">
            <span className="chip bg-ink text-white"><Sparkles className="w-4 h-4" /> Idea of the week</span>
            <SaveButton slug={idea.slug} />
          </div>
          <img src={art} alt="" aria-hidden="true" className="absolute right-2 top-2 w-24 sm:w-28 opacity-90 drop-shadow-[3px_3px_0_rgba(20,20,20,0.2)] hidden sm:block" />
          <h2 className="text-title mb-2 pr-24">{idea.title}</h2>
          <p className="text-ink/80 font-medium mb-6 max-w-md">{idea.tagline}</p>
          <div className="flex flex-wrap gap-2 mb-7">
            <span className="chip bg-white text-xs"><TrendingUp className="w-3.5 h-3.5" /> {idea.monthlyPotential}/mo</span>
            <span className="chip bg-white text-xs"><IndianRupee className="w-3.5 h-3.5" /> {idea.startupCost}</span>
            <span className="chip bg-white text-xs"><Clock className="w-3.5 h-3.5" /> {idea.timeToFirst}</span>
          </div>
          <Link href={`/ideas/${idea.slug}`} className="btn-primary px-6 py-3">
            See the roadmap <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right — email capture */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
          <h3 className="font-display font-semibold text-2xl mb-2">Get a fresh idea every week</h3>
          <p className="text-muted mb-6">One hand-picked idea + its roadmap in your inbox. Free, no spam, unsubscribe anytime.</p>

          {state === 'done' ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-biz-green/15 px-5 py-4 font-semibold">
              <span className="grid place-items-center w-7 h-7 rounded-full bg-biz-green text-white"><Check className="w-4 h-4" strokeWidth={3} /></span>
              You&apos;re in! Watch your inbox each week.
            </div>
          ) : (
            <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
                placeholder="you@email.com"
                aria-label="Email address"
                className="flex-1 px-5 py-3.5 rounded-full border-2 border-ink bg-paper text-[15px] font-medium shadow-hard-sm focus:outline-none focus:-translate-y-0.5 transition-all"
              />
              <button type="submit" disabled={state === 'loading'} className="btn-yellow px-6 py-3.5 justify-center">
                {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
              </button>
            </form>
          )}
          {state === 'error' && <p role="alert" className="text-sm text-biz-pink font-semibold mt-3">{msg}</p>}
        </div>
      </div>
    </div>
  )
}
