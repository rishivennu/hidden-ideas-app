'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Fires a lightweight visit event once per page per browser session. Skips admin.
// The sessionStorage key is only set after a successful POST so failed requests
// can retry on the next pageload.
export default function TrackVisit() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    const key = `hi_visit_${pathname}`
    try { if (sessionStorage.getItem(key)) return } catch {}
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'visit', path: pathname }),
      keepalive: true,
    }).then(() => {
      try { sessionStorage.setItem(key, '1') } catch {}
    }).catch(() => {})
  }, [pathname])
  return null
}
