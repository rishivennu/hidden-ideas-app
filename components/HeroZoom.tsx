'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
import { Library, Compass, Search } from 'lucide-react'

// Apple-TV style scroll zoom: a full-bleed stage (sticky, 100vh) that scales
// DOWN into a framed card as you scroll. The "Now exploring" pill counter-
// scales + lifts so it POPS forward as everything around it shrinks.
export default function HeroZoom() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.66])
  const radius = useTransform(scrollYProgress, [0, 1], [0, 46])
  const ringW = useTransform(scrollYProgress, [0, 0.2, 1], [0, 0, 3])
  const ring = useMotionTemplate`0 0 0 ${ringW}px #141414`

  return (
    <section ref={ref} className="relative h-[210vh]" aria-label="Intro">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden px-2 sm:px-4">
        <motion.div
          style={{ scale, borderRadius: radius, boxShadow: ring }}
          className="relative w-full h-[100svh] bg-yellow overflow-hidden flex items-center justify-center"
        >
          {/* floating illustration cutouts */}
          <Floaty src="/illustrations/skater.png" alt="" className="hidden sm:block w-40 lg:w-56 left-[2%] bottom-[6%] -rotate-6" delay={0} />
          <Floaty src="/illustrations/watermelon.png" alt="" className="hidden sm:block w-36 lg:w-48 right-[3%] top-[8%] rotate-6" delay={0.6} />
          <Floaty src="/illustrations/phone-girl.png" alt="" className="hidden lg:block w-44 right-[4%] bottom-[4%] -rotate-3" delay={1.1} />
          <Floaty src="/illustrations/ideas-head.png" alt="" className="hidden lg:block w-40 left-[4%] top-[7%] rotate-3" delay={0.3} />

          {/* center content — extra top padding so the pill clears the nav at rest */}
          <div className="relative z-10 text-center px-5 max-w-3xl pt-20 sm:pt-16">
            <h1 className="text-hero text-ink mb-5">Find the biz<br />hiding in plain sight</h1>
            <p className="text-lg sm:text-xl font-medium text-ink/80 max-w-xl mx-auto mb-8">
              A living library of under-the-radar business ideas — with downloadable roadmaps, real ₹ numbers, and a smart research bot. No subscription.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/explore?q=${encodeURIComponent(q.trim())}`) }}
              className="relative max-w-lg mx-auto mb-5"
              role="search"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/60" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Research any idea — e.g. vending machines"
                aria-label="Research a business idea"
                className="w-full pl-12 pr-28 py-3.5 rounded-full border-2 border-ink bg-white text-[15px] font-medium shadow-hard focus:outline-none"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink text-white font-bold text-sm px-5 py-2.5 hover:-translate-x-0.5 transition-transform">
                Search
              </button>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/library" className="btn-primary px-7 py-3.5"><Library className="w-4 h-4" /> Browse the library</Link>
              <Link href="/explore" className="btn-secondary px-7 py-3.5"><Compass className="w-4 h-4" /> Open research bot</Link>
            </div>
            <p className="mt-8 text-sm font-semibold text-ink/50">Scroll to explore ↓</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Floaty({ src, alt, className, delay }: { src: string; alt: string; className: string; delay: number }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      aria-hidden={alt === ''}
      className={`absolute drop-shadow-[3px_3px_0_rgba(20,20,20,0.25)] ${className}`}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}
