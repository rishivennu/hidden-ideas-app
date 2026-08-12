'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader2, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { modalOverlayVariants, modalVariants, modalTransition } from '@/lib/motion'
import { googleOAuthOptions } from '@/lib/authConfig'

interface ModalAuthProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  title?: string
  subtitle?: string
  /**
   * Show the "Continue with Google" button. Defaults to FALSE — the public
   * download prompt is email-only. /admin opts in via GOOGLE_AUTH_ADMIN.
   */
  allowGoogle?: boolean
}

export default function ModalAuth({
  open, onClose, onSuccess, title, subtitle, allowGoogle = false,
}: ModalAuthProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cardRef  = useRef<HTMLDivElement>(null)

  // Escape closes; focus lands on the email field so keyboard users can type
  // immediately instead of tabbing in from the page behind the overlay.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
    onSuccess?.()
  }

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    const cb = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: googleOAuthOptions(cb),
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  function handleClose() {
    setEmail(''); setSent(false); setError(null); setLoading(false)
    onClose()
  }

  const inputCls = 'w-full px-4 py-3 rounded-full border-2 border-ink bg-white text-sm font-medium shadow-hard-sm focus:outline-none focus:ring-2 focus:ring-yellow focus:border-ink transition-all placeholder:text-muted'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={modalOverlayVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              ref={cardRef}
              variants={modalVariants}
              initial="initial" animate="animate" exit="exit"
              transition={modalTransition}
              role="dialog" aria-modal="true" aria-labelledby="modal-title"
              className="w-full sm:max-w-md biz-card bg-white overflow-hidden relative pointer-events-auto"
            >
              {/* Close */}
              <button
                onClick={handleClose}
                aria-label="Close sign-in dialog"
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full border-2 border-ink bg-white shadow-hard-sm flex items-center justify-center hover:bg-yellow transition-colors"
              >
                <X className="w-4 h-4 text-ink" aria-hidden="true" />
              </button>

              {sent ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-yellow border-2 border-ink shadow-hard flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-ink" aria-hidden="true" />
                  </div>
                  <h2 id="modal-title" className="font-display font-bold text-xl text-ink mb-2">Check your inbox</h2>
                  <p className="text-muted text-sm">
                    We sent a magic link to <strong className="text-ink">{email}</strong>. Click it to sign in.
                  </p>
                  <button onClick={handleClose} className="btn-primary mt-6 w-full">Done</button>
                </div>
              ) : (
                <>
                  {/* Yellow header */}
                  <div className="bg-yellow border-b-2 border-ink px-6 pt-7 pb-5 text-center">
                    <h2 id="modal-title" className="font-display font-bold text-2xl text-ink">
                      {title ?? 'Sign in to download'}
                    </h2>
                    <p className="text-sm text-ink/70 mt-1">
                      {subtitle ?? 'Free account. Instant access to your setup guide.'}
                    </p>
                  </div>

                  <div className="p-6">
                    {allowGoogle && (
                      <>
                        <button
                          onClick={handleGoogle}
                          disabled={loading}
                          className="btn-secondary w-full mb-4 gap-3 py-3.5"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Continue with Google
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-0.5 bg-ink/15" aria-hidden="true" />
                          <span className="text-xs font-bold text-muted uppercase tracking-wide">or</span>
                          <div className="flex-1 h-0.5 bg-ink/15" aria-hidden="true" />
                        </div>
                      </>
                    )}

                    {/* Magic link */}
                    <form onSubmit={handleMagicLink} noValidate>
                      <label htmlFor="auth-email" className="block text-sm font-semibold mb-2 text-ink">
                        Email address
                      </label>
                      <input
                        ref={inputRef}
                        id="auth-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className={inputCls + ' mb-3'}
                        aria-required="true"
                      />
                      {error && (
                        <p role="alert" className="text-sm text-biz-pink font-semibold mb-3">{error}</p>
                      )}
                      <button type="submit" disabled={loading || !email} className="btn-primary w-full gap-2 py-3.5">
                        {loading
                          ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending…</>
                          : <><Mail className="w-4 h-4" aria-hidden="true" /> Send magic link</>
                        }
                      </button>
                    </form>

                    <p className="text-xs text-muted text-center mt-4 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      No password to remember — we email you a one-tap link.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
