import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-ink bg-ink text-paper mt-0" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <Link href="/" className="inline-flex items-center mb-3" aria-label="biz — home">
              <span className="inline-flex items-center rounded-full bg-yellow border-2 border-yellow px-3 py-1.5">
                <img src="/illustrations/logo-mark.png" alt="biz" className="h-6 w-auto object-contain" />
              </span>
            </Link>
            <p className="text-sm text-paper/70 max-w-xs">
              A living library of under-the-radar business ideas — free roadmaps, real ₹ numbers, and a smart research bot.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <Link href="/library" className="text-paper/80 hover:text-yellow transition-colors">Library</Link>
            <Link href="/explore" className="text-paper/80 hover:text-yellow transition-colors">Explore</Link>
            <Link href="/submit" className="text-paper/80 hover:text-yellow transition-colors">Submit</Link>
            <Link href="/privacy" className="text-paper/80 hover:text-yellow transition-colors">Privacy</Link>
            <Link href="/terms" className="text-paper/80 hover:text-yellow transition-colors">Terms</Link>
          </nav>
        </div>
        <div className="mt-10 pt-6 border-t border-paper/15 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-paper/50">© {new Date().getFullYear()} biz. All rights reserved.</p>
          <p className="text-xs font-bold text-yellow">Find the biz hiding in plain sight.</p>
        </div>
      </div>
    </footer>
  )
}
