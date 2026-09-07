'use client'

import { useState } from 'react'
import { Sparkles, Target, IndianRupee, CalendarDays, Compass } from 'lucide-react'
import type { RoadmapInput } from '@/lib/roadmapAI'

const EXAMPLES = ['Vending machine business', 'Cloud kitchen', 'Organic soap brand', 'EV charging station', 'Print-on-demand store', 'Pet grooming service']
const LEVELS = [
  { value: 'Beginner', hint: 'First business' },
  { value: 'Intermediate', hint: 'Done this before' },
  { value: 'Pro', hint: 'Serial founder' },
]

export default function RoadmapForm({
  initial,
  onGenerate,
  busy,
}: {
  initial?: Partial<RoadmapInput>
  onGenerate: (input: RoadmapInput) => void
  busy?: boolean
}) {
  const [topic, setTopic] = useState(initial?.topic ?? '')
  const [niche, setNiche] = useState(initial?.niche ?? '')
  const [budget, setBudget] = useState(initial?.budget ?? '')
  const [timeframe, setTimeframe] = useState(initial?.timeframe ?? '')
  const [experience, setExperience] = useState(initial?.experience ?? 'Beginner')
  const [err, setErr] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) { setErr('Tell me what business you want to start.'); return }
    onGenerate({ topic: topic.trim(), niche: niche.trim() || undefined, budget: budget.trim() || undefined, timeframe: timeframe.trim() || undefined, experience })
  }

  return (
    <form onSubmit={submit} className="biz-card p-6 sm:p-8 bg-white">
      <div className="flex items-center gap-2 mb-5">
        <span className="grid place-items-center w-10 h-10 rounded-full bg-yellow border-2 border-ink shadow-hard-sm"><Compass className="w-5 h-5" aria-hidden="true" /></span>
        <div>
          <h2 className="font-display font-semibold text-xl leading-tight">What do you want to start?</h2>
          <p className="text-sm text-muted">Gemini researches it and builds a full India-ready roadmap.</p>
        </div>
      </div>

      <label className="block mb-2">
        <span className="text-sm font-semibold">Business idea or topic *</span>
        <input value={topic} onChange={(e) => { setTopic(e.target.value); setErr('') }} placeholder="e.g. Vending machine business"
          className="mt-1.5 w-full px-4 py-3 rounded-2xl border-2 border-ink bg-paper font-medium shadow-hard-sm focus:outline-none focus:-translate-y-0.5 transition-all" />
      </label>
      <div className="flex flex-wrap gap-2 mb-4">
        {EXAMPLES.map((ex) => (
          <button type="button" key={ex} onClick={() => { setTopic(ex); setErr('') }}
            className="text-xs font-semibold rounded-full border-2 border-ink bg-paper px-3 py-1.5 shadow-hard-sm hover:bg-yellow hover:-translate-y-0.5 transition-all">{ex}</button>
        ))}
      </div>

      <label className="block mb-4">
        <span className="text-sm font-semibold">Niche / focus <span className="text-muted font-normal">(optional)</span></span>
        <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. snacks & drinks in offices and colleges"
          className="mt-1.5 w-full px-4 py-3 rounded-2xl border-2 border-ink bg-paper font-medium shadow-hard-sm focus:outline-none focus:-translate-y-0.5 transition-all" />
      </label>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <label className="block">
          <span className="flex items-center gap-1.5 text-sm font-semibold"><IndianRupee className="w-4 h-4" />Budget <span className="text-muted font-normal">(optional)</span></span>
          <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. ₹3,00,000"
            className="mt-1.5 w-full px-4 py-3 rounded-2xl border-2 border-ink bg-paper font-medium shadow-hard-sm focus:outline-none focus:-translate-y-0.5 transition-all" />
        </label>
        <label className="block">
          <span className="flex items-center gap-1.5 text-sm font-semibold"><CalendarDays className="w-4 h-4" />Timeframe <span className="text-muted font-normal">(optional)</span></span>
          <input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="e.g. 3 months"
            className="mt-1.5 w-full px-4 py-3 rounded-2xl border-2 border-ink bg-paper font-medium shadow-hard-sm focus:outline-none focus:-translate-y-0.5 transition-all" />
        </label>
      </div>

      <span className="flex items-center gap-1.5 text-sm font-semibold"><Target className="w-4 h-4" />Your experience</span>
      <div className="grid grid-cols-3 gap-2 mt-1.5 mb-6">
        {LEVELS.map((l) => (
          <button type="button" key={l.value} onClick={() => setExperience(l.value)} aria-pressed={experience === l.value}
            className={`rounded-2xl border-2 border-ink px-3 py-3 text-left transition-all ${experience === l.value ? 'bg-yellow shadow-hard -translate-y-0.5' : 'bg-paper shadow-hard-sm hover:-translate-y-0.5'}`}>
            <span className="block font-bold text-sm">{l.value}</span>
            <span className="block text-[11px] text-muted leading-tight mt-0.5">{l.hint}</span>
          </button>
        ))}
      </div>

      {err && <p role="alert" className="text-sm text-biz-pink font-semibold mb-3">{err}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full py-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed">
        <Sparkles className="w-5 h-5" /> {busy ? 'Researching…' : 'Build my roadmap'}
      </button>
      <p className="text-xs text-muted text-center mt-3">Powered by Gemini · fact-checked, India-specific · ~10 seconds</p>
    </form>
  )
}
