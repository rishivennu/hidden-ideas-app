'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, ArrowRight, Check, Timer, User } from 'lucide-react'

// Honor-gate + strongest-feasible verification.
// Instagram provides NO public API for a third-party website to verify follows,
// so we do the next best thing: enforce the follow action, force a 6-second
// wait (prevents instant skip), capture their @handle, and store it via
// /api/submit so the account owner can cross-check the real follower list.
export const IG_HANDLE = 'bizwithrishi'
export const IG_URL    = `https://www.instagram.com/${IG_HANDLE}`
const KEY      = 'biz:ig-follow'
const DELAY_MS = 5000   // 5 s after landing before gate appears
const WAIT_S   = 6      // countdown after opening IG before verify step

function alreadyUnlocked() {
  if (typeof window === 'undefined') return true
  try { if (localStorage.getItem(KEY) === '1') return true } catch {}
  return document.cookie.includes(`${KEY}=1`)
}
function persistUnlock() {
  try { localStorage.setItem(KEY, '1') } catch {}
  document.cookie = `${KEY}=1; path=/; max-age=${60*60*24*365}; SameSite=Lax`
}

type Step = 'intro' | 'verify' | 'done'

export default function FollowGate() {
  const pathname        = usePathname()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('intro')
  const [handle, setHandle]       = useState('')
  const [countdown, setCountdown] = useState(WAIT_S)
  const [counting, setCounting]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [handleErr, setHandleErr] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const cdRef    = useRef<ReturnType<typeof setInterval>>()

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
    if (!counting) {
      setCounting(true)
      setCountdown(WAIT_S)
      cdRef.current = setInterval(() => {
        setCountdown(n => {
          if (n <= 1) { clearInterval(cdRef.current); return 0 }
          return n - 1
        })
      }, 1000)
    }
    setStep('verify')
  }

  async function confirmFollow() {
    const clean = handle.replace(/^@/, '').trim()
    if (!clean) { setHandleErr('Please enter your Instagram username.'); return }
    setHandleErr('')
    setSaving(true)
    // Store handle for owner to cross-check against real follower list
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `IG follow-gate: @${clean}`,
          description: `@${clean} confirmed following @${IG_HANDLE} via the follow gate on ${new Date().toLocaleDateString()}.`,
          email: null,
        }),
      })
    } catch { /* non-blocking */ }
    setSaving(false)
    setStep('done')
    setTimeout(() => { persistUnlock(); setOpen(false) }, 1400)
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

                {step === 'verify' && (
                  <motion.div key="verify"
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                    transition={{ duration:0.22 }}>
                    <h2 id="fg-title" className="font-display font-bold text-xl text-ink mb-1">
                      {countdown > 0 ? 'Following @' + IG_HANDLE + '?' : 'Confirm your follow'}
                    </h2>
                    <p className="text-muted text-sm mb-5">
                      {countdown > 0
                        ? 'Waiting a moment for Instagram to register your follow…'
                        : 'Enter your @handle so we can verify you followed.'}
                    </p>

                    {countdown > 0 ? (
                      <div className="flex items-center justify-center gap-3 py-4 mb-5">
                        <Timer className="w-5 h-5 text-biz-pink animate-pulse" />
                        <span className="font-display font-bold text-5xl text-ink tabular-nums leading-none">{countdown}</span>
                        <span className="text-muted text-sm self-end mb-1">sec</span>
                      </div>
                    ) : (
                      <div className="text-left mb-4">
                        <label htmlFor="fg-handle" className="block text-sm font-semibold text-ink mb-1.5">
                          Your Instagram username
                        </label>
                        <div className="flex items-center gap-2 border-2 border-ink rounded-full px-4 py-2.5 bg-white shadow-hard-sm">
                          <User className="w-4 h-4 text-muted shrink-0" />
                          <span className="text-muted font-medium text-sm">@</span>
                          <input
                            id="fg-handle"
                            type="text"
                            value={handle}
                            onChange={e => { setHandle(e.target.value); setHandleErr('') }}
                            placeholder="yourhandle"
                            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted outline-none font-medium"
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                          />
                        </div>
                        {handleErr && <p className="text-xs text-biz-pink mt-1.5 font-semibold">{handleErr}</p>}
                      </div>
                    )}

                    <button
                      onClick={countdown > 0 ? openInstagram : confirmFollow}
                      disabled={saving || countdown > 0}
                      className="btn-yellow w-full py-3.5 gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0_var(--ink)]">
                      {saving
                        ? 'Saving…'
                        : countdown > 0
                          ? `Please wait ${countdown}s…`
                          : <><Check className="w-4 h-4" strokeWidth={3} /> I&apos;ve followed — enter site</>}
                    </button>

                    <button onClick={() => setStep('intro')}
                      className="text-xs text-muted underline mt-3 block mx-auto hover:text-ink transition-colors">
                      Not followed yet? Go back
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
