'use client'

import { motion } from 'framer-motion'

interface Day { date: string; visits: number; downloads: number }

// Dependency-free stacked bar chart for the last N days.
export default function MiniBarChart({ series }: { series: Day[] }) {
  const max = Math.max(1, ...series.map((d) => d.visits + d.downloads))
  return (
    <div>
      <div className="flex items-end gap-1.5 h-40" role="img" aria-label="Daily visits and downloads">
        {series.map((d, i) => {
          const total = d.visits + d.downloads
          const h = (total / max) * 100
          const vPct = total ? (d.visits / total) * 100 : 0
          const label = new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] rounded px-2 py-1 whitespace-nowrap pointer-events-none z-10">
                {label}: {d.visits} visits · {d.downloads} dl
              </div>
              <motion.div
                className="w-full rounded-t-md overflow-hidden bg-accent/15 flex flex-col justify-end"
                initial={{ height: 0 }}
                whileInView={{ height: `${Math.max(h, total ? 4 : 0)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ minHeight: total ? 4 : 0 }}
              >
                <div className="bg-fuchsia-500" style={{ height: `${100 - vPct}%` }} />
                <div className="bg-accent" style={{ height: `${vPct}%` }} />
              </motion.div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent" /> Visits</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-fuchsia-500" /> Downloads</span>
        <span className="ml-auto">Last 14 days</span>
      </div>
    </div>
  )
}
