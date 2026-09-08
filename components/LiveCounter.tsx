'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Fixed bottom-left pill showing live concurrent visitors using Supabase
// Realtime Presence — ephemeral, no DB table or migration needed. Each open
// tab joins the "online-users" channel with a unique key; the count is the
// number of active keys. Renders nothing until connected (also hides silently
// when Supabase is not configured, so it never shows a broken zero state).
export default function LiveCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const key = Math.random().toString(36).slice(2)
    const channel = supabase.channel('online-users', { config: { presence: { key } } })
    channel
      .on('presence', { event: 'sync' }, () => {
        const n = Object.keys(channel.presenceState()).length
        setCount(n > 0 ? n : 1)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ at: Date.now() })
      })
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (count === null) return null

  return (
    <div
      // bottom-20 on mobile so it clears the StickyCTA bar; sm:bottom-4 on desktop
      className="fixed left-3 sm:left-4 bottom-20 sm:bottom-4 z-[85] pointer-events-none select-none"
      aria-label={`${count} ${count === 1 ? 'person' : 'people'} online now`}
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 py-1.5 shadow-hard-sm">
        <span className="relative flex w-2 h-2" aria-hidden="true">
          <span className="motion-safe:animate-ping absolute inline-flex w-full h-full rounded-full bg-biz-green opacity-70" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-biz-green" />
        </span>
        <span className="text-xs font-bold tabular-nums text-ink">{count}</span>
        <span className="text-xs font-semibold text-ink/55">online</span>
      </span>
    </div>
  )
}
