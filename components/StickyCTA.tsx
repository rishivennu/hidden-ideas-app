"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Library, X } from 'lucide-react'

// Mobile-only sticky bar. Appears after the hero, dismissable for the session.
export default function StickyCTA() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try { if (sessionStorage.getItem('biz:cta-dismissed') === '1') setDismissed(true) } catch {}
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function dismiss() {
    setDismissed(true)
    try { sessionStorage.setItem('biz:cta-dismissed', '1') } catch {}
  }

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="sm:hidden fixed inset-x-3 bottom-3 z-[90]"
        >
          <div className="biz-card bg-yellow flex items-center gap-3 py-3 pl-4 pr-2">
            <p className="flex-1 font-display font-bold text-sm text-ink leading-tight">
              Your next idea is one tap away
            </p>
            <Link href="/library" className="btn-primary text-sm px-4 py-2.5 shrink-0">
              <Library className="w-4 h-4" /> Browse
            </Link>
            <button onClick={dismiss} aria-label="Dismiss" className="grid place-items-center w-8 h-8 rounded-full text-ink/60 hover:text-ink shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
