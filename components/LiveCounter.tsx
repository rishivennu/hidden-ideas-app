'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Live "who's online" pill. Uses Supabase Realtime Presence — an ephemeral
// channel, so it needs NO database table or migration. Every open tab joins the
// "online-users" channel with a unique key; the count is how many keys are
// present. Renders nothing until it has a confirmed count (also hides silently
// if Supabase isn't configured, so it never shows a broken/zero state).
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
    <span
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-2.5 py-1 shadow-hard-sm select-none"
      aria-label={`${count} ${count === 1 ? 'person' : 'people'} online now`}
      title={`${count} online now`}
    >
      <span className="relative flex w-2 h-2" aria-hidden="true">
        <span className="motion-safe:animate-ping absolute inline-flex w-full h-full rounded-full bg-biz-green opacity-70" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-biz-green" />
      </span>
      <span className="text-xs font-bold tabular-nums text-ink">{count}</span>
      <span className="hidden sm:inline text-xs font-semibold text-ink/55">online</span>
    </span>
  )
}
