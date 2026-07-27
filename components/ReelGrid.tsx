'use client'

import { motion } from 'framer-motion'
import ReelCard from './ReelCard'
import { staggerContainer } from '@/lib/motion'
import type { Reel } from '@/lib/supabaseClient'

export default function ReelGrid({ reels }: { reels: Reel[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      role="list"
      aria-label="Business idea reels"
    >
      {reels.map((reel, i) => (
        <div key={reel.id} role="listitem">
          <ReelCard reel={reel} index={i} />
        </div>
      ))}
    </motion.div>
  )
}
