'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Check } from 'lucide-react'
import { fireConfetti } from '@/lib/confetti'

// Simple honor gate: follow @bizwithrishi to unlock. No verification check,
// no countdown — the user opens Instagram, then confirms and enters. Fast.
export const IG_HANDLE = 'bizwithrishi'
export const IG_URL    = `https://www.instagram.com/${IG_HANDLE}`
const KEY      = 'biz:ig-follow'
const DELAY_MS = 3000   // wait 3s after landing before the gate appears

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

export default function FollowGate() {
  const pathname        = usePathname()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('intro')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const skip = pathname?.startsWith('/admin') || pathname?.startsWith('/auth') ||
               pathname?.startsWith('/login')  || pathname?.startsWith('/signup')

  useEffect(() => {
    if (skip || alreadyUnlocked()) return
    timerRef.current = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(timerRef.current)
  }, [skip])

  // Lock background scroll while gate is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  function openInstagram() {
    window.open(IG_URL, '_blank', 'noopener,noreferrer')
    setStep('confirm')
  }

  function enterSite() {
    setStep('done')
    fireConfetti()
    setTimeout(() => { persistUnlock(); setOpen(false) }, 1200)
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
            initial={{ scale: 0.88, y: 32, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm biz-card overflow-hidden bg-paper"
          >
            {/* Brand header — yellow/ink palette */}
            <div className="bg-yellow border-b-2 border-ink px-6 pt-7 pb-5 text-center">
              <div className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-ink border-2 border-ink shadow-hard-sm mb-3">
                <Instagram className="w-7 h-7 text-yellow" aria-hidden="true" />
              </div>
              <p className="font-display font-bold text-ink text-base leading-snug">
                Free access · one small favour
              </p>
            </div>

            <div className="p-6 text-center">
              <AnimatePresence mode="wait">

                {step === 'intro' && (
                  <motion.div key="intro"
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                    transition={{ duration:0.22 }}>
                    <h2 id="fg-title" className="font-display font-bold text-2xl text-ink mb-2">
                      Follow to unlock
                    </h2>
                    <p className="text-muted text-sm mb-6 leading-relaxed">
                      We keep <strong className="text-ink">biz</strong> 100% free.
                      Follow{' '}
                      <a href={IG_URL} target="_blank" rel="noopener noreferrer"
                        className="font-bold text-ink underline decoration-2 decoration-biz-pink underline-offset-2">
                        @{IG_HANDLE}
                      </a>{' '}
                      on Instagram — ideas, roadmaps and the builder are all yours.
                    </p>
                    <button onClick={openInstagram} className="btn-primary w-full py-3.5 gap-2 mb-3">
                      <Instagram className="w-4 h-4" />
                      Follow @{IG_HANDLE} on Instagram
                    </button>
                    <p className="text-[11px] text-muted">Opens Instagram in a new tab. Come back here after following.</p>
                  </motion.div>
                )}

                {step === 'confirm' && (
                  <motion.div key="confirm"
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                    transition={{ duration:0.22 }}>
                    <h2 id="fg-title" className="font-display font-bold text-2xl text-ink mb-2">
                      All done?
                    </h2>
                    <p className="text-muted text-sm mb-6 leading-relaxed">
                      Once you&apos;ve tapped <strong className="text-ink">Follow</strong> on Instagram,
                      come back and jump straight in.
                    </p>
                    <button onClick={enterSite} className="btn-yellow w-full py-3.5 gap-2 mb-3">
                      <Check className="w-4 h-4" strokeWidth={3} /> I&apos;ve followed — enter site
                    </button>
                    <button onClick={openInstagram}
                      className="text-xs text-muted underline block mx-auto hover:text-ink transition-colors">
                      Open Instagram again
                    </button>
                  </motion.div>
                )}

                {step === 'done' && (
                  <motion.div key="done"
                    initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }}
                    transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow border-2 border-ink shadow-hard mx-auto mb-4">
                      <Check className="w-8 h-8 text-ink" strokeWidth={3} />
                    </div>
                    <h2 className="font-display font-bold text-2xl text-ink mb-1">You&apos;re in!</h2>
                    <p className="text-muted text-sm">Welcome to biz. Unlocking the library…</p>
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
