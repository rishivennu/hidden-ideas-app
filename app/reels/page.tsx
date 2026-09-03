import type { Metadata } from 'next'
import Link from 'next/link'
import { Play, Film, AlertTriangle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ReelGrid from '@/components/ReelGrid'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import type { Reel } from '@/lib/supabaseClient'

export const metadata: Metadata = {
  title: 'Reels — watch ideas in 60 seconds',
  description: 'A vertical feed of business ideas explained fast. Tap any reel for its full roadmap.',
}

export const revalidate = 60

type Problem = { kind: 'env' | 'query'; detail: string }
type ReelsResult = { reels: Reel[]; problem: Problem | null }

const PLACEHOLDER = /your[-_ ]?project|placeholder|example\.com|changeme|xxxx/i

/** Env vars can be absent OR still hold the .env.example placeholders. Both break the query. */
function envProblem(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url) return 'NEXT_PUBLIC_SUPABASE_URL is not set.'
  if (!key) return 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.'
  if (PLACEHOLDER.test(url) || PLACEHOLDER.test(key))
    return 'Supabase env vars still contain the .env.example placeholder values.'
  try {
    // Not locked to *.supabase.co on purpose, so self-hosted instances still work.
    const parsed = new URL(url.trim())
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
      return `NEXT_PUBLIC_SUPABASE_URL is not an http(s) URL (got "${url}").`
  } catch {
    return `NEXT_PUBLIC_SUPABASE_URL is not a valid URL (got "${url}").`
  }
  return null
}

async function getReels(): Promise<ReelsResult> {
  const envDetail = envProblem()
  if (envDetail) {
    console.error('[reels] not configured:', envDetail)
    return { reels: [], problem: { kind: 'env', detail: envDetail } }
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      // Previously this whole function swallowed every failure and returned [],
      // so a broken table / RLS policy looked identical to "no reels yet".
      console.error('[reels] query failed:', error.message, error.details ?? '', error.hint ?? '')
      return { reels: [], problem: { kind: 'query', detail: error.message } }
    }

    return { reels: (data as Reel[]) ?? [], problem: null }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[reels] request threw:', detail)
    return { reels: [], problem: { kind: 'query', detail } }
  }
}

/**
 * Technical detail is noise for visitors, so it only renders in dev or when you
 * opt in with REELS_DIAGNOSTICS=on. Deliberately NOT a NEXT_PUBLIC_ var: those
 * are inlined at build time, while this one is read on each revalidation.
 * The server-side console.error above always fires either way.
 */
function diagnosticsEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.REELS_DIAGNOSTICS === 'on'
}

export default async function ReelsPage() {
  const { reels, problem } = await getReels()
  const showDiagnostics = diagnosticsEnabled()
  const missingVideo = reels.filter((r) => !r.video_url).length

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="chip bg-biz-purple text-ink mb-3"><Film className="w-4 h-4" /> Reels</span>
              <h1 className="text-title">Ideas in 60 seconds</h1>
              <p className="text-muted mt-1">Reels play as you scroll — tap any reel for the full roadmap.</p>
            </div>
            <Link href="/library" className="btn-secondary text-sm px-5 py-2.5">Browse the library</Link>
          </header>

          {showDiagnostics && (problem || missingVideo > 0) && (
            <div
              className="mb-8 rounded-20 border-2 border-ink bg-yellow/60 p-5 shadow-hard-sm"
              role="status"
              aria-labelledby="reels-diagnostics-heading"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-ink" aria-hidden="true" />
                <div className="min-w-0">
                  <p id="reels-diagnostics-heading" className="font-display font-semibold">
                    {problem ? 'Reels could not be loaded' : 'Reels loaded, but they have no video files'}
                  </p>

                  {problem && (
                    <p className="text-sm mt-1 break-words">
                      <span className="font-semibold">
                        {problem.kind === 'env' ? 'Supabase is not configured: ' : 'Supabase returned an error: '}
                      </span>
                      {problem.detail}
                    </p>
                  )}

                  {problem?.kind === 'env' && (
                    <ol className="text-sm mt-3 space-y-1 list-decimal list-inside">
                      <li>Copy <code className="font-mono text-xs">.env.example</code> to <code className="font-mono text-xs">.env.local</code>.</li>
                      <li>Fill in <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> from Supabase → Settings → API.</li>
                      <li>Add the same two variables in Vercel → Settings → Environment Variables, then redeploy.</li>
                    </ol>
                  )}

                  {problem?.kind === 'query' && (
                    <ol className="text-sm mt-3 space-y-1 list-decimal list-inside">
                      <li>Run <code className="font-mono text-xs">supabase/migrations/001_initial.sql</code> in the Supabase SQL editor — the <code className="font-mono text-xs">reels</code> table may not exist yet.</li>
                      <li>Confirm the row-level-security policy <code className="font-mono text-xs">public read reels</code> exists, otherwise anonymous visitors read nothing.</li>
                      <li>Check the server logs for the full error (it is printed with the <code className="font-mono text-xs">[reels]</code> prefix).</li>
                    </ol>
                  )}

                  {!problem && missingVideo > 0 && (
                    <p className="text-sm mt-1">
                      {missingVideo} of {reels.length} published {reels.length === 1 ? 'reel has' : 'reels have'} an empty
                      {' '}<code className="font-mono text-xs">video_url</code>, so those cards show a static placeholder instead of playing.
                      Upload the file to Supabase Storage and save its public URL on the row.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {reels.length > 0 ? (
            <>
              {/* Cards use h3, so an h2 keeps the outline from jumping h1 -> h3. */}
              <h2 className="sr-only">All reels</h2>
              <ReelGrid reels={reels} />
            </>
          ) : (
            <div className="text-center py-24 rounded-28 border-2 border-dashed border-ink/25 bg-paper">
              <span className="grid place-items-center w-16 h-16 rounded-full bg-yellow border-2 border-ink mx-auto mb-4">
                <Play className="w-7 h-7 text-ink ml-0.5" aria-hidden="true" />
              </span>
              <p className="font-display font-semibold text-xl">
                {problem ? 'Reels are taking a break' : 'Reels are coming soon'}
              </p>
              <p className="text-muted text-sm mt-1 max-w-sm mx-auto">
                {problem
                  ? 'We could not reach the reel library just now. Try again in a minute, or dig into the full library below.'
                  : 'Fresh idea breakdowns drop here every week. In the meantime, dig into the full library.'}
              </p>
              <Link href="/library" className="btn-primary px-6 py-3 mt-6 inline-flex">Explore ideas</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
