import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ReelDetailClient from './ReelDetailClient'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: reel } = await supabase
    .from('reels')
    .select('title, description, thumbnail_url, slug')
    .eq('slug', params.slug)
    .single()

  if (!reel) return { title: 'Reel Not Found' }

  return {
    title: reel.title,
    description: reel.description ?? undefined,
    openGraph: {
      title: reel.title,
      description: reel.description ?? '',
      images: reel.thumbnail_url ? [{ url: reel.thumbnail_url }] : [],
      type: 'video.other',
    },
  }
}

export default async function ReelDetailPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()

  const [{ data: reel }, { data: guides }] = await Promise.all([
    supabase.from('reels').select('*').eq('slug', params.slug).eq('published', true).single(),
    supabase.from('guides').select('*, roadmaps(*)').eq('reel_id',
      // subquery — we need the reel id; run after reel fetch below
      (await supabase.from('reels').select('id').eq('slug', params.slug).single()).data?.id ?? ''
    ),
  ])

  if (!reel) notFound()

  const guide = guides?.[0] ?? null

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: reel.title,
    description: reel.description,
    thumbnailUrl: reel.thumbnail_url,
    uploadDate: reel.created_at,
    ...(guide && {
      hasPart: {
        '@type': 'HowTo',
        name: guide.title,
        step: guide.roadmaps?.flatMap((rm: { name: string; steps?: { order: number; title: string; description: string }[] }) =>
          rm.steps?.map((s: { order: number; title: string; description: string }) => ({
            '@type': 'HowToStep',
            position: s.order,
            name: s.title,
            text: s.description,
          })) ?? []
        ),
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-16">
        <ReelDetailClient reel={reel} guide={guide} />
      </main>
      <Footer />
    </>
  )
}
