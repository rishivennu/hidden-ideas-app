"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, Variants } from 'framer-motion'

// Cycles through `words`, animating LETTER BY LETTER (slide + 3D flip stagger).
// Interactive: hover pauses the cycle; click/tap jumps to the next word.
// An invisible sizer (the longest word) reserves width so the headline never
// reflows — fully fluid since it inherits the parent's clamp() font-size.

const container: Variants = {
  enter: { transition: { staggerChildren: 0.045 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
}
const letter: Variants = {
  initial: { y: '100%', opacity: 0, rotateX: -90 },
  enter: { y: '0%', opacity: 1, rotateX: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { y: '-100%', opacity: 0, rotateX: 90, transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] } },
}

export default function RotatingWord({
  words,
  interval = 2200,
  className = '',
}: { words: string[]; interval?: number; className?: string }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), '')

  const next = useCallback(() => setI(v => (v + 1) % words.length), [words.length])

  useEffect(() => {
    if (reduce || paused) return
    const t = setInterval(next, interval)
    return () => clearInterval(t)
  }, [interval, reduce, paused, next])

  if (reduce) return <span className={className}>{words[0]}</span>

  const word = words[i]

  return (
    <span
      className={`relative inline-grid align-baseline overflow-hidden pb-[0.12em] -mb-[0.12em] cursor-pointer select-none ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={next}
      role="button"
      tabIndex={0}
      aria-label="Change word"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next() } }}
      title="Tap to change"
    >
      <span className="col-start-1 row-start-1 invisible whitespace-nowrap" aria-hidden="true">{longest}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          className="col-start-1 row-start-1 inline-flex whitespace-nowrap"
          style={{ perspective: 600 }}
          variants={container}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {word.split('').map((ch, idx) => (
            <motion.span
              key={`${word}-${idx}`}
              className="inline-block origin-bottom"
              style={{ transformStyle: 'preserve-3d' }}
              variants={letter}
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
