'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ScrollText, IndianRupee, Store, TrendingUp, ShieldCheck } from 'lucide-react'

const PHASES = [
  { icon: Search, text: 'Researching the market…' },
  { icon: ScrollText, text: 'Finding registrations & licenses…' },
  { icon: IndianRupee, text: 'Estimating charges & fees in ₹…' },
  { icon: Store, text: 'Sourcing suppliers on IndiaMART…' },
  { icon: TrendingUp, text: 'Analyzing competitors & trends…' },
  { icon: ShieldCheck, text: 'Mapping timeline & pitfalls…' },
]

// Loops research phases while `open`. Unlike a timed loader, it never fires a
// completion — the parent closes it when the Gemini fetch resolves.
export default function ResearchLoader({ open, title }: { open: boolean; title: string }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!open) { setPhase(0); return }
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 1600)
    return () => clearInterval(id)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 backdrop-blur-sm px-4"
          role="status" aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.9, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
            className="biz-card bg-white p-8 max-w-md w-full text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full border-2 border-ink bg-yellow grid place-items-center mb-5 shadow-hard-sm">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <Search className="w-7 h-7 text-ink" aria-hidden="true" />
              </motion.div>
            </div>
            <h2 className="font-display font-bold text-xl mb-1 leading-tight">Building your roadmap</h2>
            <p className="text-sm text-muted mb-6 truncate">{title}</p>
            <ul className="space-y-2 text-left">
              {PHASES.map((p, i) => {
                const active = i === phase
                const Icon = p.icon
                return (
                  <li key={i} className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 transition-all ${active ? 'border-ink bg-paper shadow-hard-sm' : 'border-transparent opacity-45'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-biz-green' : 'text-muted'}`} aria-hidden="true" />
                    <span className="text-sm font-semibold">{p.text}</span>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
