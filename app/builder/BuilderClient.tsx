'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileClock, Trash2, ArrowRight, Sparkles, Compass, AlertTriangle } from 'lucide-react'
import RoadmapForm from '@/components/RoadmapForm'
import RoadmapView from '@/components/RoadmapView'
import ResearchLoader from '@/components/ResearchLoader'
import {
  generateRoadmap, loadAll, saveRoadmap, deleteRoadmap,
  type RoadmapInput, type AIRoadmap,
} from '@/lib/roadmapAI'

export default function BuilderClient() {
  const [initial, setInitial] = useState<Partial<RoadmapInput> | undefined>()
  const [busy, setBusy] = useState(false)
  const [busyTitle, setBusyTitle] = useState('')
  const [rm, setRm] = useState<AIRoadmap | null>(null)
  const [saved, setSaved] = useState<AIRoadmap[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const topic = p.get('topic') || p.get('idea') || ''
    const niche = p.get('niche') || ''
    if (topic) setInitial({ topic, niche: niche || undefined })
    setSaved(loadAll())
  }, [])

  async function generate(input: RoadmapInput) {
    setError('')
    setBusy(true)
    setBusyTitle(input.topic)
    try {
      const roadmap = await generateRoadmap(input)
      saveRoadmap(roadmap)
      setRm(roadmap)
      setSaved(loadAll())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function restart() { setRm(null); setSaved(loadAll()); setInitial(undefined); setError('') }
  function remove(id: string) { deleteRoadmap(id); setSaved(loadAll()) }

  if (rm) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <RoadmapView roadmap={rm} onRestart={restart} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <ResearchLoader open={busy} title={busyTitle} />

      <header className="text-center mb-8">
        <span className="chip bg-yellow mb-4"><Compass className="w-4 h-4" /> Roadmap Builder</span>
        <h1 className="text-hero text-ink">Any idea, one<br />fact-checked roadmap</h1>
        <p className="text-lg text-ink/70 font-medium max-w-xl mx-auto mt-4">
          Search a business, pick your niche, and Gemini builds a complete India-ready plan — registration, licenses, fees in ₹, suppliers, market, timeline and pitfalls.
        </p>
      </header>

      {error && (
        <div role="alert" className="biz-card bg-white border-biz-pink p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-biz-pink shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold text-ink">Couldn&apos;t build that roadmap</p>
            <p className="text-sm text-muted">{error}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        <RoadmapForm initial={initial} onGenerate={generate} busy={busy} />

        <aside className="space-y-4">
          <div className="biz-card p-5 bg-white">
            <h2 className="flex items-center gap-2 font-display font-semibold text-lg mb-1"><FileClock className="w-5 h-5" /> Your roadmaps</h2>
            {saved.length === 0 ? (
              <p className="text-sm text-muted">Nothing saved yet. Build one and it&apos;ll auto-save here on this device.</p>
            ) : (
              <ul className="space-y-2 mt-2">
                {saved.map((r) => (
                  <li key={r.id} className="rounded-2xl border-2 border-ink shadow-hard-sm bg-paper p-3">
                    <button onClick={() => { setRm(r); window.scrollTo({ top: 0 }) }} className="w-full text-left">
                      <span className="font-bold text-sm block leading-tight">{r.title}</span>
                      <span className="text-xs text-muted">{r.difficulty} · {r.totalTimeline}</span>
                      <span className="mt-1.5 flex items-center gap-1 text-xs font-bold text-accent">Open <ArrowRight className="w-3 h-3" /></span>
                    </button>
                    <button onClick={() => remove(r.id)} aria-label="Delete roadmap" className="mt-1 inline-flex items-center gap-1 text-xs text-muted hover:text-biz-pink transition-colors"><Trash2 className="w-3 h-3" /> Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="biz-card p-5 bg-biz-purple text-white">
            <Sparkles className="w-6 h-6 mb-2" />
            <p className="font-semibold text-sm mb-3">Not sure what to build? Explore curated ideas for inspiration.</p>
            <Link href="/library" className="btn-yellow px-4 py-2 text-sm">Browse ideas</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
