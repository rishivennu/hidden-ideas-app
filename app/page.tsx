import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Compass, Library, ArrowRight, Search, Download, Rocket,
  BadgeIndianRupee, ShieldCheck, Bot, Map, ChevronRight,
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import IdeaCard from '@/components/IdeaCard'
import InfoMetrics from '@/components/InfoMetrics'
import Reveal from '@/components/Reveal'
import HeroZoom from '@/components/HeroZoom'
import StackSection from '@/components/StackSection'
import WeeklySpotlight from '@/components/WeeklySpotlight'
import Testimonials from '@/components/Testimonials'
import StickyCTA from '@/components/StickyCTA'
import { IDEAS, CATEGORIES } from '@/lib/demoData'

export const metadata: Metadata = {
  title: 'biz — Business ideas hiding in plain sight',
  description: 'A living library of hidden business ideas with downloadable roadmaps, real ₹ numbers and a smart research bot. No subscription.',
}

const STEPS = [
  { icon: Search, title: 'Discover', text: 'Browse under-the-radar business ideas — each with real ₹ startup costs and monthly potential.', color: '#8FD3FF' },
  { icon: Download, title: 'Download', text: 'Grab the exact step-by-step roadmap you want as a file. No subscription, no paywall.', color: '#FF5CA8' },
  { icon: Rocket, title: 'Build', text: 'Follow the timeline, hit each deliverable, and launch your passive-income stream faster.', color: '#2FB457' },
]

const WHY = [
  { icon: BadgeIndianRupee, title: 'Real ₹ numbers', text: 'Startup cost and monthly potential in rupees — no vague hype.' },
  { icon: ShieldCheck, title: 'No subscription', text: 'Download any roadmap free. You keep the file. No recurring charges.' },
  { icon: Bot, title: 'Smart research bot', text: 'Search a topic and the bot pulls organized insights from the web.' },
  { icon: Map, title: 'Actionable roadmaps', text: 'Dated steps with clear deliverables you can actually execute.' },
]

const FAQ = [
  { q: 'Do I need to pay or subscribe?', a: 'No. The full library and every roadmap download is free. You only sign in for admin/creator access.' },
  { q: 'What exactly do I download?', a: 'A clean, formatted roadmap file with the timeline, estimated cost in ₹, difficulty, and every step with its deliverable. You can also save it as a PDF.' },
  { q: 'How does the research bot work?', a: 'Type any topic on the Explore page. The bot matches ideas in our library and pulls an overview plus related web results into one view.' },
  { q: 'Are these ideas realistic for India?', a: 'Yes — costs and earning potential are shown in rupees, and the ideas are chosen to be low-cost and quick to test.' },
]

