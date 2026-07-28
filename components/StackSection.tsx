'use client'

import { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Stacked-card reveal. Each section laps over the previous one (negative top
// margin + rounded top edge + shadow) and does a "liquid" clip-path wipe as it
// enters the viewport. Uses whileInView (viewport intersection) instead of a
// scroll-linked progress value so EVERY section — including the last one, which
// has no scroll runway beneath it — always settles to its final resting state.
// (The old scroll-linked version left the final section shifted up + clipped on
// short mobile viewports, showing a white gap before the footer.)
export default function StackSection({
  children,
  z,
  bg,
  id,
  labelledby,
  first = false,
}: {
  children: ReactNode
  z: number
  bg: string
  id?: string
  labelledby?: string
  first?: boolean
}) {
  const reduce = useReducedMotion()

  const base = `relative border-t-2 border-ink rounded-t-[40px] sm:rounded-t-[56px] shadow-[0_-14px_50px_rgba(20,20,20,0.16)] ${first ? '' : '-mt-10 sm:-mt-12'}`

  // First card is already in view on load, and reduced-motion users get it flat.
  if (first || reduce) {
    return (
      <section id={id} aria-labelledby={labelledby} className={base} style={{ zIndex: z, backgroundColor: bg }}>
        {children}
      </section>
    )
  }

  return (
    <motion.section
      id={id}
      aria-labelledby={labelledby}
      className={base}
      style={{ zIndex: z, backgroundColor: bg, willChange: 'clip-path, transform, opacity' }}
      initial={{ clipPath: 'inset(44% 0 0 0)', y: 56, scale: 0.97, opacity: 0.4 }}
      whileInView={{ clipPath: 'inset(0% 0 0 0)', y: 0, scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}
