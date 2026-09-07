/**
 * Helpers for routing video URLs through the right player.
 *
 * Instagram reel URLs cannot be played by a <video> element (Instagram page, not
 * a media stream). Direct mp4 URLs (Supabase Storage, etc.) play natively.
 *
 * The detail page uses an <iframe> for Instagram reels — this is Instagram's
 * official embed and handles auth/playback internally.
 * The grid card shows a poster image / gradient with a link to the detail page.
 */

const IG_URL_RE = /instagram\.com/i
const IG_CODE_RE = /instagram\.com\/(?:[^/]+\/)?(?:reel|p)\/([A-Za-z0-9_-]+)/

export function isInstagramUrl(url: string | null | undefined): boolean {
  return !!url && IG_URL_RE.test(url)
}

/** Extract the shortcode from any Instagram reel/post URL. */
export function shortcodeFrom(url: string): string | null {
  const m = url.match(IG_CODE_RE)
  return m ? m[1] : null
}

/** Returns the Instagram embed iframe src for a reel URL. */
export function toEmbedUrl(url: string): string | null {
  const code = shortcodeFrom(url)
  return code ? `https://www.instagram.com/reel/${code}/embed/` : null
}

/**
 * Not used for Instagram (handled as iframe above).
 * For direct mp4 URLs, returns the URL unchanged.
 */
export function toPlayableSrc(url: string | null | undefined): string | null {
  if (!url) return null
  if (isInstagramUrl(url)) return null   // <-- grid card skips video; detail uses iframe
  return url
}
