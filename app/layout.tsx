import type { Metadata } from 'next'
import { Inter, Fredoka } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import TrackVisit from '@/components/TrackVisit'
import FollowGate from '@/components/FollowGate'
import AuthGate from '@/components/AuthGate'
import LogoReveal from '@/components/LogoReveal'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hidden-ideas.vercel.app'),
  title: {
    default: 'Hidden Ideas — Unlock Hidden Business Ideas',
    template: '%s | Hidden Ideas',
  },
  description: 'Short reels. Actionable roadmaps. Downloadable setup guides. Discover your next business idea.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hidden-ideas.vercel.app',
    siteName: 'Hidden Ideas',
    images: [{ url: '/assets/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@hiddenideas',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fredoka.variable}`}>
      <body>
        {/* Skip navigation — WCAG 2.4.1 */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <LogoReveal />
        <AuthGate>{children}</AuthGate>
        <FollowGate />
        <TrackVisit />
        <Analytics />
      </body>
    </html>
  )
}
