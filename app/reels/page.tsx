import type { Metadata } from 'next'
import Link from 'next/link'
import { Play, Film } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ReelGrid from '@/components/ReelGrid'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import type { Reel } from '@/lib/supabaseClient'

export const metadata: Metadata = {
  title: 'Reels — watch ideas in 60 seconds',
  description: 'A vertical feed of business ideas explained fast. Tap any reel for its full roadmap.',
}

export const revalidate = 60

async function getReels(): Promise<Reel[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase
      .from('reels')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    return (data as Reel[]) ?? []
  } catch {
    return []
  }
}

export default async function ReelsPage() {
  const reels = await getReels()

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="chip bg-biz-purple text-white mb-3"><Film className="w-4 h-4" /> Reels</span>
              <h1 className="text-title">Ideas in 60 seconds</h1>
              <p className="text-muted mt-1">Swipe through quick idea breakdowns — tap any reel for the full roadmap.</p>
            </div>
            <Link href="/library" className="btn-secondary text-sm px-5 py-2.5">Browse the library</Link>
          </header>

          {reels.length > 0 ? (
            <ReelGrid reels={reels} />
          ) : (
            <div className="text-center py-24 rounded-28 border-2 border-dashed border-ink/25 bg-paper">
              <span className="grid place-items-center w-16 h-16 rounded-full bg-yellow border-2 border-ink mx-auto mb-4">
                <Play className="w-7 h-7 text-ink ml-0.5" aria-hidden="true" />
              </span>
              <p className="font-display font-semibold text-xl">Reels are coming soon</p>
              <p className="text-muted text-sm mt-1 max-w-sm mx-auto">Fresh idea breakdowns drop here every week. In the meantime, dig into the full library.</p>
              <Link href="/library" className="btn-primary px-6 py-3 mt-6 inline-flex">Explore ideas</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
