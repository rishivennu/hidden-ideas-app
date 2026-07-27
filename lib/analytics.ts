// Analytics wrapper — respects DNT and GDPR consent

declare global {
  interface Window { _plausible?: (event: string, opts?: object) => void }
}

function hasDNT(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.doNotTrack === '1' || (window as unknown as Record<string, string>).doNotTrack === '1'
}

function hasConsent(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem('analytics_consent') === 'true'
}

export function trackEvent(name: string, props?: Record<string, string | number>): void {
  if (hasDNT() || !hasConsent()) return
  // Vercel Analytics — auto-injected via @vercel/analytics
  // Additional Plausible / PostHog call here if needed
  if (typeof window !== 'undefined' && window._plausible) {
    window._plausible(name, { props })
  }
}

export function trackReelView(reelSlug: string): void {
  trackEvent('reel_view', { slug: reelSlug })
}

export function trackRoadmapSelect(roadmapId: string): void {
  trackEvent('roadmap_select', { id: roadmapId })
}

export function trackDownload(guideId: string): void {
  trackEvent('guide_download', { id: guideId })
}

export function grantConsent(): void {
  localStorage.setItem('analytics_consent', 'true')
}

export function revokeConsent(): void {
  localStorage.removeItem('analytics_consent')
}
