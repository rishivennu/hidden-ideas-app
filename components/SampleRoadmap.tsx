import Link from 'next/link'
import {
  ScrollText, BadgeCheck, IndianRupee, Store, TrendingUp, CalendarClock,
  ShieldAlert, Compass, ArrowUpRight, Circle,
} from 'lucide-react'
import Reveal from './Reveal'
import { indiamartUrl } from '@/lib/roadmapAI'

// A hand-crafted, static preview of a REAL generated roadmap. Its job is to
// show the product's output at a glance — the seven sections filled in — so a
// first-time visitor understands the core idea without reading body copy.
const SECTIONS = [
  { icon: ScrollText, color: '#8FD3FF', title: 'Registration', body: 'Register as a Sole Proprietorship or Pvt Ltd, then get PAN and Udyam (MSME) registration.' },
  { icon: BadgeCheck, color: '#FF5CA8', title: 'Licenses & permissions', body: 'FSSAI food licence, GST registration, local trade licence and a fire safety NOC.' },
  { icon: IndianRupee, color: '#2FB457', title: 'Charges & fees', body: 'FSSAI ₹2,000 · Trade licence ₹5,000 · Kitchen setup ₹1.5L–₹4L · GST free.' },
  { icon: TrendingUp, color: '#7B6EF6', title: 'Market & competitors', body: 'Online food delivery is growing ~18%/yr. Win on a sharp cuisine niche and tight ops.' },
  { icon: CalendarClock, color: '#FF6A2B', title: 'Estimated timeline', body: 'Weeks 1–4 setup · Weeks 5–8 launch on Swiggy & Zomato · Month 3+ scale the menu.' },
  { icon: ShieldAlert, color: '#FFE111', title: 'Challenges & solutions', body: 'Thin margins → optimise the menu. Delivery dependency → build direct WhatsApp orders.' },
]

export default function SampleRoadmap() {
  return (
    <section aria-labelledby="sample-heading" className="bg-paper border-t-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal className="text-center mb-10">
          <span className="chip bg-yellow mb-4"><Compass className="w-4 h-4" aria-hidden="true" /> See a real roadmap</span>
          <h2 id="sample-heading" className="text-title">This is what you get in ~10 seconds</h2>
          <p className="text-muted mt-3 max-w-xl mx-auto font-medium">
            One search turns into a complete, India-ready launch plan. Here's a real one for a cloud kitchen.
          </p>
        </Reveal>

        <Reveal>
          <div className="biz-card overflow-hidden">
            {/* faux app top bar — signals "this is the output screen" */}
            <div className="flex items-center gap-2 border-b-2 border-ink px-5 py-3 bg-bg-200">
              <Circle className="w-3 h-3 fill-biz-pink text-biz-pink" aria-hidden="true" />
              <Circle className="w-3 h-3 fill-yellow text-yellow" aria-hidden="true" />
              <Circle className="w-3 h-3 fill-biz-green text-biz-green" aria-hidden="true" />
              <span className="ml-3 text-sm font-semibold text-ink/60 truncate">biz · roadmap · cloud kitchen</span>
            </div>

            <div className="p-6 sm:p-8">
              {/* roadmap header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl">Cloud Kitchen</h3>
                  <p className="text-sm text-muted mt-1">Delivery-only food business · India</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="chip bg-white text-xs">⏱ ~3 months</span>
                  <span className="chip bg-white text-xs">₹2L–₹5L to start</span>
                  <span className="chip bg-biz-green text-white text-xs">Beginner friendly</span>
                </div>
              </div>

              {/* the seven sections */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SECTIONS.map((s) => (
                  <div key={s.title} className="rounded-20 border-2 border-ink p-4 bg-white">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center shrink-0" style={{ backgroundColor: s.color }}>
                        <s.icon className="w-4 h-4 text-ink" aria-hidden="true" />
                      </span>
                      <h4 className="font-display font-semibold text-[15px] leading-tight">{s.title}</h4>
                    </div>
                    <p className="text-sm text-muted leading-snug">{s.body}</p>
                  </div>
                ))}

                {/* seventh card — suppliers, with a live IndiaMART link */}
                <div className="rounded-20 border-2 border-ink p-4 bg-white sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center shrink-0 bg-biz-sky">
                      <Store className="w-4 h-4 text-ink" aria-hidden="true" />
                    </span>
                    <h4 className="font-display font-semibold text-[15px] leading-tight">Suppliers & manufacturers</h4>
                  </div>
                  <p className="text-sm text-muted leading-snug mb-2">Commercial kitchen equipment, packaging and raw ingredients — sourced from real vendors.</p>
                  <a
                    href={indiamartUrl('commercial kitchen equipment')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                  >
                    Find on IndiaMART <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/builder" className="btn-primary px-7 py-3.5"><Compass className="w-4 h-4" /> Build one for your idea</Link>
                <span className="text-sm text-muted font-medium">Free · downloads as a PDF</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
