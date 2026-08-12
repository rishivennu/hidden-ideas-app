'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Instagram, Check, Sparkles, Zap, Gift, ArrowRight } from 'lucide-react'
import { fireConfetti } from '@/lib/confetti'
import { IDEAS } from '@/lib/demoData'

// Friendly, OPTIONAL follow prompt for @bizwithrishi. Following is never forced —
// "Maybe later" always gets you straight in. Once dismissed (either path) it
// never nags again. No verification, no countdown, no dark patterns.
export const IG_HANDLE = 'bizwithrishi'
export const IG_URL    = `https://www.instagram.com/${IG_HANDLE}`
const KEY      = 'biz:ig-follow'
const DELAY_MS = 3000   // wait 3s after landing before the card appears

function alreadyUnlocked() {
  if (typeof window === 'undefined') return true
  try { if (localStorage.getItem(KEY) === '1') return true } catch {}
  return document.cookie.includes(`${KEY}=1`)
}
function persistUnlock() {
  try { localStorage.setItem(KEY, '1') } catch {}
  document.cookie = `${KEY}=1; path=/; max-age=${60*60*24*365}; SameSite=Lax`
}

type Step = 'intro' | 'confirm' | 'done'

// Rotating one-liners so the card never feels like the same static popup.
const HOOKS = [
  'New hidden idea every week.',
  'Roadmaps before anyone else.',
  'Zero fluff. Zero ads. Zero cost.',
  'Built for people who actually ship.',
]

const PERKS = [
  { icon: Zap,      text: 'New ideas land on Instagram first' },
  { icon: Gift,     text: 'Free guides, no email hoops' },
  { icon: Sparkles, text: 'Behind-the-scenes of every build' },
]

