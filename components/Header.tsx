'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Menu, X, Compass, Library, Send } from 'lucide-react'
import ScrollProgress from './ScrollProgress'

const NAV = [
  { href: '/library', label: 'Library', icon: Library },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/submit', label: 'Submit', icon: Send },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <ScrollProgress />
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3 sm:pt-4" role="banner">
      <nav
        aria-label="Primary"
        className={`max-w-4xl mx-auto flex items-center justify-between gap-3 rounded-full pl-4 pr-2 py-2 transition-all duration-300 border ${
          scrolled
            ? 'bg-white/70 backdrop-blur-xl border-white/60 shadow-glass'
            : 'bg-white/40 backdrop-blur-md border-white/40 shadow-[0_2px_16px_rgba(0,0,0,0.04)]'
        }`}
      >
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight shrink-0">
          <span className="w-8 h-8 rounded-full bg-accent/12 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-accent" aria-hidden="true" />
          </span>
          <span className="text-[15px]">Hidden Ideas</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  active ? 'bg-accent text-white shadow-[0_4px_14px_rgba(10,132,255,0.35)]' : 'text-black/70 hover:bg-black/5'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden w-10 h-10 rounded-full bg-black/5 flex items-center justify-center"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden max-w-4xl mx-auto mt-2 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-glass p-2"
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                    active ? 'bg-accent text-white' : 'text-black/80 hover:bg-black/5'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" /> {label}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  )
}
