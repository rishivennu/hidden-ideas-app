'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import AuthPanel from './AuthPanel'
import { PHONE_ACCESS_KEY } from './AuthPanel'
import Footer from './Footer'

interface Props { mode: 'login' | 'signup' }

export default function AuthPageClient({ mode }: Props) {
  const router = useRouter()
  const params  = useSearchParams()
  const next    = params.get('next') ?? '/'

  // If already signed in (Supabase session OR phone-access flag), bounce to destination
  useEffect(() => {
    try {
      if (localStorage.getItem(PHONE_ACCESS_KEY)) { router.replace(next); return }
    } catch {}
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next)
    })
  }, [router, next])

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Minimal brand header */}
      <header className="px-5 py-4 border-b-2 border-ink bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" aria-label="biz home">
            <img src="/illustrations/logo-mark.png" alt="biz" className="h-7 w-auto object-contain" />
          </Link>
          <Link href={mode === 'login' ? '/signup' : '/login'}
            className="text-sm font-semibold text-ink hover:underline">
            {mode === 'login' ? 'Sign up free →' : '← Back to sign in'}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.36, ease:[0.22,1,0.36,1] }}
          className="w-full"
        >
          {/* Card */}
          <div className="biz-card bg-white w-full max-w-sm mx-auto overflow-hidden">
            {/* Yellow header */}
            <div className="bg-yellow border-b-2 border-ink px-6 py-6 text-center">
              <h1 className="font-display font-bold text-2xl text-ink">
                {mode === 'login' ? 'Welcome back' : 'Join biz — free'}
              </h1>
              <p className="text-sm text-ink/70 mt-1">
                {mode === 'login'
                  ? 'Sign in to access your roadmaps and saved ideas.'
                  : 'Free ideas, roadmaps & the builder. No card needed.'}
              </p>
            </div>

            <div className="p-6">
              <AuthPanel
                mode={mode}
                onSuccess={() => router.replace(next)}
                redirectTo={next}
              />
            </div>
          </div>

          <p className="text-center text-xs text-muted mt-6">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline hover:text-ink">Terms</Link> &amp;{' '}
            <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
