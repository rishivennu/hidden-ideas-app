'use client'

import { useEffect, useRef, useState } from 'react'

// Typewriter that types a word, holds, deletes, then moves to the next.
// Used inside the hero pill to cycle through hidden-idea names.
export default function TypingRotator({
  words,
  typeSpeed = 55,
  deleteSpeed = 30,
  hold = 1100,
}: {
  words: string[]
  typeSpeed?: number
  deleteSpeed?: number
  hold?: number
}) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing')
  const reduce = useRef(false)

  useEffect(() => {
    reduce.current =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce.current) setText(words[0] ?? '')
  }, [words])

  useEffect(() => {
    if (reduce.current || words.length === 0) return
    const current = words[wordIdx % words.length]
    let t: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed)
      } else {
        t = setTimeout(() => setPhase('deleting'), hold)
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        t = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed)
      } else {
        setWordIdx((i) => (i + 1) % words.length)
        setPhase('typing')
      }
    }
    return () => clearTimeout(t)
  }, [text, phase, wordIdx, words, typeSpeed, deleteSpeed, hold])

  return (
    <span aria-live="polite">
      {text}
      <span className="inline-block w-[2px] h-[1em] -mb-[2px] ml-0.5 bg-accent animate-pulse" aria-hidden="true" />
    </span>
  )
}
