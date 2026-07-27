'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight } from 'lucide-react'
import type { Idea } from '@/lib/demoData'
import { cardVariants, cardTransition } from '@/lib/motion'

const CATEGORY_GRADIENTS: Record<string, string> = {
  'E-commerce': 'from-blue-500/15 to-cyan-400/10',
  'Content': 'from-violet-500/15 to-fuchsia-400/10',
  'Digital Products': 'from-emerald-500/15 to-teal-400/10',
  'Local Services': 'from-amber-500/15 to-orange-400/10',
  'Automation': 'from-sky-500/15 to-indigo-400/10',
  'Real Estate': 'from-rose-500/15 to-pink-400/10',
  'Finance': 'from-green-500/15 to-lime-400/10',
}

export default function IdeaCard({ idea, index = 0 }: { idea: Idea; index?: number }) {
  const grad = CATEGORY_GRADIENTS[idea.category] ?? 'from-slate-500/10 to-slate-300/10'
  return (
    <motion.div variants={cardVariants} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }} transition={cardTransition(index)}>
      <Link href={`/ideas/${idea.slug}`} className="group block h-full">
        <div className="glass-card h-full p-6 flex flex-col transition-all group-hover:-translate-y-1 group-hover:shadow-card-hover">
          <div className={`rounded-14 bg-gradient-to-br ${grad} px-3 py-2 mb-4 flex items-center justify-between`}>
            <span className="text-xs font-semibold text-black/70">{idea.category}</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-black/60">
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> {idea.monthlyPotential}/mo
            </span>
          </div>

          <h3 className="font-semibold text-lg leading-snug mb-1 group-hover:text-accent transition-colors">{idea.title}</h3>
          <p className="text-sm text-muted mb-4 flex-1">{idea.tagline}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Metric label="Passive" value={`${'●'.repeat(idea.passiveScore)}${'○'.repeat(5 - idea.passiveScore)}`} />
            <Metric label="Cost" value={idea.startupCost} />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-black/5">
            <span className="text-xs text-muted">{idea.roadmaps.length} roadmap{idea.roadmaps.length > 1 ? 's' : ''}</span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
              Explore <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-bg-200 rounded-full px-2.5 py-1">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-black/80">{value}</span>
    </span>
  )
}
