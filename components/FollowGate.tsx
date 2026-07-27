'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Check, ArrowRight, Lock } from 'lucide-react'

// Honor-based Instagram follow gate. Instagram gives websites NO way to verify
// whether a visitor follows an account, so this pops up 5s after landing, sends
// people to the profile, and unlocks once they follow + confirm. The unlock is
// remembered (localStorage + a 1-year cookie) so returning visitors aren't nagged.
export const IG_HANDLE = 'bizwithrishi'
export const IG_URL = `https://www.instagram.com/${IG_HANDLE}`
const KEY = 'biz:ig-follow'
const DELAY_MS = 5000

function alreadyUnlocked(): boolean {
  if (typeof window === 'undefined') return true
  try {
    if (localStorage.getItem(KEY) === '1') return true
  } catch {}
  return document.cookie.includes(`${KEY}=1`)
}

function persistUnlock() {
  try { localStorage.setItem(KEY, '1') } catch {}
  document.cookie = `${KEY}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

export default function FollowGate() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [clickedFollow, setClickedFollow] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  // don't gate the admin/auth surfaces
  const skip = pathname?.startsWith('/admin') || pathname?.startsWith('/auth')

  useEffect(() => {
    if (skip || alreadyUnlocked()) return
    timer.current = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(timer.current)
  }, [skip])

  // lock background scroll while gated
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  function follow() {
    setClickedFollow(true)
    window.open(IG_URL, '_blank', 'noopener,noreferrer')
  }
  function enter() {
    persistUnlock()
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          role="dialog" aria-modal="true" aria-labelledby="fg-title"
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" aria-hidden="true" />

          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md biz-card overflow-hidden bg-white"
          >
            {/* Instagram-gradient header */}
            <div className="relative px-6 py-7 text-center text-white border-b-2 border-ink"
              style={{ background: 'linear-gradient(120deg,#F58529 0%,#DD2A7B 45%,#8134AF 75%,#515BD4 100%)' }}>
              <span className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-white/15 border-2 border-white/40 backdrop-blur mb-3">
                <Instagram className="w-8 h-8" aria-hidden="true" />
              </span>
              <p className="font-display font-bold text-lg leading-tight flex items-center justify-center gap-1.5">
                <Lock className="w-4 h-4" aria-hidden="true" /> One quick thing
              </p>
            </div>

            <div className="p-6 sm:p-7 text-center">
              <h2 id="fg-title" className="font-display font-bold text-2xl mb-2">
                Follow to unlock the library
              </h2>
              <p className="text-muted mb-5">
                We keep <span className="font-bold text-ink">biz</span> free. Just follow{' '}
                <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-ink underline decoration-2 decoration-biz-pink underline-offset-2">@{IG_HANDLE}</a>{' '}
                on Instagram to get in — free ideas, roadmaps and the builder.
              </p>

              <div className="flex flex-col gap-2.5">
                <button onClick={follow}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-white border-2 border-ink shadow-hard hover:-translate-y-0.5 transition-transform"
                  style={{ background: 'linear-gradient(120deg,#F58529 0%,#DD2A7B 45%,#8134AF 75%,#515BD4 100%)' }}>
                  {clickedFollow ? <><Check className="w-5 h-5" strokeWidth={3} /> Opened Instagram</> : <><Instagram className="w-5 h-5" /> Follow @{IG_HANDLE}</>}
                </button>

                <button onClick={enter} disabled={!clickedFollow}
                  className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0_var(--ink)]">
                  I&apos;m following — enter site <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-muted mt-4 leading-relaxed">
                {clickedFollow
                  ? 'Thanks for the follow! Tap “enter site” to continue.'
                  : 'Tap Follow first — it opens the profile in a new tab.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
