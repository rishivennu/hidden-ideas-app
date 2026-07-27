'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Fires a lightweight visit event once per page per session. Skips admin.
export default function TrackVisit() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    try {
      const key = `hi_visit_${pathname}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {}
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'visit', path: pathname }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])
  return null
}
