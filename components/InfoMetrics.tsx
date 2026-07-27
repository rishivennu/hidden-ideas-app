'use client'

import { Lightbulb, Map, TrendingUp, BadgeIndianRupee } from 'lucide-react'
import CountUp from './CountUp'
import { IDEAS } from '@/lib/demoData'

const roadmapCount = IDEAS.reduce((n, i) => n + i.roadmaps.length, 0)

const METRICS = [
  { icon: Lightbulb, value: IDEAS.length, suffix: '', label: 'Hidden ideas', sub: 'curated & growing' },
  { icon: Map, value: roadmapCount, suffix: '', label: 'Step-by-step roadmaps', sub: 'free to download' },
  { icon: TrendingUp, value: 12, prefix: '₹', suffix: 'L', label: 'Top monthly potential', sub: 'per idea, at scale' },
  { icon: BadgeIndianRupee, value: 0, prefix: '₹', label: 'Subscription cost', sub: 'no paywall, ever' },
]

export default function InfoMetrics() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className="sr-only">Platform metrics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <div key={m.label} className="glass-card p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-accent/5 blur-xl" aria-hidden="true" />
            <m.icon className="w-5 h-5 text-accent mb-3" aria-hidden="true" />
            <p className="text-3xl sm:text-4xl font-bold tracking-tight">
              <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} duration={1.2 + i * 0.15} />
            </p>
            <p className="font-medium text-sm mt-1">{m.label}</p>
            <p className="text-xs text-muted mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
