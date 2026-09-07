'use client'

import { useState } from 'react'
import {
  ScrollText, BadgeCheck, IndianRupee, Store, TrendingUp, CalendarClock,
  ShieldAlert, ExternalLink, Download, RotateCcw, Check, Sparkles, ArrowRight,
} from 'lucide-react'
import type { AIRoadmap } from '@/lib/roadmapAI'
import { indiamartUrl } from '@/lib/roadmapAI'
import { downloadAIRoadmap } from '@/lib/downloadRoadmap'

function Section({ icon: Icon, title, color, n, children }: { icon: React.ElementType; title: string; color: string; n: number; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="grid place-items-center w-11 h-11 rounded-full border-2 border-ink shadow-hard-sm shrink-0" style={{ backgroundColor: color }}>
          <Icon className="w-5 h-5 text-ink" aria-hidden="true" />
        </span>
        <h2 className="font-display font-bold text-xl sm:text-2xl leading-tight">
          <span className="text-ink/30 mr-1.5">{n}</span>{title}
        </h2>
      </div>
      {children}
    </section>
  )
}

export default function RoadmapView({ roadmap, onRestart }: { roadmap: AIRoadmap; onRestart: () => void }) {
  const [downloading, setDownloading] = useState(false)
  const r = roadmap

  async function handleDownload() {
    setDownloading(true)
    try { await downloadAIRoadmap(r) } finally { setDownloading(false) }
  }

  return (
    <div>
      {/* ===== Header ===== */}
      <div className="biz-card p-6 sm:p-8 bg-yellow mb-8">
        <span className="chip bg-white text-ink mb-3"><Sparkles className="w-4 h-4" /> AI roadmap{r.niche ? ` · ${r.niche}` : ''}</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl leading-tight">{r.title}</h1>
        <p className="text-ink/75 font-medium mt-2 max-w-2xl">{r.summary}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {[`Difficulty: ${r.difficulty}`, `Timeline: ${r.totalTimeline}`, `Est. cost: ${r.estimatedCost}`].map((c) => (
            <span key={c} className="inline-flex items-center rounded-full border-2 border-ink bg-white px-3 py-1.5 text-sm font-bold">{c}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={handleDownload} disabled={downloading} className="btn-primary px-5 py-3 disabled:opacity-60">
            {downloading ? <><Check className="w-4 h-4" /> Preparing…</> : <><Download className="w-4 h-4" /> Download PDF</>}
          </button>
          <button onClick={onRestart} className="btn-secondary px-5 py-3"><RotateCcw className="w-4 h-4" /> New roadmap</button>
        </div>
      </div>

      {/* 1. Registration */}
      <Section n={1} icon={ScrollText} title="Registration process" color="#8FD3FF">
        <ol className="space-y-3">
          {r.registration.map((s, i) => (
            <li key={i} className="biz-card p-4 flex gap-4">
              <span className="grid place-items-center w-8 h-8 rounded-full bg-ink text-yellow font-bold text-sm shrink-0">{i + 1}</span>
              <div>
                <p className="font-bold">{s.step}</p>
                <p className="text-sm text-muted mt-0.5">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 2. Licenses */}
      <Section n={2} icon={BadgeCheck} title="Licenses & permissions" color="#2FB457">
        <div className="grid sm:grid-cols-2 gap-4">
          {r.licenses.map((l, i) => (
            <div key={i} className="biz-card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold leading-tight">{l.name}</p>
                <span className={`shrink-0 rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-bold ${l.mandatory ? 'bg-biz-pink text-ink' : 'bg-paper text-ink'}`}>{l.mandatory ? 'Mandatory' : 'Optional'}</span>
              </div>
              <p className="text-xs font-semibold text-accent mt-1">{l.authority}</p>
              {l.cost && <p className="text-sm mt-1"><span className="font-semibold">Cost:</span> {l.cost}</p>}
              {l.notes && <p className="text-sm text-muted mt-1">{l.notes}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Fees */}
      <Section n={3} icon={IndianRupee} title="Charges & fees" color="#FFE111">
        <div className="biz-card overflow-hidden p-0">
          <ul className="divide-y-2 divide-ink/10">
            {r.fees.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-semibold text-sm">{f.item}</p>
                  {f.frequency && <p className="text-xs text-muted">{f.frequency}</p>}
                </div>
                <span className="font-display font-bold text-lg text-ink whitespace-nowrap">{f.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 4. Suppliers */}
      <Section n={4} icon={Store} title="Suppliers & manufacturers" color="#FF6A2B">
        <div className="grid sm:grid-cols-2 gap-4">
          {r.suppliers.map((s, i) => (
            <div key={i} className="biz-card p-4 flex flex-col">
              <p className="font-bold leading-tight">{s.category}</p>
              {s.priceRange && <p className="text-sm font-semibold text-[#157f3c] mt-1">{s.priceRange}</p>}
              {s.whatToLookFor && <p className="text-sm text-muted mt-1 flex-1">{s.whatToLookFor}</p>}
              <a href={indiamartUrl(s.indiamartQuery)} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold shadow-hard-sm hover:-translate-y-0.5 hover:shadow-hard transition-all self-start">
                Find on IndiaMART <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Market & competitors */}
      <Section n={5} icon={TrendingUp} title="Market insights & competitors" color="#7B6EF6">
        <div className="biz-card p-5 mb-4">
          <p className="text-sm text-ink/80">{r.market.overview}</p>
          {r.market.trends.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {r.market.trends.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-biz-sky px-3 py-1.5 text-xs font-semibold"><TrendingUp className="w-3 h-3" /> {t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {r.market.competitors.map((c, i) => (
            <div key={i} className="biz-card p-4">
              <p className="font-bold flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-biz-purple" /> {c.name}</p>
              <p className="text-sm text-muted mt-1">{c.positioning}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Timeline */}
      <Section n={6} icon={CalendarClock} title="Estimated timeline" color="#FF5CA8">
        <ol className="relative border-l-2 border-ink/20 ml-3 space-y-5">
          {r.timeline.map((t, i) => (
            <li key={i} className="ml-6">
              <span className="absolute -left-[9px] grid place-items-center w-4 h-4 rounded-full bg-biz-pink border-2 border-ink" aria-hidden="true" />
              <div className="biz-card p-4">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <p className="font-bold">{t.phase}</p>
                  <span className="text-xs font-bold text-accent">{t.duration}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {t.milestones.map((m, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted"><Check className="w-4 h-4 text-[#157f3c] shrink-0 mt-0.5" /> {m}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 7. Challenges */}
      <Section n={7} icon={ShieldAlert} title="Common challenges & solutions" color="#FF6A2B">
        <div className="space-y-4">
          {r.challenges.map((c, i) => (
            <div key={i} className="biz-card p-4">
              <p className="font-bold flex items-start gap-2"><ShieldAlert className="w-4 h-4 text-biz-orange shrink-0 mt-1" /> {c.challenge}</p>
              <p className="text-sm text-ink/80 mt-2 flex items-start gap-2 pl-6"><span className="font-semibold text-[#157f3c]">Fix:</span> {c.solution}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex flex-wrap gap-3 justify-center mt-10">
        <button onClick={handleDownload} disabled={downloading} className="btn-primary px-6 py-3 disabled:opacity-60"><Download className="w-4 h-4" /> Download PDF</button>
        <button onClick={onRestart} className="btn-secondary px-6 py-3"><RotateCcw className="w-4 h-4" /> Build another</button>
      </div>
      {r.model && <p className="text-center text-xs text-muted mt-4">Researched with {r.model} · always verify licenses & fees with official sources before you commit.</p>}
    </div>
  )
}
