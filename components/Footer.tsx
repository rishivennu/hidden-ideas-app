import Link from 'next/link'
import { Lightbulb } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-black/8 bg-bg-200 mt-24" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-[17px] mb-2">
              <Lightbulb className="w-5 h-5 text-accent" aria-hidden="true" />
              Hidden Ideas
            </Link>
            <p className="text-sm text-muted max-w-xs">
              A living library of hidden business ideas, roadmaps, and smart research.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/library" className="hover:text-black transition-colors">Library</Link>
            <Link href="/explore" className="hover:text-black transition-colors">Explore</Link>
            <Link href="/submit" className="hover:text-black transition-colors">Submit</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} Hidden Ideas. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
