'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, FileDown } from 'lucide-react'

const PHASES = [
  'Analyzing the market…',
  'Structuring your steps…',
  'Estimating costs in ₹…',
  'Mapping the timeline…',
  'Printing your PDF…',
]

// On-brand "building your roadmap" overlay in the bold biz style: thick ink
// borders, hard offset shadows, chunky Fredoka. Cycles phases, then fires
// onComplete which triggers the real PDF download. Respects reduced-motion.
export default function RoadmapCookingLoader({
  open,
  title,
  onComplete,
}: {
  open: boolean
  title: string
  onComplete: () => void
}) {
  const [phase, setPhase] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) {
      setPhase(0)
      setDone(false)
      return
    }
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const perPhase = reduce ? 120 : 520
    const timers: ReturnType<typeof setTimeout>[] = []
    PHASES.forEach((_, i) => { timers.push(setTimeout(() => setPhase(i), i * perPhase)) })
    const total = PHASES.length * perPhase
    timers.push(setTimeout(() => setDone(true), total))
    timers.push(setTimeout(() => onComplete(), total + 700))
    return () => timers.forEach(clearTimeout)
  }, [open, onComplete])

  const pct = done ? 100 : ((phase + 1) / PHASES.length) * 100

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Preparing your roadmap"
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" aria-hidden="true" />

          <motion.div
            className="relative w-full max-w-sm rounded-[28px] bg-white border-2 border-ink shadow-hard-lg px-8 py-9 text-center overflow-hidden"
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {/* yellow top band */}
            <div className="absolute inset-x-0 top-0 h-24 bg-yellow border-b-2 border-ink" aria-hidden="true" />

            {/* bouncing illustration in a ring */}
            <div className="relative mx-auto mb-5 w-20 h-20">
              <motion.div
                className="w-20 h-20 rounded-full bg-white border-2 border-ink shadow-hard-sm overflow-hidden flex items-center justify-center"
                animate={done ? { y: 0, rotate: 0 } : { y: [0, -8, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 1.4, repeat: done ? 0 : Infinity, ease: 'easeInOut' }}
              >
                {done ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 320 }} className="text-biz-green">
                    <Check className="w-9 h-9" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <img src="/illustrations/ideas-head.png" alt="" aria-hidden="true" className="w-16 h-16 object-contain" />
                )}
              </motion.div>
            </div>

            <div className="relative">
              <h3 className="font-display font-semibold text-xl mb-1 text-ink">
                {done ? 'Roadmap ready!' : 'Building your roadmap'}
              </h3>
              <p className="text-sm text-muted mb-6 truncate">{title}</p>

              {/* phase text */}
              <div className="h-6 mb-4">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={done ? 'done' : phase}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="text-sm font-bold text-ink inline-flex items-center gap-1.5"
                  >
                    {done ? <><FileDown className="w-4 h-4" /> Starting your download…</> : PHASES[phase]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* chunky progress bar */}
              <div className="h-4 rounded-full bg-white border-2 border-ink overflow-hidden">
                <motion.div
                  className="h-full bg-biz-green"
                  initial={{ width: '0%' }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-ink/60">{Math.round(pct)}%</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
