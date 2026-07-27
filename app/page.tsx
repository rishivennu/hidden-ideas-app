import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Compass, Library, ArrowRight, Sparkles, Search, Download, Rocket,
  BadgeIndianRupee, ShieldCheck, Bot, Map, ChevronRight,
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import IdeaCard from '@/components/IdeaCard'
import InfoMetrics from '@/components/InfoMetrics'
import Reveal from '@/components/Reveal'
import TypingRotator from '@/components/TypingRotator'
import { IDEAS, CATEGORIES } from '@/lib/demoData'

export const metadata: Metadata = {
  title: 'Unlock Hidden Business Ideas',
  description: 'A living library of hidden business ideas with downloadable roadmaps and a smart research bot. Real ₹ numbers, no subscription.',
}

const STEPS = [
  { icon: Search, title: 'Discover', text: 'Browse a curated library of under-the-radar business ideas — each with real ₹ startup costs and monthly potential.' },
  { icon: Download, title: 'Download', text: 'Grab the exact step-by-step roadmap you want as a file. No subscription, no paywall — just the plan.' },
  { icon: Rocket, title: 'Build', text: 'Follow the timeline, hit each deliverable, and launch your passive-income stream faster.' },
]

const WHY = [
  { icon: BadgeIndianRupee, title: 'Real ₹ numbers', text: 'Every idea shows startup cost and monthly potential in rupees — no vague hype.' },
  { icon: ShieldCheck, title: 'No subscription', text: 'Download any roadmap for free. You keep the file. No recurring charges, ever.' },
  { icon: Bot, title: 'Smart research bot', text: 'Search any topic and our bot pulls organized insights from across the web.' },
  { icon: Map, title: 'Actionable roadmaps', text: 'Not fluff — dated steps with clear deliverables you can actually execute.' },
]

const FAQ = [
  { q: 'Do I need to pay or subscribe?', a: 'No. The full library and every roadmap download is free. You only sign in if you want admin/creator access.' },
  { q: 'What exactly do I download?', a: 'A clean, formatted roadmap file with the timeline, estimated cost in ₹, difficulty, and every step with its deliverable. You can also save it as a PDF.' },
  { q: 'How does the research bot work?', a: 'Type any topic on the Explore page. The bot matches ideas in our library and pulls an overview plus related results from the web, organized in one view.' },
  { q: 'Are these ideas realistic for India?', a: 'Yes — all costs and earning potential are shown in rupees, and the ideas are chosen to be low-cost and quick to test.' },
]

