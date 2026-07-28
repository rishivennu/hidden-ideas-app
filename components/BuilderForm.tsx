'use client'

import { useState } from 'react'
import { Wand2, IndianRupee, CalendarDays, Clock3, Sparkles } from 'lucide-react'
import { CATEGORIES } from '@/lib/demoData'
import type { BuilderInput, Experience } from '@/lib/roadmapBuilder'

const CATS = CATEGORIES.filter((c) => c !== 'All')
const LEVELS: { value: Experience; label: string; hint: string }[] = [
  { value: 'beginner', label: 'Beginner', hint: 'New to this — add the basics' },
  { value: 'intermediate', label: 'Intermediate', hint: 'Done something like it' },
  { value: 'pro', label: 'Pro', hint: 'Been here — keep it lean' },
]

export default function BuilderForm({
  initial,
  onBuild,
}: {
  initial?: Partial<BuilderInput>
  onBuild: (input: BuilderInput) => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [goal, setGoal] = useState(initial?.goal ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATS[0])
  const [budget, setBudget] = useState(initial?.budget ?? 50000)
  const [weeks, setWeeks] = useState(initial?.weeks ?? 12)
  const [hoursPerWeek, setHours] = useState(initial?.hoursPerWeek ?? 10)
  const [experience, setExperience] = useState<Experience>(initial?.experience ?? 'beginner')
  const [err, setErr] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setErr('Give your idea a name.'); return }
    onBuild({ title, goal, category, budget: Math.max(0, budget), weeks: Math.max(1, weeks), hoursPerWeek: Math.max(1, hoursPerWeek), experience })
  }

  return (
    <form onSubmit={submit} className="biz-card p-6 sm:p-8 bg-white">
      <div className="flex items-center gap-2 mb-6">
        <span className="grid place-items-center w-10 h-10 rounded-full bg-yellow border-2 border-ink shadow-hard-sm"><Wand2 className="w-5 h-5" aria-hidden="true" /></span>
        <div>
          <h2 className="font-display font-semibold text-xl leading-tight">Describe your idea</h2>
          <p className="text-sm text-muted">We&apos;ll turn it into a detailed step-by-step plan.</p>
        </div>
      </div>

      <label className="block mb-4">
        <span className="text-sm font-semibold">What are you building? *</span>
        <input value={title} onChange={(e) => { setTitle(e.target.value); setErr('') }} placeholder="e.g. Home bakery for custom cakes"
          className="mt-1.5 w-full px-4 py-3 rounded-2xl border-2 border-ink bg-paper font-medium shadow-hard-sm focus:outline-none focus:-translate-y-0.5 transition-all" />
      </label>

      <label className="block mb-4">
        <span className="text-sm font-semibold">Your goal <span className="text-muted font-normal">(optional)</span></span>
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. ₹50k/month in 3 months, working weekends"
          className="mt-1.5 w-full px-4 py-3 rounded-2xl border-2 border-ink bg-paper font-medium shadow-hard-sm focus:outline-none focus:-translate-y-0.5 transition-all" />
      </label>

      <label className="block mb-5">
        <span className="text-sm font-semibold">Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="mt-1.5 w-full px-4 py-3 rounded-2xl border-2 border-ink bg-paper font-medium shadow-hard-sm focus:outline-none">
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <Num icon={<IndianRupee className="w-4 h-4" />} label="Total budget (₹)" value={budget} step={5000} min={0} onChange={setBudget} />
        <Num icon={<CalendarDays className="w-4 h-4" />} label="Timeframe (weeks)" value={weeks} step={1} min={1} onChange={setWeeks} />
        <Num icon={<Clock3 className="w-4 h-4" />} label="Hours / week" value={hoursPerWeek} step={1} min={1} onChange={setHours} />
      </div>

      <span className="text-sm font-semibold">Your experience</span>
      <div className="grid grid-cols-3 gap-2 mt-1.5 mb-6">
        {LEVELS.map((l) => (
          <button type="button" key={l.value} onClick={() => setExperience(l.value)} aria-pressed={experience === l.value}
            className={`rounded-2xl border-2 border-ink px-3 py-3 text-left transition-all ${experience === l.value ? 'bg-yellow shadow-hard -translate-y-0.5' : 'bg-paper shadow-hard-sm hover:-translate-y-0.5'}`}>
            <span className="block font-bold text-sm">{l.label}</span>
            <span className="block text-[11px] text-muted leading-tight mt-0.5">{l.hint}</span>
          </button>
        ))}
      </div>

      {err && <p role="alert" className="text-sm text-biz-pink font-semibold mb-3">{err}</p>}
      <button type="submit" className="btn-primary w-full py-4 text-lg"><Sparkles className="w-5 h-5" /> Build my roadmap</button>
    </form>
  )
}

function Num({ icon, label, value, step, min, onChange }: { icon: React.ReactNode; label: string; value: number; step: number; min: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-semibold">{icon}{label}</span>
      <input type="number" value={value} step={step} min={min}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        className="mt-1.5 w-full px-4 py-3 rounded-2xl border-2 border-ink bg-paper font-medium shadow-hard-sm focus:outline-none focus:-translate-y-0.5 transition-all" />
    </label>
  )
}
