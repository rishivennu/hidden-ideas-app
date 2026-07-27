'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerContainer, fadeUpItem } from '@/lib/motion'

export default function HeroSection() {
  return (
    <section className="relative min-h-[92svh] flex items-center justify-center overflow-hidden pt-16"
             aria-label="Hero">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent/6 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-200/30 blur-[100px]" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative text-center max-w-4xl mx-auto px-4 sm:px-6"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeUpItem}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/8 text-accent text-sm font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
            New ideas every week
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={fadeUpItem} className="text-hero mb-6">
          Unlock Hidden<br />
          <span className="text-accent">Business Ideas</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p variants={fadeUpItem} className="text-xl sm:text-2xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
          Short reels. Actionable roadmaps.<br className="hidden sm:block" /> Downloadable setup guides.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUpItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/#reels" className="btn-primary px-8 py-4 text-[16px]">
            Browse Reels
          </Link>
          <Link href="/submit" className="btn-secondary px-8 py-4 text-[16px]">
            Submit a Reel
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.p variants={fadeUpItem} className="mt-12 text-sm text-muted">
          Join <strong className="text-black">2,400+</strong> founders discovering their next move.
        </motion.p>
      </motion.div>
    </section>
  )
}
