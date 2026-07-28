'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'
import RoadmapCard from '@/components/RoadmapCard'
import ModalAuth from '@/components/ModalAuth'
import { supabase } from '@/lib/supabaseClient'
import { trackDownload, trackReelView } from '@/lib/analytics'
import { pageVariants, pageTransition, staggerContainer, fadeUpItem } from '@/lib/motion'
import type { Reel, Guide, Roadmap } from '@/lib/supabaseClient'
import { useEffect } from 'react'

interface ReelDetailClientProps {
  reel: Reel
  guide: (Guide & { roadmaps: Roadmap[] }) | null
}

export default function ReelDetailClient({ reel, guide }: ReelDetailClientProps) {
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const roadmaps: Roadmap[] = guide?.roadmaps ?? []

  useEffect(() => {
    trackReelView(reel.slug)
  }, [reel.slug])

  async function handleDownload() {
    if (!guide) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setShowAuth(true); return }
    await doDownload(guide.id)
  }

  async function doDownload(guideId: string) {
    setDownloading(true)
    try {
      const res = await fetch('/api/supabase/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      })
      if (!res.ok) throw new Error('Failed to get download URL')
      const { url } = await res.json()
      trackDownload(guideId)
      window.open(url, '_blank', 'noopener noreferrer')
    } catch (err) {
      console.error(err)
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back nav */}
        <Link href="/#reels" className="inline-flex items-center gap-2 text-sm text-muted hover:text-black transition-colors mb-8 group"
              aria-label="Back to reels">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
          Back to Reels
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 xl:gap-16 items-start">
          {/* Left — Video */}
          <div className="lg:sticky lg:top-24">
            {reel.video_url ? (
              <VideoPlayer
                src={reel.video_url}
                poster={reel.thumbnail_url ?? undefined}
                title={reel.title}
              />
            ) : (
              <div className="aspect-9-16 rounded-20 bg-bg-200 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-muted" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Right — Content */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={fadeUpItem}>
              <h1 className="text-title mb-3">{reel.title}</h1>
              {reel.description && (
                <p className="text-lg text-muted leading-relaxed mb-8">{reel.description}</p>
              )}
            </motion.div>

            {/* Roadmap selector */}
            {roadmaps.length > 0 ? (
              <motion.div variants={fadeUpItem}>
                <h2 className="text-lg font-semibold mb-4">
                  Choose a Roadmap
                </h2>
                <p className="text-sm text-muted mb-5">
                  Pick a roadmap. Build in 30 days.
                </p>
                <div
                  className="space-y-3"
                  role="radiogroup"
                  aria-label="Select a roadmap to build this business"
                >
                  {roadmaps.map((rm) => (
                    <RoadmapCard
                      key={rm.id}
                      roadmap={rm}
                      selected={selectedRoadmap === rm.id}
                      onSelect={() => setSelectedRoadmap(rm.id)}
                      onDownload={handleDownload}
                      downloading={downloading}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div variants={fadeUpItem} className="rounded-20 bg-bg-200 p-8 text-center">
                <p className="text-muted">Roadmaps coming soon for this idea.</p>
              </motion.div>
            )}

            {/* Guide summary */}
            {guide?.summary && (
              <motion.div variants={fadeUpItem} className="mt-8 glass-card p-6">
                <h2 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" aria-hidden="true" />
                  About this Setup Guide
                </h2>
                <p className="text-sm text-muted">{guide.summary}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <ModalAuth
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false)
          if (guide) doDownload(guide.id)
        }}
        title="Sign in to download"
        subtitle="Free account. Instant access to your 10-page setup guide."
      />
    </motion.div>
  )
}
