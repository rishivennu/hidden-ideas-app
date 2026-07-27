'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Clock, IndianRupee, TrendingUp, Gauge, Check, Printer } from 'lucide-react'
import type { Idea, DemoRoadmap } from '@/lib/demoData'
import { downloadRoadmap } from '@/lib/downloadRoadmap'
import RoadmapCookingLoader from '@/components/RoadmapCookingLoader'
import { pageVariants, pageTransition, staggerContainer, fadeUpItem } from '@/lib/motion'

export default function IdeaDetailClient({ idea }: { idea: Idea }) {
  const [selected, setSelected] = useState(idea.roadmaps[0]?.id ?? '')
  const [justDownloaded, setJustDownloaded] = useState<string | null>(null)
  const [cooking, setCooking] = useState<DemoRoadmap | null>(null)
  const active = idea.roadmaps.find((r) => r.id === selected) ?? idea.roadmaps[0]

  function handleDownload(rm: DemoRoadmap) {
    setCooking(rm)
  }

  function finishCooking() {
    if (!cooking) return
    downloadRoadmap(idea, cooking)
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'download', slug: idea.slug }),
      keepalive: true,
    }).catch(() => {})
    const id = cooking.id
    setCooking(null)
    setJustDownloaded(id)
    setTimeout(() => setJustDownloaded(null), 2500)
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" transition={pageTransition} className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted hover:text-black transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" /> Back to library
      </Link>

      {/* Header */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <motion.span variants={fadeUpItem} className="inline-block text-sm font-medium text-accent bg-accent/10 rounded-full px-3 py-1 mb-4">{idea.category}</motion.span>
        <motion.h1 variants={fadeUpItem} className="text-title mb-3">{idea.title}</motion.h1>
        <motion.p variants={fadeUpItem} className="text-lg text-muted max-w-2xl mb-8">{idea.description}</motion.p>

        {/* Stats */}
        <motion.div variants={fadeUpItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <Stat icon={TrendingUp} label="Monthly potential" value={idea.monthlyPotential} />
          <Stat icon={IndianRupee} label="Startup cost" value={idea.startupCost} />
          <Stat icon={Clock} label="Time to first ₹" value={idea.timeToFirst} />
          <Stat icon={Gauge} label="Passive score" value={`${idea.passiveScore}/5`} />
        </motion.div>
      </motion.div>

      {/* Roadmaps */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
        <div className="lg:sticky lg:top-28 space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Roadmaps</h2>
          {idea.roadmaps.map((rm) => (
            <button
              key={rm.id}
              onClick={() => setSelected(rm.id)}
              className="roadmap-card w-full text-left"
              data-selected={selected === rm.id}
            >
              <p className="font-semibold">{rm.name}</p>
              <p className="text-xs text-muted mt-1">{rm.duration_days} days · {rm.cost_estimate}</p>
              <div className="flex gap-0.5 mt-2" aria-label={`Difficulty ${rm.difficulty} of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < rm.difficulty ? 'bg-accent' : 'bg-black/15'}`} />
                ))}
              </div>
            </button>
          ))}
        </div>

        {active && (
          <div className="glass-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold">{active.name}</h3>
                <p className="text-sm text-muted mt-1">{active.steps.length} steps · {active.duration_days} days</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="btn-secondary text-sm px-4 py-2" aria-label="Print or save as PDF">
                  <Printer className="w-4 h-4" /> PDF
                </button>
                <button onClick={() => handleDownload(active)} className="btn-primary text-sm px-4 py-2">
                  {justDownloaded === active.id ? <><Check className="w-4 h-4" /> Downloaded</> : <><Download className="w-4 h-4" /> Download roadmap</>}
                </button>
              </div>
            </div>

            <ol className="space-y-5">
              {active.steps.map((s) => (
                <li key={s.order} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold text-sm flex items-center justify-center">{s.order}</span>
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted mt-0.5">{s.description}</p>
                    {s.deliverable && (
                      <p className="text-xs mt-2 inline-flex items-center gap-1.5 bg-bg-200 rounded-full px-3 py-1">
                        <Check className="w-3.5 h-3.5 text-accent" aria-hidden="true" /> {s.deliverable}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <p className="text-xs text-muted mt-6 pt-4 border-t border-black/5">Free to download — no account needed. Grab exactly the roadmap you want.</p>
          </div>
        )}
      </div>
      <RoadmapCookingLoader
        open={cooking !== null}
        title={cooking ? `${idea.title} — ${cooking.name}` : ''}
        onComplete={finishCooking}
      />
    </motion.div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="glass-card p-4">
      <Icon className="w-4 h-4 text-accent mb-2" aria-hidden="true" />
      <p className="text-xs text-muted">{label}</p>
      <p className="font-semibold text-sm mt-0.5">{value}</p>
    </div>
  )
}
