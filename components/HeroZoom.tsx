'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform, useMotionTemplate, useReducedMotion } from 'framer-motion'
import { Library, Compass, Search, Sparkles, Map } from 'lucide-react'
import RotatingWord from './RotatingWord'
import Spotlight from './Spotlight'
import MagneticButton from './MagneticButton'
import { IDEAS } from '@/lib/demoData'

const EXAMPLES = ['Cloud kitchen', 'Vending machines', 'Print-on-demand', 'Pet grooming', 'Cloud accounting']

// Apple-TV style scroll zoom: a full-bleed stage (sticky, 100vh) that scales
// DOWN into a framed card as you scroll. The card clips its own contents, so
// the floating illustrations never bleed past its rounded corners.
export default function HeroZoom() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.66])
  const radius = useTransform(scrollYProgress, [0, 1], [0, 46])
  const ringW = useTransform(scrollYProgress, [0, 0.2, 1], [0, 0, 3])
  const ring = useMotionTemplate`0 0 0 ${ringW}px #141414`
  const reduce = useReducedMotion()

  // The scroll-zoom needs ~1.7 screens of scroll runway, which feels endless on
  // a phone. Enable it only on desktop (lg+); on mobile the hero is a single-
  // screen static card with a soft fade-in, so scrolling past it is instant.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const zoom = isDesktop && !reduce

  // Desktop drives the frame with scroll MotionValues; mobile gets a plain
  // fade-in (mixing style-scale with animate-scale would conflict, so we split).
  const cardMotion = zoom
    ? { style: { scale, borderRadius: radius, boxShadow: ring } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }

  const go = (topic: string) => router.push(`/builder?topic=${encodeURIComponent(topic)}`)

  return (
    <section ref={ref} className={`relative overflow-x-clip ${zoom ? 'h-[168vh]' : ''}`} aria-label="Intro">
      <div className={`flex items-center justify-center overflow-hidden px-2 sm:px-4 ${zoom ? 'sticky top-0 h-[100svh]' : 'h-[90svh]'}`}>
        <motion.div
          {...cardMotion}
          className={`relative w-full h-[90svh] bg-yellow overflow-hidden flex items-center justify-center ${zoom ? '' : 'rounded-[32px] ring-2 ring-ink'}`}
        >
          <Spotlight />

          {/* floating illustration cutouts — clipped by the card, hidden on the
              smallest screens so the mobile hero stays clean and un-crowded */}
          <Floaty src="/illustrations/ideas-head.png" alt="" className="hidden md:block w-32 lg:w-44 left-[3%] top-[8%] rotate-3" delay={0.3} />
          <Floaty src="/illustrations/watermelon.png" alt="" className="hidden sm:block w-28 md:w-36 lg:w-48 right-[3%] top-[10%] rotate-6" delay={0.6} />
          <Floaty src="/illustrations/skater.png" alt="" className="hidden sm:block w-28 md:w-40 lg:w-52 left-[2%] bottom-[4%] -rotate-6" delay={0} />
          <Floaty src="/illustrations/phone-girl.png" alt="" className="hidden md:block w-32 lg:w-44 right-[4%] bottom-[5%] -rotate-3" delay={1.1} />

          {/* center content — extra top padding so the badge clears the nav at rest */}
          <div className="relative z-10 text-center px-5 max-w-3xl pt-20 sm:pt-16 lg:pt-12 pb-8">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="chip bg-white/90 backdrop-blur mb-5 shadow-hard-sm"
            >
              <Sparkles className="w-4 h-4 text-biz-pink" aria-hidden="true" />
              {IDEAS.length}+ ideas · 7-part roadmaps · free
            </motion.span>

            <h1
              className="text-ink mb-4 font-display font-bold leading-[0.92] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2.5rem, 7.5vw, 5.25rem)' }}
              aria-label="Find the biz hiding in plain sight"
            >
              <span aria-hidden="true">
                <span className="block">Find the biz</span>
                <span className="relative inline-block my-0.5">
                  <RotatingWord
                    words={['hiding', 'waiting', 'growing', 'thriving']}
                    className="text-biz-pink"
                  />
                  <Squiggle />
                </span>
                <span className="block">in plain sight</span>
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl font-medium text-ink/80 max-w-xl mx-auto mb-5">
              Type any business and get a complete, fact-checked, India-ready roadmap — registration, licenses, fees in ₹, suppliers, market and timeline. Powered by Gemini.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()) }}
              className="relative max-w-lg mx-auto mb-3"
              role="search"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/60" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What business do you want to start?"
                aria-label="Enter a business idea to build a roadmap"
                className="w-full pl-12 pr-32 sm:pr-36 py-3.5 rounded-full border-2 border-ink bg-white text-[15px] font-medium shadow-hard focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 hover:-translate-x-0.5 transition-transform">
                Build roadmap
              </button>
            </form>

            {/* example prompts — show what to type AND what the tool does */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5 max-w-xl mx-auto">
              <span className="text-sm font-semibold text-ink/55">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => go(ex)}
                  className="rounded-full border-2 border-ink/80 bg-white/70 backdrop-blur px-3 py-1 text-xs sm:text-sm font-semibold hover:bg-white hover:-translate-y-0.5 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <MagneticButton>
                <Link href="/builder" className="btn-primary px-7 py-3.5"><Compass className="w-4 h-4" /> Build a roadmap</Link>
              </MagneticButton>
              <MagneticButton>
                <Link href="/library" className="btn-secondary px-7 py-3.5"><Library className="w-4 h-4" /> Browse ideas</Link>
              </MagneticButton>
            </div>

            {/* compact 3-step mechanic — lands before anyone scrolls */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold text-ink/70">
              <span className="inline-flex items-center gap-1.5"><Search className="w-4 h-4" aria-hidden="true" /> Type a business</span>
              <span aria-hidden="true" className="text-ink/40">→</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4" aria-hidden="true" /> Gemini researches</span>
              <span aria-hidden="true" className="text-ink/40">→</span>
              <span className="inline-flex items-center gap-1.5"><Map className="w-4 h-4" aria-hidden="true" /> 7-part plan in ~10s</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Hand-drawn marker underline that draws itself in beneath the rotating word.
function Squiggle() {
  const reduce = useReducedMotion()
  return (
    <svg
      className="absolute left-0 -bottom-[0.12em] w-full h-[0.28em] overflow-visible pointer-events-none"
      viewBox="0 0 200 20"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M4 13 C 40 4, 70 4, 100 11 S 165 18, 196 8"
        fill="none"
        stroke="#141414"
        strokeWidth={7}
        strokeLinecap="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
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
