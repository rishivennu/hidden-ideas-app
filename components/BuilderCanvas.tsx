'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check, Plus, Trash2, ChevronUp, ChevronDown, Download, Printer,
  RotateCcw, Save, CalendarDays, IndianRupee,
} from 'lucide-react'
import type { BuiltRoadmap, BuiltStep } from '@/lib/roadmapBuilder'
import { formatINR, totalCost, totalDays, progress, saveRoadmap } from '@/lib/roadmapBuilder'
import { downloadBuiltRoadmap } from '@/lib/downloadRoadmap'

export default function BuilderCanvas({ initial, onRestart }: { initial: BuiltRoadmap; onRestart: () => void }) {
  const [rm, setRm] = useState<BuiltRoadmap>(initial)
  const [downloading, setDownloading] = useState(false)
  const [savedTick, setSavedTick] = useState(false)
  const firstRun = useRef(true)

  // auto-save to localStorage on every change (debounced)
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; saveRoadmap(rm); return }
    const t = setTimeout(() => { saveRoadmap(rm); setSavedTick(true); setTimeout(() => setSavedTick(false), 1200) }, 500)
    return () => clearTimeout(t)
  }, [rm])

  const prog = progress(rm)

  function mutStep(phaseId: string, stepId: string, patch: Partial<BuiltStep>) {
    setRm((r) => ({ ...r, phases: r.phases.map((p) => p.id !== phaseId ? p : { ...p, steps: p.steps.map((s) => s.id === stepId ? { ...s, ...patch } : s) }) }))
  }
  function delStep(phaseId: string, stepId: string) {
    setRm((r) => ({ ...r, phases: r.phases.map((p) => p.id !== phaseId ? p : { ...p, steps: p.steps.filter((s) => s.id !== stepId) }) }))
  }
  function moveStep(phaseId: string, idx: number, dir: -1 | 1) {
    setRm((r) => ({ ...r, phases: r.phases.map((p) => {
      if (p.id !== phaseId) return p
      const steps = [...p.steps]; const j = idx + dir
      if (j < 0 || j >= steps.length) return p
      ;[steps[idx], steps[j]] = [steps[j], steps[idx]]
      return { ...p, steps }
    }) }))
  }
  function addStep(phaseId: string) {
    const ns: BuiltStep = { id: Math.random().toString(36).slice(2, 9), title: 'New step', description: '', deliverable: '', days: 2, cost: 0, done: false }
    setRm((r) => ({ ...r, phases: r.phases.map((p) => p.id !== phaseId ? p : { ...p, steps: [...p.steps, ns] }) }))
  }

  async function handleDownload() {
    setDownloading(true)
    try { await downloadBuiltRoadmap(rm) } finally { setDownloading(false) }
  }

  return (
    <div>
      {/* summary header */}
      <div className="biz-card p-6 sm:p-8 bg-yellow mb-8">
        <input value={rm.title} onChange={(e) => setRm({ ...rm, title: e.target.value })} aria-label="Roadmap title"
          className="w-full bg-transparent font-display font-bold text-2xl sm:text-3xl leading-tight focus:outline-none border-b-2 border-transparent focus:border-ink transition-colors" />
        <input value={rm.goal} onChange={(e) => setRm({ ...rm, goal: e.target.value })} placeholder="Add your goal…" aria-label="Goal"
          className="w-full bg-transparent font-medium text-ink/70 mt-1 focus:outline-none border-b-2 border-transparent focus:border-ink/40 transition-colors" />

        <div className="flex flex-wrap gap-2 mt-5">
          <span className="chip bg-white text-xs">{rm.category}</span>
          <span className="chip bg-white text-xs"><CalendarDays className="w-3.5 h-3.5" /> ~{totalDays(rm)} days</span>
          <span className="chip bg-white text-xs"><IndianRupee className="w-3.5 h-3.5" /> {formatINR(totalCost(rm))}</span>
        </div>

        {/* progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm font-bold mb-1.5">
            <span>{prog.done} of {prog.total} steps done</span><span>{prog.pct}%</span>
          </div>
          <div className="h-3 rounded-full border-2 border-ink bg-white overflow-hidden">
            <div className="h-full bg-biz-green transition-all duration-500" style={{ width: `${prog.pct}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <button onClick={handleDownload} disabled={downloading} className="btn-primary px-5 py-2.5">
            {downloading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Preparing…</> : <><Download className="w-4 h-4" /> Download PDF</>}
          </button>
          <button onClick={() => window.print()} className="btn-secondary px-5 py-2.5"><Printer className="w-4 h-4" /> Print</button>
          <span className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 border-ink font-bold text-sm transition-colors ${savedTick ? 'bg-biz-green text-white' : 'bg-white'}`}>
            {savedTick ? <><Check className="w-4 h-4" strokeWidth={3} /> Saved</> : <><Save className="w-4 h-4" /> Auto-saved</>}
          </span>
          <button onClick={onRestart} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 border-ink bg-white font-bold text-sm hover:-translate-y-0.5 transition-transform ml-auto"><RotateCcw className="w-4 h-4" /> Start over</button>
        </div>
      </div>

      {/* phases */}
      <div className="space-y-6">
        {rm.phases.map((phase, pi) => (
          <section key={phase.id} className="biz-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b-2 border-ink" style={{ backgroundColor: phase.color }}>
              <span className="grid place-items-center w-8 h-8 rounded-full bg-ink text-white font-display font-bold text-sm shrink-0">{pi + 1}</span>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-lg leading-tight truncate">{phase.name}</h3>
                <p className="text-xs text-ink/70 truncate">{phase.summary}</p>
              </div>
            </div>

            <ul className="divide-y-2 divide-dashed divide-ink/10">
              {phase.steps.map((s, si) => (
                <li key={s.id} className={`p-4 sm:p-5 flex gap-3 ${s.done ? 'bg-biz-green/5' : ''}`}>
                  <button onClick={() => mutStep(phase.id, s.id, { done: !s.done })} aria-pressed={s.done} aria-label={s.done ? 'Mark not done' : 'Mark done'}
                    className={`shrink-0 grid place-items-center w-7 h-7 rounded-full border-2 border-ink mt-0.5 transition-colors ${s.done ? 'bg-biz-green text-white' : 'bg-white'}`}>
                    {s.done && <Check className="w-4 h-4" strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <input value={s.title} onChange={(e) => mutStep(phase.id, s.id, { title: e.target.value })} aria-label="Step title"
                      className={`w-full bg-transparent font-bold text-[15px] focus:outline-none rounded px-1 -mx-1 focus:bg-yellow/40 ${s.done ? 'line-through text-ink/50' : ''}`} />
                    <textarea value={s.description} onChange={(e) => mutStep(phase.id, s.id, { description: e.target.value })} rows={2} placeholder="Describe this step…" aria-label="Step description"
                      className="w-full bg-transparent text-sm text-muted mt-1 resize-none focus:outline-none rounded px-1 -mx-1 focus:bg-yellow/40" />

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <label className="inline-flex items-center gap-1 text-xs font-semibold rounded-full border-2 border-ink/15 pl-2.5 pr-1 py-0.5 focus-within:border-ink">
                        <CalendarDays className="w-3 h-3" aria-hidden="true" />
                        <input type="number" min={0} value={s.days} onChange={(e) => mutStep(phase.id, s.id, { days: Math.max(0, Number(e.target.value) || 0) })} aria-label="Days"
                          className="w-10 bg-transparent text-center focus:outline-none" /> d
                      </label>
                      <label className="inline-flex items-center gap-1 text-xs font-semibold rounded-full border-2 border-ink/15 pl-2.5 pr-2 py-0.5 focus-within:border-ink">
                        <IndianRupee className="w-3 h-3" aria-hidden="true" />
                        <input type="number" min={0} step={500} value={s.cost} onChange={(e) => mutStep(phase.id, s.id, { cost: Math.max(0, Number(e.target.value) || 0) })} aria-label="Cost in rupees"
                          className="w-16 bg-transparent text-center focus:outline-none" />
                      </label>
                      <input value={s.deliverable} onChange={(e) => mutStep(phase.id, s.id, { deliverable: e.target.value })} placeholder="Deliverable" aria-label="Deliverable"
                        className="flex-1 min-w-[8rem] text-xs font-semibold text-biz-green bg-transparent rounded-full border-2 border-ink/15 px-3 py-1 focus:outline-none focus:border-ink" />
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-1">
                    <button onClick={() => moveStep(phase.id, si, -1)} disabled={si === 0} aria-label="Move up" className="grid place-items-center w-7 h-7 rounded-lg border-2 border-ink/15 hover:border-ink disabled:opacity-30 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={() => moveStep(phase.id, si, 1)} disabled={si === phase.steps.length - 1} aria-label="Move down" className="grid place-items-center w-7 h-7 rounded-lg border-2 border-ink/15 hover:border-ink disabled:opacity-30 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                    <button onClick={() => delStep(phase.id, s.id)} aria-label="Delete step" className="grid place-items-center w-7 h-7 rounded-lg border-2 border-ink/15 hover:border-biz-pink hover:text-biz-pink transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="p-3 border-t-2 border-dashed border-ink/15">
              <button onClick={() => addStep(phase.id)} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/70 hover:text-ink rounded-full px-3 py-1.5 hover:bg-yellow/50 transition-colors"><Plus className="w-4 h-4" /> Add a step</button>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
