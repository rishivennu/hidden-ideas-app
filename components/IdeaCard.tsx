'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight } from 'lucide-react'
import type { Idea } from '@/lib/demoData'
import { cardVariants, cardTransition } from '@/lib/motion'
import SaveButton from './SaveButton'

// Each category gets a bright panel color + a matching illustration sticker.
const CATEGORY_STYLE: Record<string, { bg: string; art: string }> = {
  'E-commerce': { bg: '#8FD3FF', art: '/illustrations/phone-girl.png' },
  'Content': { bg: '#7B6EF6', art: '/illustrations/dj.png' },
  'Digital Products': { bg: '#2FB457', art: '/illustrations/ideas-head.png' },
  'Local Services': { bg: '#FF5CA8', art: '/illustrations/couple.png' },
  'Automation': { bg: '#FFE111', art: '/illustrations/thinking.png' },
  'Real Estate': { bg: '#FF6A2B', art: '/illustrations/crosswalk-cat.png' },
  'Finance': { bg: '#2FB457', art: '/illustrations/trio.png' },
}

export default function IdeaCard({ idea, index = 0 }: { idea: Idea; index?: number }) {
  const style = CATEGORY_STYLE[idea.category] ?? { bg: '#FFE111', art: '/illustrations/skater.png' }
  return (
    <motion.div variants={cardVariants} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }} transition={cardTransition(index)}>
      <Link href={`/ideas/${idea.slug}`} className="group block h-full">
        <div className="biz-card h-full flex flex-col overflow-hidden transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
          {/* colored header with illustration sticker */}
          <div className="relative h-28 flex items-center px-5 overflow-hidden border-b-2 border-ink" style={{ backgroundColor: style.bg }}>
            <span className="chip bg-white text-xs !py-0.5">{idea.category}</span>
            <img loading="lazy" decoding="async" src={style.art} alt="" aria-hidden="true" className="absolute -right-2 -bottom-4 h-32 w-auto object-contain drop-shadow-[2px_2px_0_rgba(20,20,20,0.2)] group-hover:scale-105 transition-transform" />
          </div>

          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-display font-semibold text-xl leading-snug">{idea.title}</h3>
              <SaveButton slug={idea.slug} className="shrink-0 -mt-0.5" />
            </div>
            <p className="text-sm text-muted mb-4 flex-1">{idea.tagline}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="chip !border-ink text-xs !py-0.5 bg-yellow">
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> {idea.monthlyPotential}/mo
              </span>
              <span className="chip text-xs !py-0.5">Cost {idea.startupCost}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-ink/15">
              <span className="text-xs font-semibold text-muted">{idea.roadmaps.length} roadmap{idea.roadmaps.length > 1 ? 's' : ''}</span>
              <span className="inline-flex items-center gap-1 text-sm font-bold">
                Explore <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
