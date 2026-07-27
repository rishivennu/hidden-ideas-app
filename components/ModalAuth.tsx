'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { modalOverlayVariants, modalVariants, modalTransition } from '@/lib/motion'

interface ModalAuthProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  title?: string
  subtitle?: string
}

export default function ModalAuth({ open, onClose, onSuccess, title, subtitle }: ModalAuthProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    })
  }

  // Reset state when closed
  function handleClose() {
    setEmail(''); setSent(false); setError(null)
    onClose()
  }

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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <motion.div
              variants={modalVariants}
              initial="initial" animate="animate" exit="exit"
              transition={modalTransition}
              className="w-full sm:max-w-md glass-card p-8 relative"
            >
              {/* Close */}
              <button
                onClick={handleClose}
                aria-label="Close sign-in modal"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-200 flex items-center justify-center hover:bg-bg-300 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>

              {sent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Check your inbox</h2>
                  <p className="text-muted text-sm">
                    We sent a magic link to <strong>{email}</strong>. Click it to sign in and download your guide.
                  </p>
                  <button onClick={handleClose} className="btn-secondary mt-6 w-full">Done</button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 id="modal-title" className="text-xl font-semibold mb-1">
                      {title ?? 'Sign in to download'}
                    </h2>
                    <p className="text-sm text-muted">
                      {subtitle ?? 'Free account. Instant access to your setup guide.'}
                    </p>
                  </div>

                  {/* Google OAuth */}
                  <button
                    onClick={handleGoogle}
                    className="w-full btn-secondary mb-4 gap-3"
                    aria-label="Continue with Google"
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
                    <div className="flex-1 h-px bg-black/10" aria-hidden="true" />
                    <span className="text-xs text-muted">or</span>
                    <div className="flex-1 h-px bg-black/10" aria-hidden="true" />
                  </div>

                  {/* Magic link */}
                  <form onSubmit={handleMagicLink} noValidate>
                    <label htmlFor="auth-email" className="block text-sm font-medium mb-2">Email address</label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-14 border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all mb-3"
                      aria-required="true"
                    />
                    {error && (
                      <p role="alert" className="text-sm text-red-500 mb-3">{error}</p>
                    )}
                    <button type="submit" disabled={loading || !email} className="btn-primary w-full gap-2">
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending…</>
                        : <><Mail className="w-4 h-4" aria-hidden="true" /> Send magic link</>
                      }
                    </button>
                  </form>

                  <p className="text-xs text-muted text-center mt-4">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="underline hover:text-black">Terms</a> and{' '}
                    <a href="/privacy" className="underline hover:text-black">Privacy Policy</a>.
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
