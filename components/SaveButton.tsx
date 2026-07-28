'use client'

import { Heart } from 'lucide-react'
import { useSaved } from '@/lib/useSaved'

// Heart toggle used on idea cards + detail page. Stops click/navigation since
// cards are wrapped in a Link.
export default function SaveButton({ slug, className = '' }: { slug: string; className?: string }) {
  const { isSaved, toggle, ready } = useSaved()
  const active = ready && isSaved(slug)

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(slug) }}
      aria-pressed={active}
      aria-label={active ? 'Remove from saved' : 'Save this idea'}
      title={active ? 'Saved — click to remove' : 'Save for later'}
      className={`grid place-items-center w-9 h-9 rounded-full bg-white border-2 border-ink shadow-hard-sm transition-all hover:-translate-y-0.5 active:translate-y-0 ${className}`}
    >
      <Heart className={`w-4 h-4 transition-all ${active ? 'fill-biz-pink text-biz-pink scale-110' : 'text-ink'}`} aria-hidden="true" />
    </button>
  )
}