export default function FollowGate() {
  const pathname        = usePathname()
  const reduce          = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('intro')
  const [hook, setHook] = useState(0)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const timerRef  = useRef<ReturnType<typeof setTimeout>>()
  const primaryRef = useRef<HTMLButtonElement>(null)

  const skip = pathname?.startsWith('/admin') || pathname?.startsWith('/auth') ||
               pathname?.startsWith('/login')  || pathname?.startsWith('/signup')

  useEffect(() => {
    if (skip || alreadyUnlocked()) return
    timerRef.current = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(timerRef.current)
  }, [skip])

  // Lock background scroll, focus the primary action, Escape = "maybe later"
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => primaryRef.current?.focus(), 420)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') enterSite()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Cycle the hook line while the intro step is showing
  useEffect(() => {
    if (!open || step !== 'intro' || reduce) return
    const id = setInterval(() => setHook((h) => (h + 1) % HOOKS.length), 2600)
    return () => clearInterval(id)
  }, [open, step, reduce])

  function openInstagram() {
    window.open(IG_URL, '_blank', 'noopener,noreferrer')
    setStep('confirm')
  }

  function enterSite() {
    setStep('done')
    fireConfetti()
    setTimeout(() => { persistUnlock(); setOpen(false) }, 1500)
  }

  // Gentle pointer tilt — skipped entirely for reduced-motion users
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -6,
      y: ((e.clientX - r.left) / r.width  - 0.5) *  6,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog" aria-modal="true" aria-labelledby="fg-title"
        >
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-md" aria-hidden="true" />

          <motion.div
            initial={{ scale: 0.86, y: 40, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
            className="relative w-full max-w-sm biz-card overflow-hidden bg-paper shadow-hard-lg"
          >
            {/* ── Ticket header ─────────────────────────────────── */}
            <div className="relative bg-yellow border-b-2 border-ink px-6 pt-7 pb-6 text-center overflow-hidden">
              {/* Dotted texture */}
              <div aria-hidden="true" className="absolute inset-0 opacity-[0.18]"
                style={{ backgroundImage: 'radial-gradient(#141414 1.2px, transparent 1.2px)', backgroundSize: '14px 14px' }} />

              {/* Avatar with a spinning story ring */}
              <div className="relative inline-grid place-items-center w-20 h-20 mb-3">
                <span aria-hidden="true"
                  className={`absolute inset-0 rounded-full ${reduce ? '' : 'animate-spinSlow'}`}
                  style={{ background: 'conic-gradient(from 0deg, #FF5CA8, #FF6A2B, #FFE111, #7B6EF6, #FF5CA8)' }} />
                <span aria-hidden="true" className="absolute inset-[3px] rounded-full bg-yellow" />
                <span className="relative grid place-items-center w-14 h-14 rounded-full bg-ink border-2 border-ink">
                  <Instagram className="w-7 h-7 text-yellow" aria-hidden="true" />
                </span>
              </div>

              <p className="relative font-bold text-ink/70 text-[11px] uppercase tracking-[0.18em]">
                Free forever · no ads
              </p>
              <p className="relative font-display font-bold text-ink text-lg leading-tight mt-1">
                @{IG_HANDLE}
              </p>

              {/* Rotating hook */}
              <div className="relative h-5 mt-1.5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p key={hook}
                    initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="text-xs font-semibold text-ink/70">
                    {HOOKS[hook]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Perforation notches */}
            <div aria-hidden="true" className="relative h-0">
              <span className="absolute -left-2.5 -top-2.5 w-5 h-5 rounded-full bg-ink/70 border-2 border-ink" />
              <span className="absolute -right-2.5 -top-2.5 w-5 h-5 rounded-full bg-ink/70 border-2 border-ink" />
            </div>

            <div className="p-6 pt-7 text-center">
              <AnimatePresence mode="wait">

                {step === 'intro' && (
                  <motion.div key="intro"
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                    transition={{ duration:0.22 }}>
                    <h2 id="fg-title" className="font-display font-bold text-2xl text-ink mb-1">
                      Give us a follow?
                    </h2>
                    <p className="text-muted text-sm mb-5">
                      Completely optional. It just genuinely helps.
                    </p>

                    {/* Stat strip */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      <Stat value={`${IDEAS.length}`} label="ideas live" />
                      <Stat value="Weekly" label="new drops" />
                      <Stat value="₹0" label="forever" />
                    </div>

                    {/* Perks */}
                    <ul className="text-left space-y-2 mb-6">
                      {PERKS.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-start gap-2.5 text-sm text-ink">
                          <span className="grid place-items-center w-5 h-5 shrink-0 rounded-full bg-yellow border-2 border-ink mt-0.5">
                            <Icon className="w-3 h-3 text-ink" aria-hidden="true" />
                          </span>
                          {text}
                        </li>
                      ))}
                    </ul>

                    {/* Primary CTA with a shine sweep */}
                    <button ref={primaryRef} onClick={openInstagram}
                      className="group relative overflow-hidden btn-primary w-full py-3.5 gap-2 mb-2">
                      <Instagram className="w-4 h-4" aria-hidden="true" />
                      Follow @{IG_HANDLE}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      {!reduce && (
                        <span aria-hidden="true"
                          className="pointer-events-none absolute top-0 -left-full h-full w-1/2 skew-x-[-20deg] bg-white/25 transition-all duration-700 group-hover:left-[150%]" />
                      )}
                    </button>
                    <button onClick={enterSite} className="btn-secondary w-full py-3 mb-3">
                      Maybe later — just let me in
                    </button>
                    <p className="text-[11px] text-muted">
                      Opens Instagram in a new tab. Either way you get full access.
                    </p>
                  </motion.div>
                )}

                {step === 'confirm' && (
                  <motion.div key="confirm"
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                    transition={{ duration:0.22 }}>
                    <h2 id="fg-title" className="font-display font-bold text-2xl text-ink mb-2">
                      Legend. All done?
                    </h2>
                    <p className="text-muted text-sm mb-6 leading-relaxed">
                      Tap <strong className="text-ink">Follow</strong> over on Instagram, then hop back
                      here and dive in.
                    </p>
                    <button onClick={enterSite} className="btn-yellow w-full py-3.5 gap-2 mb-3">
                      <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" />
                      I&apos;ve followed — let me in
                    </button>
                    <button onClick={openInstagram}
                      className="text-xs text-muted underline block mx-auto hover:text-ink transition-colors">
                      Open Instagram again
                    </button>
                    <button onClick={enterSite}
                      className="text-xs text-muted underline block mx-auto mt-2 hover:text-ink transition-colors">
                      Skip — enter site
                    </button>
                  </motion.div>
                )}

                {step === 'done' && (
                  <motion.div key="done"
                    initial={{ opacity:0 }} animate={{ opacity:1 }}
                    transition={{ duration:0.2 }}>
                    {/* Rubber stamp */}
                    <div className="relative grid place-items-center h-24 mb-2">
                      <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl border-[3px] border-biz-green text-biz-green font-display font-bold text-xl tracking-wide ${reduce ? '' : 'animate-stamp'}`}>
                        <Check className="w-5 h-5" strokeWidth={4} aria-hidden="true" />
                        YOU&apos;RE IN
                      </span>
                    </div>
                    <p aria-live="polite" className="text-muted text-sm">
                      Welcome to biz. Unlocking the library…
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border-2 border-ink bg-white shadow-hard-sm px-2 py-2">
      <p className="font-display font-bold text-ink text-base leading-none">{value}</p>
      <p className="text-[10px] text-muted mt-1 leading-tight">{label}</p>
    </div>
  )
}
