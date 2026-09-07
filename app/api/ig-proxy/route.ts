import { NextRequest, NextResponse } from 'next/server'

/**
 * NOTE: Instagram CDN URLs are session-signed and cannot be redirected to the browser.
 * This route is kept for internal diagnostics only. The VideoPlayer uses an iframe embed instead.
 *
 * Server-side proxy that extracts the real CDN video URL from an Instagram reel
 * embed page. The user stores Instagram reel URLs as video_url in Supabase, but
 * a <video> element cannot play an Instagram *web page*. This route:
 *
 *   GET /api/ig-proxy?url=https://www.instagram.com/bizwithrishi/reel/CODE/
 *
 * …fetches the Instagram /reel/CODE/embed/ page (which contains the direct CDN
 * mp4 URL in its JSON), extracts it, and 302-redirects the client to it. The
 * video element then plays the actual CDN mp4.
 *
 * Caching: CDN URLs expire, so we cache the redirect for 30 minutes.
 * Fallback: if extraction fails we fall back to the Instagram embed iframe URL
 * (the client-side code detects a non-mp4 redirect and shows an iframe instead).
 */

// Matches /reel/CODE/ or /p/CODE/ from any instagram.com path.
const SHORTCODE_RE = /instagram\.com\/(?:[^/]+\/)?(?:reel|p)\/([A-Za-z0-9_-]+)/

function shortcodeFrom(url: string): string | null {
  const m = url.match(SHORTCODE_RE)
  return m ? m[1] : null
}

async function fetchEmbedPage(shortcode: string): Promise<string> {
  const url = `https://www.instagram.com/reel/${shortcode}/embed/`
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.instagram.com/',
    },
    // Vercel edge/serverless timeout
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Instagram embed returned ${res.status}`)
  return res.text()
}

function extractMp4(html: string): string | null {
  // Instagram triple-escapes forward slashes in the embed page JSON, so the
  // literal bytes in the HTML are 3 backslash chars followed by one forward slash.
  // Normalise those to single forward slashes before running any URL regex.
  const normalised = html.replace(/(?:[\\]{3})\/(?!\/)/g, '/').replace(/(?:[\\]{3})\//g, '/')

  // Primary: look for the quoted video_url key with the CDN URL
  const primary = normalised.match(/"video_url":"(https:\/\/[^"\\]+\.mp4[^"\\]*)"/)
  if (primary) {
    return primary[1].replace(/\\u0026/g, '&').replace(/&amp;/g, '&')
  }

  // Fallback: grab any scontent CDN mp4 URL directly from the page
  const cdn = normalised.match(/https:\/\/scontent[^"<>\s]{30,}\.mp4[^"<>\s]*/)
  if (cdn) {
    return cdn[0].replace(/\\u0026/g, '&').replace(/&amp;/g, '&')
  }

  return null
}

export const revalidate = 0   // never ISR-cache this route

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url')
  if (!raw) {
    return NextResponse.json({ error: 'url param required' }, { status: 400 })
  }

  const shortcode = shortcodeFrom(raw)
  if (!shortcode) {
    return NextResponse.json({ error: 'not a recognised Instagram reel URL' }, { status: 400 })
  }

  try {
    const html = await fetchEmbedPage(shortcode)
    const mp4 = extractMp4(html)

    if (mp4) {
      return NextResponse.redirect(mp4, {
        status: 302,
        headers: {
          // Cache the 302 for 25 minutes so repeat loads are instant
          // but we rotate before Instagram's CDN URL typically expires (~30 min).
          'Cache-Control': 'public, max-age=1500, s-maxage=1500',
        },
      })
    }

    // Extraction failed — return the embed page URL so the client can show an iframe
    const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`
    return NextResponse.json({ fallback: 'iframe', embedUrl }, { status: 200 })
  } catch (err) {
    console.error('[ig-proxy] error for', shortcode, err instanceof Error ? err.message : err)
    const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`
    return NextResponse.json({ fallback: 'iframe', embedUrl }, { status: 200 })
  }
}
