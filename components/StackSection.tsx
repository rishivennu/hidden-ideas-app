'use client'

import { ReactNode, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate, useReducedMotion } from 'framer-motion'

// Stacked-card reveal. Each section laps over the previous one (negative top
// margin + rounded top edge + shadow) and does a "liquid" clip-path wipe as it
// scrolls into view. Driven by framer-motion's scroll transforms (JS) instead
// of CSS `animation-timeline: view()` so it runs on EVERY browser — including
// iOS Safari and in-app mobile webviews, where the CSS version silently no-ops.
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
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  // Progress from when the section's top hits the bottom of the viewport (0)
  // to when it reaches ~48% up the screen (1). Smaller range = snappier reveal.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 48%'],
  })

  const inset = useTransform(scrollYProgress, [0, 1], [44, 0])
  const y = useTransform(scrollYProgress, [0, 1], [56, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1])
  const clipPath = useMotionTemplate`inset(${inset}% 0 0 0)`

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
      ref={ref}
      id={id}
      aria-labelledby={labelledby}
      className={base}
      style={{ zIndex: z, backgroundColor: bg, clipPath, y, scale, opacity, willChange: 'clip-path, transform, opacity' }}
    >
      {children}
    </motion.section>
  )
}
