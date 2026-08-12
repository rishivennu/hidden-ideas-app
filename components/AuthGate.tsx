'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { PHONE_ACCESS_KEY, GUEST_ACCESS_KEY } from './AuthPanel'

// Paths that are always public — no login needed.
const PUBLIC = ['/login', '/signup', '/auth', '/terms', '/privacy', '/admin']
const isPublic = (p: string) => PUBLIC.some(pub => p === pub || p.startsWith(pub + '/'))

// True if the visitor may see the site without a Supabase session:
// either they signed in via phone, or they chose "continue as guest".
function hasLocalAccess(): boolean {
  try {
    return !!localStorage.getItem(PHONE_ACCESS_KEY) || !!localStorage.getItem(GUEST_ACCESS_KEY)
  } catch { return false }
}

// Full-site auth gate. Renders an overlay over {children} while session state
// is loading, then either lets the user through or shows a branded sign-in
// prompt. Signing in is OPTIONAL — an X / "just browsing" button lets any
// visitor dismiss the gate and use the site as a guest. Does NOT unmount page
// content (good for SEO prerender on static pages) — just visually gates it.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [status, setStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading')

  // Grant "just browsing" guest access and dismiss the gate.
  const continueAsGuest = useCallback(() => {
    try {
      localStorage.setItem(GUEST_ACCESS_KEY, '1')
      window.dispatchEvent(new Event('biz:phone-access'))
    } catch {}
    setStatus('authed')
  }, [])

  useEffect(() => {
    // Check local-access flag first (instant, no network)
    if (hasLocalAccess()) { setStatus('authed'); return }

    // Initial Supabase session check
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'authed' : 'unauthed')
    })

    // Stay in sync on sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session || hasLocalAccess() ? 'authed' : 'unauthed')
    })

    // Phone / guest access grants no Supabase event — listen for our own signal + cross-tab storage
    const onLocalAccess = () => { if (hasLocalAccess()) setStatus('authed') }
    window.addEventListener('biz:phone-access', onLocalAccess)
    window.addEventListener('storage', onLocalAccess)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('biz:phone-access', onLocalAccess)
      window.removeEventListener('storage', onLocalAccess)
    }
  }, [])

  // Escape closes the gate as a guest (frictionless entry)
  useEffect(() => {
    if (status !== 'unauthed') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') continueAsGuest() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, continueAsGuest])

  // Public paths pass through immediately
  if (isPublic(pathname ?? '')) return <>{children}</>

  return (
    <>
      {children}

      <AnimatePresence>
        {status !== 'authed' && (
          <motion.div
            key="auth-gate"
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {/* Backdrop — clicking it enters as guest */}
            <button
              type="button"
              onClick={status === 'unauthed' ? continueAsGuest : undefined}
              aria-label="Continue without signing in"
              tabIndex={-1}
              className="absolute inset-0 bg-paper/80 backdrop-blur-sm cursor-default"
            />

            {status === 'loading' ? (
              <Loader2 className="relative z-10 w-8 h-8 animate-spin text-ink" />
            ) : (
              <motion.div
                initial={{ scale: 0.9, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 biz-card bg-white overflow-hidden w-full max-w-sm text-center max-h-[calc(100dvh-2rem)] overflow-y-auto"
                role="dialog" aria-modal="true" aria-label="Sign in or continue as guest"
              >
                {/* Close (X) — dismiss and browse as guest */}
                <button
                  type="button"
                  onClick={continueAsGuest}
                  aria-label="Close and continue without an account"
                  className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full border-2 border-ink bg-white shadow-hard-sm flex items-center justify-center text-ink hover:bg-yellow hover:-translate-y-0.5 hover:shadow-hard transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>

                {/* Yellow header */}
                <div className="bg-yellow border-b-2 border-ink px-6 py-6">
                  <img src="/illustrations/logo-mark.png" alt="biz"
                    className="h-8 w-auto object-contain mx-auto mb-3" />
                  <h2 className="font-display font-bold text-2xl text-ink">
                    Sign in to save your work
                  </h2>
                  <p className="text-sm text-ink/70 mt-1">
                    Free account keeps your saved ideas &amp; roadmaps — or just look around.
                  </p>
                </div>

                <div className="p-6 flex flex-col gap-3">
                  <Link href={`/login?next=${encodeURIComponent(pathname ?? '/')}`}
                    className="btn-primary w-full py-3.5">
                    Sign in
                  </Link>
                  <Link href={`/signup?next=${encodeURIComponent(pathname ?? '/')}`}
                    className="btn-yellow w-full py-3.5">
                    Create free account
                  </Link>

                  {/* Skip — browse as guest, no account needed */}
                  <button
                    type="button"
                    onClick={continueAsGuest}
                    className="mt-1 text-sm font-semibold text-muted hover:text-ink underline underline-offset-4 decoration-2 decoration-ink/20 hover:decoration-biz-pink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow rounded"
                  >
                    Skip — just let me look around →
                  </button>

                  <p className="text-xs text-muted mt-1">
                    By continuing you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-ink">Terms</Link> &amp;{' '}
                    <Link href="/privacy" className="underline hover:text-ink">Privacy</Link>.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
