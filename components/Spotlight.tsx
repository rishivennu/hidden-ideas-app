"use client"

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from 'framer-motion'

// A soft radial glow that follows the cursor. Drop it as the first child of a
// `relative` container; it listens on the parent and never blocks clicks.
export default function Spotlight({
  color = 'rgba(255,92,168,0.28)',
  size = 420,
}: { color?: string; size?: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(-9999)
  const y = useMotionValue(-9999)

  useEffect(() => {
    if (reduce) return
    const parent = ref.current?.parentElement
    if (!parent) return
    const move = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect()
      x.set(e.clientX - r.left)
      y.set(e.clientY - r.top)
    }
    const leave = () => { x.set(-9999); y.set(-9999) }
    parent.addEventListener('mousemove', move)
    parent.addEventListener('mouseleave', leave)
    return () => {
      parent.removeEventListener('mousemove', move)
      parent.removeEventListener('mouseleave', leave)
    }
  }, [reduce, x, y])

  const bg = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, ${color}, transparent 65%)`
  if (reduce) return null
  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 z-[1] pointer-events-none mix-blend-multiply"
      style={{ background: bg }}
    />
  )
}
