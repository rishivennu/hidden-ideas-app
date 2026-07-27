'use client'

import { useSyncExternalStore } from 'react'

// Persists a user's saved/bookmarked idea slugs with NO account needed.
// Source of truth is localStorage; we ALSO mirror to a year-long cookie so a
// returning visitor keeps their saves across sessions/devices on the same
// browser even if localStorage is cleared. Read merges both on load.
const LS_KEY = 'biz:saved'
const COOKIE = 'biz_saved'

let cache: string[] = []
let hydrated = false
const listeners = new Set<() => void>()

function readCookie(): string[] {
  if (typeof document === 'undefined') return []
  const m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'))
  if (!m) return []
  try {
    return JSON.parse(decodeURIComponent(m[1]))
  } catch {
    return []
  }
}

function writeCookie(arr: string[]) {
  if (typeof document === 'undefined') return
  const val = encodeURIComponent(JSON.stringify(arr))
  document.cookie = `${COOKIE}=${val}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  let ls: string[] = []
  try {
    ls = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    ls = []
  }
  const merged = Array.from(new Set([...ls, ...readCookie()]))
  cache = merged
  hydrated = true
  // sync both stores to the merged view
  persist(merged, false)
}

function persist(arr: string[], notify = true) {
  cache = arr
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(arr))
    } catch {
      /* ignore quota */
    }
    writeCookie(arr)
  }
  if (notify) listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  hydrate()
  listeners.add(cb)
  // keep tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_KEY) {
      try {
        cache = JSON.parse(e.newValue || '[]')
      } catch {
        cache = []
      }
      listeners.forEach((l) => l())
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  return cache
}

function getServerSnapshot(): string[] {
  return cache
}

export function toggleSaved(slug: string) {
  hydrate()
  const next = cache.includes(slug) ? cache.filter((s) => s !== slug) : [...cache, slug]
  persist(next)
}

export function useSaved() {
  const saved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    saved,
    count: saved.length,
    isSaved: (slug: string) => saved.includes(slug),
    toggle: toggleSaved,
  }
}
