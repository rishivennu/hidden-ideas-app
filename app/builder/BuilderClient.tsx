'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wand2, FileClock, Trash2, ArrowRight, Sparkles } from 'lucide-react'
import { IDEAS } from '@/lib/demoData'
import BuilderForm from '@/components/BuilderForm'
import BuilderCanvas from '@/components/BuilderCanvas'
import RoadmapCookingLoader from '@/components/RoadmapCookingLoader'
import {
  buildRoadmap, loadAll, deleteRoadmap, progress,
  type BuilderInput, type BuiltRoadmap,
} from '@/lib/roadmapBuilder'

// Parse "₹15k–₹40k" style strings into a rough rupee number (first value).
function parseINR(s?: string): number {
  if (!s) return 50000
  const m = s.replace(/,/g, '').match(/([\d.]+)\s*(cr|l|lakh|k)?/i)
  if (!m) return 50000
  let n = parseFloat(m[1])
  const u = (m[2] || '').toLowerCase()
  if (u === 'k') n *= 1e3
  else if (u === 'l' || u === 'lakh') n *= 1e5
  else if (u === 'cr') n *= 1e7
  return Math.round(n) || 50000
}
function parseWeeks(s?: string): number {
  if (!s) return 12
  const m = s.match(/([\d]+)/)
  const n = m ? parseInt(m[1], 10) : 0
  if (/month/i.test(s)) return Math.max(1, n * 4)
  if (/day/i.test(s)) return Math.max(1, Math.round(n / 7))
  return n || 12
}

export default function BuilderClient() {
  const [initial, setInitial] = useState<Partial<BuilderInput> | undefined>()
  const [cookingFor, setCookingFor] = useState<BuilderInput | null>(null)
  const [rm, setRm] = useState<BuiltRoadmap | null>(null)
  const [saved, setSaved] = useState<BuiltRoadmap[]>([])

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('idea')
    if (slug) {
      const idea = IDEAS.find((i) => i.slug === slug)
      if (idea) setInitial({
        title: idea.title, goal: idea.tagline, category: idea.category,
        budget: parseINR(idea.startupCost), weeks: parseWeeks(idea.timeToFirst), experience: 'beginner',
      })
    }
    setSaved(loadAll())
  }, [])

  function build(input: BuilderInput) { setCookingFor(input) }
  function finishCooking() {
    if (!cookingFor) return
    setRm(buildRoadmap(cookingFor))
    setCookingFor(null)
  }
  function restart() { setRm(null); setSaved(loadAll()); setInitial(undefined) }
  function remove(id: string) { deleteRoadmap(id); setSaved(loadAll()) }

  if (rm) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <BuilderCanvas initial={rm} onRestart={restart} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <RoadmapCookingLoader open={!!cookingFor} title={cookingFor?.title ?? ''} onComplete={finishCooking} />

      <header className="text-center mb-8">
        <span className="chip bg-yellow mb-4"><Wand2 className="w-4 h-4" /> Roadmap Builder</span>
        <h1 className="text-hero text-ink">Build your plan,<br />start to finish</h1>
        <p className="text-lg text-ink/70 font-medium max-w-xl mx-auto mt-4">
          Answer a few questions and get a detailed, phased roadmap — validate, set up, build, launch and grow. Edit anything, track progress, export a PDF.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        <BuilderForm initial={initial} onBuild={build} />

        <aside className="space-y-4">
          <div className="biz-card p-5 bg-white">
            <h2 className="flex items-center gap-2 font-display font-semibold text-lg mb-1"><FileClock className="w-5 h-5" /> Your roadmaps</h2>
            {saved.length === 0 ? (
              <p className="text-sm text-muted">Nothing saved yet. Build one and it&apos;ll auto-save here on this device.</p>
            ) : (
              <ul className="space-y-2 mt-2">
                {saved.map((r) => {
                  const p = progress(r)
                  return (
                    <li key={r.id} className="rounded-2xl border-2 border-ink shadow-hard-sm bg-paper p-3">
                      <button onClick={() => setRm(r)} className="w-full text-left">
                        <span className="font-bold text-sm block leading-tight">{r.title}</span>
                        <span className="text-xs text-muted">{p.done}/{p.total} done · {p.pct}%</span>
                        <span className="mt-1.5 flex items-center gap-1 text-xs font-bold text-accent">Open <ArrowRight className="w-3 h-3" /></span>
                      </button>
                      <button onClick={() => remove(r.id)} aria-label="Delete roadmap" className="mt-1 inline-flex items-center gap-1 text-xs text-muted hover:text-biz-pink transition-colors"><Trash2 className="w-3 h-3" /> Delete</button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="biz-card p-5 bg-biz-purple text-white">
            <Sparkles className="w-6 h-6 mb-2" />
            <p className="font-semibold text-sm mb-3">Not sure what to build? Start from a library idea.</p>
            <Link href="/library" className="btn-yellow px-4 py-2 text-sm">Browse ideas</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
