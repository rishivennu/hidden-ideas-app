"use client"

import { Star } from 'lucide-react'

const QUOTES = [
  { name: 'Ananya R.', role: 'Side-hustle → ₹40k/mo', text: 'Downloaded a roadmap on a Sunday, had my first customer by the next weekend. The ₹ numbers were spot on.', color: '#FF5CA8' },
  { name: 'Karthik M.', role: 'Vending machines', text: 'I was drowning in 30 open tabs. The research bot pulled it all into one clean view. Saved me a full week.', color: '#8FD3FF' },
  { name: 'Priya S.', role: 'Digital products', text: 'No subscription, no paywall, and the steps are actually dated. Finally a resource that respects my time.', color: '#2FB457' },
  { name: 'Rohan D.', role: 'Local services', text: "Found an idea I'd literally never have thought of. It was hiding in plain sight, just like they say.", color: '#7B6EF6' },
  { name: 'Meera T.', role: 'Content creator', text: 'The weekly idea email is the one newsletter I actually open. Small, sharp, and always usable.', color: '#FF6A2B' },
  { name: 'Aditya V.', role: 'E-commerce', text: 'Went from "someday" to a live store in three weeks following one roadmap. Zero fluff.', color: '#FFE111' },
]

function Card({ q }: { q: (typeof QUOTES)[number] }) {
  return (
    <figure className="biz-card shrink-0 w-[300px] sm:w-[360px] p-6 mx-3 whitespace-normal">
      <div className="flex gap-0.5 mb-3" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-ink text-ink" aria-hidden="true" />
        ))}
      </div>
      <blockquote className="text-[15px] font-medium text-ink leading-relaxed mb-5">&ldquo;{q.text}&rdquo;</blockquote>
      <figcaption className="flex items-center gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-full border-2 border-ink font-display font-bold text-ink shrink-0" style={{ backgroundColor: q.color }}>
          {q.name[0]}
        </span>
        <span>
          <span className="block font-display font-bold text-ink text-sm leading-tight">{q.name}</span>
          <span className="block text-xs text-muted">{q.role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

export default function Testimonials() {
  const row = [...QUOTES, ...QUOTES]
  return (
    <div className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <span className="chip bg-yellow mb-4">Loved by builders</span>
        <h2 id="testi-heading" className="text-title max-w-xl">People are already building from the shadows</h2>
      </div>
      <div className="group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex shrink-0 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {row.map((q, i) => <Card key={`a-${i}`} q={q} />)}
        </div>
        <div className="flex shrink-0 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none" aria-hidden="true">
          {row.map((q, i) => <Card key={`b-${i}`} q={q} />)}
        </div>
      </div>
    </div>
  )
}
