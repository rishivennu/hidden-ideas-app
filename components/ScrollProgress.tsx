'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

// Slim gradient bar pinned to the very top that fills as the page scrolls.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] bg-gradient-to-r from-accent via-fuchsia-500 to-cyan-400"
    />
  )
}
