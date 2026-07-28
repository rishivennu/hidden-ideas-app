'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { PHONE_ACCESS_KEY } from './AuthPanel'

// Paths that are always public — no login needed.
const PUBLIC = ['/login', '/signup', '/auth', '/terms', '/privacy', '/admin']
const isPublic = (p: string) => PUBLIC.some(pub => p === pub || p.startsWith(pub + '/'))

// Returns true if the user has granted themselves phone-number access (no Supabase session needed)
function hasPhoneAccess(): boolean {
  try { return !!localStorage.getItem(PHONE_ACCESS_KEY) } catch { return false }
}

// Full-site auth gate. Renders an overlay over {children} while session state
// is loading, then either lets the user through or shows a branded sign-in
// prompt with buttons to /login and /signup. Does NOT unmount page content
// (good for SEO prerender on static pages) — just visually gates it.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [status, setStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading')

  useEffect(() => {
    // Check phone-access flag first (instant, no network)
    if (hasPhoneAccess()) { setStatus('authed'); return }

    // Initial Supabase session check
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'authed' : 'unauthed')
    })

    // Stay in sync on sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session || hasPhoneAccess() ? 'authed' : 'unauthed')
    })

    // Phone access grants no Supabase event — listen for our own signal + cross-tab storage
    const onPhoneAccess = () => { if (hasPhoneAccess()) setStatus('authed') }
    window.addEventListener('biz:phone-access', onPhoneAccess)
    window.addEventListener('storage', onPhoneAccess)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('biz:phone-access', onPhoneAccess)
      window.removeEventListener('storage', onPhoneAccess)
    }
  }, [])

  // Public paths pass through immediately
  if (isPublic(pathname ?? '')) return <>{children}</>

  return (
    <>
      {children}

      <AnimatePresence>
        {status !== 'authed' && (
          <motion.div
            key="auth-gate"
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-paper/80 backdrop-blur-sm" aria-hidden="true" />

            {status === 'loading' ? (
              <Loader2 className="relative z-10 w-8 h-8 animate-spin text-ink" />
            ) : (
              <motion.div
                initial={{ scale: 0.9, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 biz-card bg-white overflow-hidden w-full max-w-sm text-center"
                role="dialog" aria-modal="true" aria-label="Sign in required"
              >
                {/* Yellow header */}
                <div className="bg-yellow border-b-2 border-ink px-6 py-6">
                  <img src="/illustrations/logo-mark.png" alt="biz"
                    className="h-8 w-auto object-contain mx-auto mb-3" />
                  <h2 className="font-display font-bold text-2xl text-ink">
                    Sign in to continue
                  </h2>
                  <p className="text-sm text-ink/70 mt-1">
                    Free account — ideas, roadmaps &amp; builder all yours.
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
                  <p className="text-xs text-muted">
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
