'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check } from 'lucide-react'

const PHASES = [
  'Analyzing the market…',
  'Structuring your steps…',
  'Estimating costs in ₹…',
  'Mapping the timeline…',
  'Plating your roadmap…',
]

// Futuristic "cooking your roadmap" overlay. Cycles phases, then fires onComplete
// which triggers the real download. Purely cosmetic — respects reduced-motion.
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
    PHASES.forEach((_, i) => {
      timers.push(setTimeout(() => setPhase(i), i * perPhase))
    })
    const total = PHASES.length * perPhase
    timers.push(setTimeout(() => setDone(true), total))
    timers.push(setTimeout(() => onComplete(), total + 650))
    return () => timers.forEach(clearTimeout)
  }, [open, onComplete])

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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" aria-hidden="true" />

          <motion.div
            className="relative w-full max-w-sm rounded-3xl bg-white/90 dark:bg-white/90 border border-white/60 shadow-2xl px-8 py-10 text-center overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* animated aurora background */}
            <motion.div
              aria-hidden="true"
              className="absolute -inset-24 opacity-40 blur-3xl"
              style={{ background: 'conic-gradient(from 0deg, #7c3aed, #d946ef, #22d3ee, #7c3aed)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative">
              {/* pulsing orb */}
              <div className="mx-auto mb-6 relative w-16 h-16">
                <motion.span
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-fuchsia-500"
                  animate={done ? { scale: 1 } : { scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.4, repeat: done ? 0 : Infinity, ease: 'easeInOut' }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full bg-accent/40"
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-white">
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Check className="w-7 h-7" />
                      </motion.span>
                    ) : (
                      <motion.span key="s" animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Sparkles className="w-7 h-7" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-1 text-black">
                {done ? 'Roadmap ready!' : 'Cooking your roadmap'}
              </h3>
              <p className="text-sm text-black/50 mb-6 truncate">{title}</p>

              {/* phase text */}
              <div className="h-6 mb-5">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={done ? 'done' : phase}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="text-sm font-medium text-accent"
                  >
                    {done ? 'Starting your download…' : PHASES[phase]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* shimmer progress bar */}
              <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent via-fuchsia-500 to-cyan-400"
                  initial={{ width: '0%' }}
                  animate={{ width: done ? '100%' : `${((phase + 1) / PHASES.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
