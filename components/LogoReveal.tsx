'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// One-time-per-session intro: a rounded frame draws itself (outline pattern),
// then the logo fills in from a blurred ghost to a solid mark, then the whole
// panel slides up out of the way to reveal the site.
const KEY = 'biz:logo-intro'

export default function LogoReveal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) return
      sessionStorage.setItem(KEY, '1')
    } catch { return }
    setShow(true)
    const t = setTimeout(() => setShow(false), 2100)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-yellow"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <div className="relative flex items-center justify-center w-[220px] h-[220px]">
            {/* Outline frame that draws itself in */}
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none" className="absolute inset-0">
              <motion.rect
                x="10" y="10" width="200" height="200" rx="52"
                stroke="#141414" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.95, ease: 'easeInOut' }}
              />
            </svg>

            {/* Logo: ghost/outline → solid */}
            <motion.img
              src="/illustrations/logo-mark.png"
              alt="biz"
              className="relative w-28 h-auto object-contain"
              initial={{ opacity: 0, scale: 0.72, filter: 'blur(7px)' }}
              animate={{
                opacity: [0, 0.3, 1],
                scale:   [0.72, 0.92, 1],
                filter:  ['blur(7px)', 'blur(2px)', 'blur(0px)'],
              }}
              transition={{ duration: 1.25, times: [0, 0.55, 1], ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
