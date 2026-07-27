'use client'

import { useCallback, useEffect, useState } from 'react'

// Persistent "saved ideas" store backed by localStorage so a returning visitor
// sees everything they bookmarked on their last visit — no account needed.
// Syncs live across tabs and across every component via a storage event + a
// same-tab custom event.
const KEY = 'biz:saved'
const EVT = 'biz:saved-changed'

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function write(list: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent(EVT))
  } catch {
    /* storage full / blocked — ignore */
  }
}

export function useSaved() {
  const [saved, setSaved] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setSaved(read())
    setReady(true)
    const sync = () => setSaved(read())
    window.addEventListener('storage', sync)
    window.addEventListener(EVT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(EVT, sync)
    }
  }, [])

  const toggle = useCallback((slug: string) => {
    const cur = read()
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [slug, ...cur]
    write(next)
    setSaved(next)
  }, [])

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved])

  return { saved, isSaved, toggle, ready, count: saved.length }
}
