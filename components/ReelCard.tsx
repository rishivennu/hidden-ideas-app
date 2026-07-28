'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, Clock } from 'lucide-react'
import { cardVariants, cardTransition, hoverCard, tapCard } from '@/lib/motion'
import type { Reel } from '@/lib/supabaseClient'

interface ReelCardProps {
  reel: Reel
  index?: number
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `0:${s.toString().padStart(2, '0')}`
}

export default function ReelCard({ reel, index = 0 }: ReelCardProps) {
  return (
    <motion.article
      variants={cardVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-40px' }}
      transition={cardTransition(index)}
      whileHover={hoverCard}
      whileTap={tapCard}
      className="reel-card"
      aria-label={`View roadmaps for: ${reel.title}`}
    >
      <Link href={`/reels/${reel.slug}`} className="block" tabIndex={0}>
        {/* Thumbnail */}
        <div className="relative aspect-9-16 overflow-hidden bg-bg-200">
          {reel.thumbnail_url ? (
            <Image
              src={reel.thumbnail_url}
              alt={`Thumbnail for ${reel.title}`}
              fill
              className="object-cover transition-transform duration-[680ms] group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent-muted to-bg-300 flex items-center justify-center">
              <Play className="w-10 h-10 text-accent opacity-60" aria-hidden="true" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 thumbnail-overlay pointer-events-none" aria-hidden="true" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-240">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-black ml-0.5" aria-hidden="true" />
            </div>
          </div>

          {/* Duration badge */}
          {reel.duration_seconds && (
            <div className="absolute bottom-3 right-3 glass-card px-2 py-1 flex items-center gap-1 text-white text-xs font-medium"
                 style={{ borderRadius: 8 }}>
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>{formatDuration(reel.duration_seconds)}</span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4">
          <h3 className="font-semibold text-[15px] leading-snug mb-1 line-clamp-2">{reel.title}</h3>
          {reel.description && (
            <p className="text-sm text-muted line-clamp-2">{reel.description}</p>
          )}
          <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-accent">
            View Roadmaps
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
