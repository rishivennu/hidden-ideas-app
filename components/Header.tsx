'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Compass, Library, Send, Heart, Film, Wand2 } from 'lucide-react'
import ScrollProgress from './ScrollProgress'
import { useSaved } from '@/lib/savedStore'

const NAV = [
  { href: '/library', label: 'Library', icon: Library },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/builder', label: 'Builder', icon: Wand2 },
  { href: '/reels', label: 'Reels', icon: Film },
  { href: '/submit', label: 'Submit', icon: Send },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { count } = useSaved()

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <ScrollProgress />
      <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4 pt-3 sm:pt-4" role="banner">
        {/* White pill reads crisply over every background (incl. the yellow hero);
            ink border + hard shadow keep it in the card family. Width stays fixed
            so scroll only nudges padding/shadow — no jumpy reflow. */}
        <nav
          aria-label="Primary"
          className={`mx-auto max-w-5xl flex items-center justify-between gap-3 rounded-full bg-white border-2 border-ink transition-[padding,box-shadow] duration-300 ${
            scrolled ? 'pl-4 pr-2 py-1.5 shadow-hard-sm' : 'pl-5 pr-2.5 py-2.5 shadow-hard'
          }`}
        >
          <Link href="/" aria-label="biz — home" className="shrink-0 flex items-center">
            <img src="/illustrations/logo-mark.png" alt="biz" className={`w-auto object-contain transition-[height] duration-300 ${scrolled ? 'h-6' : 'h-7'}`} />
          </Link>

          {/* Desktop nav (lg+) — tablets fall back to the clean menu below */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive(href) ? 'bg-ink text-white' : 'text-ink hover:bg-yellow'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/library?view=saved"
              aria-label={`Saved ideas${count ? ` (${count})` : ''}`}
              className="relative w-9 h-9 rounded-full border-2 border-ink bg-white flex items-center justify-center hover:bg-yellow transition-colors"
            >
              <Heart className="w-4 h-4 text-ink" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-biz-pink text-white text-[10px] font-bold border border-ink flex items-center justify-center">{count}</span>
              )}
            </Link>
            <Link
              href="/builder"
              className="px-5 py-2 rounded-full text-sm font-bold bg-ink text-white border-2 border-ink shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard transition-all"
            >
              Start free
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`lg:hidden rounded-full bg-white border-2 border-ink flex items-center justify-center transition-all ${scrolled ? 'w-9 h-9' : 'w-10 h-10'}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen
                ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-5 h-5" aria-hidden="true" /></motion.span>
                : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" aria-hidden="true" /></motion.span>}
            </AnimatePresence>
          </button>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden max-w-5xl mx-auto mt-2 rounded-28 bg-white border-2 border-ink shadow-hard p-2 origin-top"
            >
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} aria-current={isActive(href) ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${isActive(href) ? 'bg-ink text-white' : 'text-ink hover:bg-yellow'}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" /> {label}
                </Link>
              ))}
              <Link href="/library?view=saved" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-ink hover:bg-yellow transition-colors">
                <Heart className="w-4 h-4" aria-hidden="true" /> Saved {count > 0 && `(${count})`}
              </Link>
              <Link href="/builder" className="flex items-center justify-center gap-2 px-4 py-3 mt-1 rounded-2xl text-sm font-bold bg-ink text-white border-2 border-ink">
                <Wand2 className="w-4 h-4" aria-hidden="true" /> Start free
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
