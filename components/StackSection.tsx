'use client'

import { ReactNode } from 'react'

// Unmask-on-scroll (Framer technique, robust variant): each section has an
// opaque background, a rounded top edge, a top border + shadow and a negative
// top margin so it visually LAPS OVER the previous section like a stacked card.
// The `.unmask` class runs a native scroll-driven clip-path wipe (Edge/Chrome
// `animation-timeline: view()`) so the section reveals layer by layer as it
// enters — no scroll JS and, unlike raw sticky stacking, no content trapping.
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
  return (
    <section
      id={id}
      aria-labelledby={labelledby}
      className={`unmask relative border-t-2 border-ink rounded-t-[40px] sm:rounded-t-[56px] shadow-[0_-14px_50px_rgba(20,20,20,0.16)] ${first ? '' : '-mt-8 sm:-mt-12'}`}
      style={{ zIndex: z, backgroundColor: bg }}
    >
      {children}
    </section>
  )
}
