'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, Loader2, Check, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

// ── Auth providers note ────────────────────────────────────────────────────
// PHONE: bypasses SMS entirely — grants access via localStorage flag (no Twilio needed).
// GOOGLE: Supabase → Auth → Providers → Google → enable + paste OAuth Client ID/Secret.
// EMAIL:  works out of the box — no config needed.
// ──────────────────────────────────────────────────────────────────────────

type AuthMode  = 'login' | 'signup'
type Method    = 'email' | 'google' | 'phone'
type PhaseType = 'input' | 'otp' | 'magic-sent' | 'phone-done'

// localStorage key shared with AuthGate to grant phone-number access
export const PHONE_ACCESS_KEY = 'biz:phone-access'

interface Props {
  mode: AuthMode
  onSuccess?: () => void
  redirectTo?: string
}

export default function AuthPanel({ mode: initMode, onSuccess, redirectTo = '/' }: Props) {
  const [mode, setMode]       = useState<AuthMode>(initMode)
  const [method, setMethod]   = useState<Method>('email')
  const [phase, setPhase]     = useState<PhaseType>('input')

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const cbUrl  = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

  function reset() { setError(null); setPhase('input'); setOtp('') }

  // ── Google ────────────────────────────────────────────────────────────────
  async function handleGoogle() {
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: cbUrl },
    })
    if (error) { setError(error.message); setLoading(false) }
    // on success browser navigates away — loading stays true
  }

  // ── Email ─────────────────────────────────────────────────────────────────
  async function handleEmail(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: cbUrl },
        })
        if (error) throw error
        setPhase('magic-sent') // Supabase sends confirmation email
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onSuccess?.()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setLoading(false) }
  }

  // ── Phone — instant access (no SMS / no Twilio cost) ──────────────────────
  // Stores phone in submissions for owner reference, grants access via localStorage.
  async function handlePhone(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const cleaned = phone.startsWith('+') ? phone : '+91' + phone.replace(/\D/g, '')
      // Record number for owner (fire-and-forget — never blocks access)
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Mobile signup: ${cleaned}`,
          description: 'Phone-gate access granted — no OTP needed',
        }),
        keepalive: true,
      }).catch(() => {})
      // Grant access locally — no Supabase phone provider / Twilio required
      localStorage.setItem(PHONE_ACCESS_KEY, '1')
      setPhase('phone-done')
      // Brief thank-you pause before calling onSuccess (which navigates away)
      await new Promise(r => setTimeout(r, 1600))
      onSuccess?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setLoading(false) }
  }

  // Keep handleOtp for reference but it is no longer called by the phone flow
  async function handleOtp(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const cleaned = phone.startsWith('+') ? phone : '+91' + phone.replace(/\D/g, '')
      const { error } = await supabase.auth.verifyOtp({ phone: cleaned, token: otp, type: 'sms' })
      if (error) throw error
      onSuccess?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.')
    } finally { setLoading(false) }
    void handleOtp // suppress unused warning — kept for future SMS re-enable
  }

  const inputCls = 'w-full px-4 py-3 rounded-full border-2 border-ink bg-white text-sm font-medium shadow-hard-sm focus:outline-none focus:ring-2 focus:ring-yellow focus:border-ink transition-all placeholder:text-muted'

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Method tabs */}
      <div className="flex rounded-full border-2 border-ink bg-white shadow-hard-sm mb-6 p-1 gap-1">
        {(['email','phone','google'] as Method[]).map(m => (
          <button key={m} onClick={() => { setMethod(m); reset() }}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-colors capitalize ${
              method===m ? 'bg-ink text-white' : 'text-ink hover:bg-yellow'
            }`}>
            {m === 'google' ? 'Gmail' : m === 'phone' ? 'Mobile' : 'Email'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Google ── */}
        {method === 'google' && (
          <motion.div key="google" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
            <p className="text-sm text-muted text-center mb-5">
              Use your Gmail account — no password needed.
            </p>
            {error && <p role="alert" className="text-sm text-biz-pink font-semibold mb-3 text-center">{error}</p>}
            <button onClick={handleGoogle} disabled={loading}
              className="btn-secondary w-full py-3.5 gap-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>
          </motion.div>
        )}

        {/* ── Email ── */}
        {method === 'email' && phase === 'input' && (
          <motion.div key="email" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
            {error && <p role="alert" className="text-sm text-biz-pink font-semibold mb-3 text-center">{error}</p>}
            <form onSubmit={handleEmail} className="space-y-3" noValidate>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="your@email.com" required autoComplete="email"
                className={inputCls} />
              <div className="relative">
                <input type={showPw?'text':'password'} value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="Password" required minLength={6}
                  autoComplete={mode==='signup'?'new-password':'current-password'}
                  className={inputCls + ' pr-12'} />
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  aria-label={showPw?'Hide password':'Show password'}>
                  {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              <button type="submit" disabled={loading||!email||!password}
                className="btn-primary w-full py-3.5 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                  <>{mode==='signup'?'Create account':'Sign in'} <ArrowRight className="w-4 h-4"/></>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {method === 'email' && phase === 'magic-sent' && (
          <motion.div key="magic-sent" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
            className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-yellow border-2 border-ink shadow-hard mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-6 h-6 text-ink" />
            </div>
            <p className="font-display font-bold text-ink text-lg mb-1">Check your inbox</p>
            <p className="text-muted text-sm">We sent a confirmation link to <strong className="text-ink">{email}</strong>. Click it to activate your account.</p>
          </motion.div>
        )}

        {/* ── Phone — enter number → instant access (no OTP) ── */}
        {method === 'phone' && phase === 'input' && (
          <motion.div key="phone" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
            <p className="text-sm text-muted text-center mb-4">
              Enter your mobile number for instant access — no code needed.
            </p>
            {error && <p role="alert" className="text-sm text-biz-pink font-semibold mb-3 text-center">{error}</p>}
            <form onSubmit={handlePhone} className="space-y-3" noValidate>
              <div className="flex items-center gap-2 border-2 border-ink rounded-full px-4 py-3 bg-white shadow-hard-sm focus-within:ring-2 focus-within:ring-yellow">
                <Phone className="w-4 h-4 text-muted shrink-0"/>
                <span className="text-sm font-medium text-muted">+91</span>
                <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)}
                  placeholder="9876543210" required autoComplete="tel"
                  className="flex-1 bg-transparent text-sm font-medium text-ink placeholder:text-muted outline-none"/>
              </div>
              <button type="submit" disabled={loading||phone.replace(/\D/g,'').length<10}
                className="btn-primary w-full py-3.5 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <>Get Access <ArrowRight className="w-4 h-4"/></>}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Phone done — thank you state ── */}
        {method === 'phone' && phase === 'phone-done' && (
          <motion.div key="phone-done"
            initial={{opacity:0, scale:0.92}} animate={{opacity:1, scale:1}}
            transition={{duration:0.3, ease:[0.22,1,0.36,1]}}
            className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-yellow border-2 border-ink shadow-hard mx-auto mb-4 flex items-center justify-center">
              <Check className="w-7 h-7 text-ink" strokeWidth={3}/>
            </div>
            <p className="font-display font-bold text-ink text-xl mb-2">You're in!</p>
            <p className="text-muted text-sm">Thank you for joining. Taking you there now…</p>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Toggle login ↔ signup */}
      <p className="text-center text-sm text-muted mt-6">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button onClick={() => { setMode(mode==='login'?'signup':'login'); reset() }}
          className="font-bold text-ink underline underline-offset-2 hover:decoration-biz-pink transition-colors">
          {mode === 'login' ? 'Sign up free' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
