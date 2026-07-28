'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Clock, DollarSign, Zap, Download } from 'lucide-react'
import type { Roadmap } from '@/lib/supabaseClient'
import { trackRoadmapSelect } from '@/lib/analytics'

const DIFFICULTY_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: 'Beginner', color: 'text-emerald-600 bg-emerald-50' },
  2: { label: 'Easy', color: 'text-green-600 bg-green-50' },
  3: { label: 'Medium', color: 'text-amber-600 bg-amber-50' },
  4: { label: 'Hard', color: 'text-orange-600 bg-orange-50' },
  5: { label: 'Expert', color: 'text-red-600 bg-red-50' },
}

interface RoadmapCardProps {
  roadmap: Roadmap
  selected: boolean
  onSelect: () => void
  onDownload: () => void
  downloading?: boolean
}

export default function RoadmapCard({ roadmap, selected, onSelect, onDownload, downloading }: RoadmapCardProps) {
  const [expanded, setExpanded] = useState(false)
  const diff = DIFFICULTY_LABEL[roadmap.difficulty ?? 3]

  function handleSelect() {
    onSelect()
    trackRoadmapSelect(roadmap.id)
  }

  return (
    <motion.div
      layout
      data-selected={selected}
      onClick={handleSelect}
      className="roadmap-card group"
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleSelect() } }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[15px] leading-snug">{roadmap.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {roadmap.duration_days && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {roadmap.duration_days} days
              </span>
            )}
            {roadmap.cost_estimate && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
                <DollarSign className="w-3.5 h-3.5" aria-hidden="true" />
                {roadmap.cost_estimate}
              </span>
            )}
            {diff && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${diff.color}`}>
                <Zap className="w-3 h-3" aria-hidden="true" />
                {diff.label}
              </span>
            )}
          </div>
        </div>

        {/* Selection indicator */}
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
          selected ? 'border-accent bg-accent' : 'border-black/20 bg-white'
        }`} aria-hidden="true">
          {selected && (
            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-full h-full p-0.5" viewBox="0 0 16 16" fill="white">
              <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </motion.svg>
          )}
        </div>
      </div>

      {/* Steps toggle */}
      {roadmap.steps && roadmap.steps.length > 0 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-accent transition-colors"
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} steps for ${roadmap.name}`}
          >
            <span>{expanded ? 'Hide steps' : `Show ${roadmap.steps.length} steps`}</span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.ol
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                className="overflow-hidden mt-3 space-y-2"
                aria-label="Roadmap steps"
              >
                {roadmap.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold mt-0.5">
                      {step.order}
                    </span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-muted text-xs mt-0.5">{step.description}</p>
                      {step.deliverable && (
                        <p className="text-xs text-accent mt-1">→ {step.deliverable}</p>
                      )}
                    </div>
                  </li>
                ))}
              </motion.ol>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Download CTA (shown when selected) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onDownload() }}
              disabled={downloading}
              className="btn-primary w-full mt-4 gap-2"
              aria-label="Download setup guide PDF"
            >
              {downloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Preparing…
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Download Setup Guide — PDF
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