export default function HomePage() {
  const featured = IDEAS.slice(0, 6)
  const rotatorWords = IDEAS.map((i) => i.title)
  const cats = CATEGORIES.filter((c) => c !== 'All')

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-28 overflow-hidden">

        {/* ── Hero ─────────────────────────────────────── */}
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center pt-8 pb-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full glass-card !shadow-none px-4 py-1.5 mb-6 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
              <span className="text-muted">Now exploring:</span>
              <span className="text-accent font-semibold min-w-[120px] text-left">
                <TypingRotator words={rotatorWords} />
              </span>
            </div>
            <h1 className="text-hero mb-5">Find your next<br /><span className="text-accent">passive income</span> idea</h1>
            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-9">
              Browse a curated library of under-the-radar business ideas. Download the exact roadmap you want — no subscription — and research any topic with our smart bot.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/library" className="btn-primary px-7 py-3.5"><Library className="w-4 h-4" /> Browse the library</Link>
              <Link href="/explore" className="btn-secondary px-7 py-3.5"><Compass className="w-4 h-4" /> Try the research bot</Link>
            </div>
          </div>
        </section>

        {/* ── Metrics ──────────────────────────────────── */}
        <Reveal><InfoMetrics /></Reveal>

        {/* ── How it works ─────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16" aria-labelledby="how-heading">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="how-heading" className="text-title">How it works</h2>
            <p className="text-muted mt-2">From curiosity to launch in three steps.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <div className="glass-card h-full p-7 relative">
                  <span className="absolute top-6 right-6 text-5xl font-bold text-black/5 select-none">{i + 1}</span>
                  <div className="w-11 h-11 rounded-14 bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Featured ideas (redesigned) ──────────────── */}
        <section id="ideas" className="max-w-7xl mx-auto px-4 sm:px-6 py-8" aria-labelledby="featured-heading">
          <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 rounded-full px-3 py-1 mb-3">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Hand-picked
              </span>
              <h2 id="featured-heading" className="text-title">Featured ideas</h2>
              <p className="text-muted text-sm mt-1">Ready to build — each with roadmaps and real ₹ numbers.</p>
            </div>
            <Link href="/library" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:gap-2 transition-all">
              View all {IDEAS.length} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((idea, i) => <IdeaCard key={idea.slug} idea={idea} index={i} />)}
          </div>
        </section>

        {/* ── Browse by category ───────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16" aria-labelledby="cat-heading">
          <Reveal className="mb-8">
            <h2 id="cat-heading" className="text-title">Browse by category</h2>
            <p className="text-muted text-sm mt-1">Jump straight to the space you care about.</p>
          </Reveal>
          <Reveal className="flex flex-wrap gap-3">
            {cats.map((c) => (
              <Link key={c} href="/library" className="group glass-card !shadow-none hover:shadow-card px-5 py-3 inline-flex items-center gap-2 transition-all hover:-translate-y-0.5">
                <span className="font-medium text-sm">{c}</span>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
              </Link>
            ))}
          </Reveal>
        </section>

        {/* ── Research bot teaser ──────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Reveal>
            <div className="glass-card overflow-hidden relative p-8 sm:p-12">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-accent/20 to-fuchsia-400/10 blur-3xl" />
              <div className="relative max-w-2xl">
                <div className="w-11 h-11 rounded-14 bg-accent/10 text-accent flex items-center justify-center mb-5">
                  <Bot className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="text-title mb-3">Research any idea with the smart bot</h2>
                <p className="text-muted mb-6">
                  Type a topic and the bot fetches similar ideas from our library, a clear overview, and related results from around the web — organized in one clean view. No more 20 open tabs.
                </p>
                <Link href="/explore" className="btn-primary px-6 py-3"><Search className="w-4 h-4" /> Open the research bot</Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Why Hidden Ideas ─────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16" aria-labelledby="why-heading">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="why-heading" className="text-title">Why Hidden Ideas</h2>
            <p className="text-muted mt-2">Built to get you from idea to income — without the noise.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08}>
                <div className="glass-card h-full p-6">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <w.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{w.title}</h3>
                  <p className="text-sm text-muted">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16" aria-labelledby="faq-heading">
          <Reveal className="text-center mb-10">
            <h2 id="faq-heading" className="text-title">Questions, answered</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.06}>
                <details className="glass-card group p-5 [&_summary]:cursor-pointer">
                  <summary className="flex items-center justify-between font-medium list-none">
                    {f.q}
                    <ChevronRight className="w-5 h-5 text-muted group-open:rotate-90 transition-transform shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="text-sm text-muted mt-3">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl px-8 py-14 sm:py-20 text-center text-white bg-gradient-to-br from-accent via-blue-600 to-fuchsia-600">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%)]" />
              <div className="relative">
                <h2 className="text-title text-white mb-4">Your next idea is hiding in the library</h2>
                <p className="text-white/85 max-w-xl mx-auto mb-8">Start browsing {IDEAS.length} curated ideas and download the roadmap that fits you — free.</p>
                <Link href="/library" className="inline-flex items-center gap-2 bg-white text-accent font-semibold rounded-full px-7 py-3.5 hover:-translate-y-0.5 transition-transform">
                  <Library className="w-4 h-4" /> Explore the library
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