export default function HomePage() {
  const featured = IDEAS.slice(0, 6)
  // deterministic weekly rotation (ISO-ish week number)
  const now = new Date()
  const weekNum = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 6048e5)
  const weekly = IDEAS[weekNum % IDEAS.length]
  const ART: Record<string, string> = {
    'E-commerce': '/illustrations/phone-girl.png', 'Content': '/illustrations/dj.png',
    'Digital Products': '/illustrations/ideas-head.png', 'Local Services': '/illustrations/couple.png',
    'Automation': '/illustrations/thinking.png', 'Real Estate': '/illustrations/crosswalk-cat.png',
    'Finance': '/illustrations/trio.png',
  }
  const weeklyArt = ART[weekly.category] ?? '/illustrations/skater.png'
  const cats = CATEGORIES.filter((c) => c !== 'All')
  const catColors = ['#8FD3FF', '#FF5CA8', '#2FB457', '#7B6EF6', '#FFE111', '#FF6A2B', '#2FB457']

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>

        <HeroZoom />

        {/* marquee band */}
        <div className="relative z-0 bg-ink text-yellow border-y-2 border-ink py-3 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee font-display font-semibold text-xl">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="flex shrink-0">
                {['HIDDEN IDEAS', 'FREE ROADMAPS', 'REAL ₹ NUMBERS', 'SMART RESEARCH', 'NO SUBSCRIPTION', 'PASSIVE INCOME'].map((t) => (
                  <span key={t} className="mx-6 flex items-center gap-6">{t}<span className="text-biz-pink">✳</span></span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ===== Unmask-on-scroll: stacked sticky layers reveal one by one ===== */}

        {/* Layer 1 — metrics + how it works */}
        <StackSection z={1} bg="#FFFDF5" labelledby="how-heading" first>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
            <Reveal><InfoMetrics /></Reveal>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <Reveal className="mb-10">
              <span className="chip bg-yellow mb-4">How it works</span>
              <h2 id="how-heading" className="text-title max-w-xl">From curiosity to launch in three steps</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.1}>
                  <div className="biz-card h-full p-7 relative">
                    <span className="absolute top-5 right-6 font-display text-6xl font-bold text-ink/10 select-none">{i + 1}</span>
                    <div className="w-12 h-12 rounded-full border-2 border-ink flex items-center justify-center mb-4" style={{ backgroundColor: s.color }}>
                      <s.icon className="w-5 h-5 text-ink" aria-hidden="true" />
                    </div>
                    <h3 className="font-display font-semibold text-xl mb-2">{s.title}</h3>
                    <p className="text-sm text-muted">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </StackSection>

        {/* Layer 2 — featured */}
        <StackSection z={2} bg="#FFFFFF" id="ideas" labelledby="featured-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <span className="chip bg-biz-pink text-white mb-3">Hand-picked</span>
                <h2 id="featured-heading" className="text-title">Featured ideas</h2>
                <p className="text-muted mt-1">Ready to build — each with roadmaps and real ₹ numbers.</p>
              </div>
              <Link href="/library" className="btn-secondary text-sm px-5 py-2.5">View all {IDEAS.length} <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((idea, i) => <IdeaCard key={idea.slug} idea={idea} index={i} />)}
            </div>
          </div>
        </StackSection>

        {/* Layer 3 — idea of the week + email capture */}
        <StackSection z={3} bg="#8FD3FF">
          <WeeklySpotlight idea={weekly} art={weeklyArt} />
        </StackSection>

        {/* Layer 3 — categories + research bot */}
        <StackSection z={4} bg="#FFF6DF" labelledby="cat-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <Reveal className="mb-8">
              <h2 id="cat-heading" className="text-title">Browse by category</h2>
            </Reveal>
            <Reveal className="flex flex-wrap gap-3">
              {cats.map((c, i) => (
                <Link key={c} href="/library" className="group inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-3 font-semibold shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard transition-all" style={{ backgroundColor: catColors[i % catColors.length] }}>
                  {c}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              ))}
            </Reveal>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
            <Reveal>
              <div className="biz-card overflow-hidden relative grid lg:grid-cols-[1fr_auto] items-center gap-8 p-8 sm:p-12" style={{ backgroundColor: '#7B6EF6' }}>
                <div className="relative z-10 max-w-xl text-white">
                  <span className="chip bg-white text-ink mb-5"><Bot className="w-4 h-4" /> Smart bot</span>
                  <h2 className="text-title text-white mb-3">Research any idea in one clean view</h2>
                  <p className="text-white/90 mb-6 font-medium">
                    Type a topic and the bot fetches similar ideas from our library, a clear overview, and related results from around the web — organized, not 20 open tabs.
                  </p>
                  <Link href="/explore" className="btn-yellow px-6 py-3"><Search className="w-4 h-4" /> Open the research bot</Link>
                </div>
                <img src="/illustrations/ideas-head.png" alt="" aria-hidden="true" className="hidden lg:block w-56 justify-self-end drop-shadow-[4px_4px_0_rgba(20,20,20,0.3)]" />
              </div>
            </Reveal>
          </div>
        </StackSection>

        {/* Layer 4 — why biz */}
        <StackSection z={5} bg="#FFFFFF" labelledby="why-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <Reveal className="grid lg:grid-cols-[auto_1fr] items-end gap-6 mb-10">
              <img src="/illustrations/trio.png" alt="Three happy people" className="hidden lg:block w-52 drop-shadow-[4px_4px_0_rgba(20,20,20,0.15)]" />
              <div>
                <span className="chip bg-biz-green text-white mb-4">Why biz</span>
                <h2 id="why-heading" className="text-title">Built to get you from idea to income</h2>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {WHY.map((w, i) => (
                <Reveal key={w.title} delay={i * 0.08}>
                  <div className="biz-card h-full p-6">
                    <div className="w-11 h-11 rounded-full border-2 border-ink bg-yellow flex items-center justify-center mb-4">
                      <w.icon className="w-5 h-5 text-ink" aria-hidden="true" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-1.5">{w.title}</h3>
                    <p className="text-sm text-muted">{w.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </StackSection>

        {/* Social proof — testimonials marquee */}
        <StackSection z={6} bg="#FFF6DF" labelledby="testi-heading">
          <Testimonials />
        </StackSection>

        {/* Layer 5 — FAQ */}
        <StackSection z={7} bg="#FFFDF5" labelledby="faq-heading">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <Reveal className="mb-8"><h2 id="faq-heading" className="text-title text-center">Questions, answered</h2></Reveal>
            <div className="space-y-3">
              {FAQ.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.06}>
                  <details className="biz-card group p-5 [&_summary]:cursor-pointer">
                    <summary className="flex items-center justify-between font-display font-semibold text-lg list-none">
                      {f.q}
                      <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform shrink-0" aria-hidden="true" />
                    </summary>
                    <p className="text-sm text-muted mt-3">{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </StackSection>

        {/* Layer 6 — final CTA (last unmask moment) */}
        <StackSection z={8} bg="#FFFFFF">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <Reveal>
              <div className="biz-card bg-yellow relative overflow-hidden px-8 py-14 sm:py-20 text-center">
                <img src="/illustrations/skater.png" alt="" aria-hidden="true" className="hidden sm:block absolute left-4 bottom-0 w-40 -rotate-6" />
                <img src="/illustrations/watermelon.png" alt="" aria-hidden="true" className="hidden sm:block absolute right-4 top-2 w-36 rotate-6" />
                <div className="relative">
                  <h2 className="text-title mb-4">Your next idea is hiding in the library</h2>
                  <p className="text-ink/80 font-medium max-w-xl mx-auto mb-8">Start browsing {IDEAS.length} curated ideas and download the roadmap that fits you — free.</p>
                  <Link href="/library" className="btn-primary px-8 py-4 text-lg"><Library className="w-5 h-5" /> Explore the library</Link>
                </div>
              </div>
            </Reveal>
          </div>
        </StackSection>

      </main>
      <Footer />
      <StickyCTA />
    </>
  )
}
