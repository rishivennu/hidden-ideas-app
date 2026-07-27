import { NextRequest, NextResponse } from 'next/server'
import { searchIdeas } from '@/lib/demoData'

export const runtime = 'nodejs'

interface WebResult { title: string; url: string; snippet: string }

// Fetch a topic overview from Wikipedia (no API key required).
async function fetchWikipedia(query: string): Promise<{ title: string; extract: string; url: string; thumbnail: string | null } | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { headers: { 'accept': 'application/json' }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const d = await res.json()
    if (d.type === 'disambiguation' || !d.extract) return null
    return {
      title: d.title,
      extract: d.extract,
      url: d.content_urls?.desktop?.page ?? '',
      thumbnail: d.thumbnail?.source ?? null,
    }
  } catch { return null }
}

// Fetch related links from DuckDuckGo's instant-answer JSON API (no key).
async function fetchWeb(query: string): Promise<WebResult[]> {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { headers: { 'accept': 'application/json' }, next: { revalidate: 1800 } }
    )
    if (!res.ok) return []
    const d = await res.json()
    const out: WebResult[] = []
    const walk = (items: unknown[]) => {
      for (const it of items) {
        const t = it as { Text?: string; FirstURL?: string; Topics?: unknown[] }
        if (t.Topics) walk(t.Topics)
        else if (t.Text && t.FirstURL) {
          const idx = t.Text.indexOf(' - ')
          out.push({
            title: idx > 0 ? t.Text.slice(0, idx) : t.Text,
            snippet: idx > 0 ? t.Text.slice(idx + 3) : t.Text,
            url: t.FirstURL,
          })
        }
        if (out.length >= 8) break
      }
    }
    if (Array.isArray(d.RelatedTopics)) walk(d.RelatedTopics)
    if (d.AbstractText && d.AbstractURL) {
      out.unshift({ title: d.Heading ?? query, snippet: d.AbstractText, url: d.AbstractURL })
    }
    return out.slice(0, 8)
  } catch { return [] }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim()
  if (!query) return NextResponse.json({ error: 'q is required' }, { status: 400 })

  const [summary, web] = await Promise.all([fetchWikipedia(query), fetchWeb(query)])
  const ideas = searchIdeas(query).slice(0, 6)

  return NextResponse.json({ query, ideas, summary, web })
}
