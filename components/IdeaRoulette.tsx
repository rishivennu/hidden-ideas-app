'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Dices, X, RotateCcw, ArrowRight, IndianRupee, Gauge, Clock } from 'lucide-react'
import { IDEAS, type Idea } from '@/lib/demoData'
import { fireConfetti } from '@/lib/confetti'

// ── Idea Roulette ───────────────────────────────────────────────────────────
// Can't decide what to build? Hit the dice (or press R) and the machine picks
// for you. Slot-reel spin, confetti on landing, then straight into the idea.
// Hidden on auth + admin routes. Keyboard shortcut ignores form fields.

const ROW_H     = 56    // px per reel row — must match the row class height
const REEL_LEN  = 16    // rows spun through before the winner
const SPIN_MS   = 2200

function typingInField(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

function buildReel(winner: Idea): Idea[] {
  const pool = IDEAS.filter((i) => i.slug !== winner.slug)
  const rows: Idea[] = []
  for (let i = 0; i < REEL_LEN; i++) {
    rows.push(pool[Math.floor(Math.random() * pool.length)] ?? winner)
  }
  rows.push(winner)
  return rows
}

export default function IdeaRoulette() {
  const pathname = usePathname()
  const reduce   = useReducedMotion()
  const [open, setOpen]       = useState(false)
  const [reel, setReel]       = useState<Idea[]>([])
  const [spinning, setSpin]   = useState(false)
  const [winner, setWinner]   = useState<Idea | null>(null)
  // Bumped every spin so the reel remounts at y:0 — otherwise the second spin
  // would animate from its already-landed position and visibly do nothing.
  const [spinKey, setSpinKey] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastSlug = useRef<string | null>(null)

  const hidden = !pathname || pathname.startsWith('/admin') || pathname.startsWith('/auth') ||
                 pathname.startsWith('/login') || pathname.startsWith('/signup')

  const spin = useCallback(() => {
    // Never land on the same idea twice in a row — a repeat reads as "broken"
    // even when it is legitimately random.
    const pool = IDEAS.filter((i) => i.slug !== lastSlug.current)
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? IDEAS[0]
    lastSlug.current = pick.slug
    setWinner(null)
    setReel(buildReel(pick))
    setSpinKey((k) => k + 1)
    if (reduce) {
      // No animation for reduced-motion users — just show the result.
      setSpin(false)
      setWinner(pick)
      return
    }
    setSpin(true)
    window.setTimeout(() => {
      setSpin(false)
      setWinner(pick)
      fireConfetti(90)
    }, SPIN_MS)
  }, [reduce])

  const launch = useCallback(() => { setOpen(true); spin() }, [spin])

  // Keyboard shortcut: R
  useEffect(() => {
    if (hidden) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (typingInField(e.target)) return
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); launch() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hidden, launch])

  // Escape closes; lock background scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => closeRef.current?.focus(), 120)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [open])

  if (hidden) return null

  const travel = -(reel.length - 1) * ROW_H

  return (
    <>
      {/* Floating dice — sits above the mobile sticky CTA */}
      <button
        onClick={launch}
        aria-label="Spin the idea roulette (shortcut: R)"
        title="Feeling lucky? Press R"
        className="group fixed right-4 bottom-20 sm:bottom-6 z-[80] w-14 h-14 rounded-full bg-yellow border-2 border-ink shadow-hard grid place-items-center transition-transform hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm"
      >
        <Dices className="w-6 h-6 text-ink transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] grid place-items-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog" aria-modal="true" aria-labelledby="roulette-title"
          >
            <div className="absolute inset-0 bg-ink/70 backdrop-blur-md"
              onClick={() => setOpen(false)} aria-hidden="true" />

            <motion.div
              initial={{ scale: 0.88, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 12, opacity: 0 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md biz-card bg-paper overflow-hidden shadow-hard-lg"
            >
              <button ref={closeRef} onClick={() => setOpen(false)} aria-label="Close idea roulette"
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full border-2 border-ink bg-white shadow-hard-sm grid place-items-center hover:bg-yellow transition-colors">
                <X className="w-4 h-4 text-ink" aria-hidden="true" />
              </button>

              {/* Header */}
              <div className="bg-yellow border-b-2 border-ink px-6 pt-7 pb-5 text-center">
                <p className="font-bold text-ink/70 text-[11px] uppercase tracking-[0.18em]">
                  Surprise me
                </p>
                <h2 id="roulette-title" className="font-display font-bold text-2xl text-ink mt-1">
                  Idea Roulette
                </h2>
                <p className="text-sm text-ink/70 mt-1">
                  {spinning ? 'Shuffling the deck…' : winner ? 'Your idea is served.' : 'Give it a spin.'}
                </p>
              </div>

              {/* Reel window */}
              <div className="px-6 pt-6">
                <div className="relative rounded-2xl border-2 border-ink bg-white shadow-hard-sm overflow-hidden"
                  style={{ height: ROW_H }}>
                  <motion.div
                    key={spinKey}
                    initial={{ y: 0 }}
                    animate={{ y: travel }}
                    transition={reduce
                      ? { duration: 0 }
                      : { duration: SPIN_MS / 1000, ease: [0.12, 0.78, 0.16, 1] }}
                  >
                    {reel.map((idea, i) => (
                      <div key={idea.slug + i}
                        className="flex items-center justify-center px-4 text-center font-display font-bold text-ink text-[15px] leading-tight"
                        style={{ height: ROW_H }}>
                        <span className="line-clamp-2">{idea.title}</span>
                      </div>
                    ))}
                  </motion.div>
                  {/* Centre guides */}
                  <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-yellow border-r-2 border-ink" />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-yellow border-l-2 border-ink" />
                </div>
              </div>

              {/* Result */}
              <div className="p-6">
                <div aria-live="polite" className="min-h-[7.5rem]">
                  <AnimatePresence mode="wait">
                    {winner ? (
                      <motion.div key={winner.slug}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}>
                        <p className="text-sm text-muted mb-3">{winner.tagline}</p>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <Fact icon={IndianRupee} label="to start" value={winner.startupCost} />
                          <Fact icon={Gauge}       label="difficulty" value={winner.difficulty + '/5'} />
                          <Fact icon={Clock}       label="first ₹" value={winner.timeToFirst} />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-sm text-muted py-8 text-center">
                        Rolling through {IDEAS.length} hidden ideas…
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-2">
                  <button onClick={spin} disabled={spinning}
                    className="btn-secondary flex-1 py-3 gap-2 disabled:opacity-50">
                    <RotateCcw className="w-4 h-4" aria-hidden="true" /> Spin again
                  </button>
                  {winner ? (
                    <Link href={`/ideas/${winner.slug}`} onClick={() => setOpen(false)}
                      className="btn-primary flex-1 py-3 gap-2">
                      Open idea <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="btn-primary flex-1 py-3 opacity-50 pointer-events-none" aria-hidden="true">
                      Open idea
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-muted text-center mt-3">
                  Tip: press <kbd className="px-1.5 py-0.5 rounded border-2 border-ink bg-white font-bold text-ink">R</kbd> anywhere to spin.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 border-ink bg-white shadow-hard-sm px-2 py-2 text-center">
      <Icon className="w-3.5 h-3.5 text-ink mx-auto mb-1" aria-hidden="true" />
      <p className="font-display font-bold text-ink text-xs leading-tight">{value}</p>
      <p className="text-[10px] text-muted mt-0.5">{label}</p>
    </div>
  )
}
