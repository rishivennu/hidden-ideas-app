'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Loader2, Plus, Trash2, Upload, LogOut, Inbox, CheckCircle2, Eye, Download, BarChart3, Flame, FileSpreadsheet } from 'lucide-react'
import CountUp from '@/components/CountUp'
import MiniBarChart from '@/components/MiniBarChart'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ModalAuth from '@/components/ModalAuth'
import { supabase } from '@/lib/supabaseClient'
import { downloadCsv } from '@/lib/exportCsv'

interface ReelRow { id: string; title: string; slug: string; published: boolean; created_at: string }
interface Submission { id: string; title: string; description: string | null; email: string | null; status: string; created_at: string }
interface RoadmapDraft { name: string; duration_days: string; cost_estimate: string; difficulty: string; steps: string }
interface Analytics { totalVisits: number; totalDownloads: number; series: { date: string; visits: number; downloads: number }[]; topIdeas: { slug: string; count: number }[]; ready: boolean }

const emptyRoadmap: RoadmapDraft = { name: '', duration_days: '', cost_estimate: '', difficulty: '3', steps: '' }

export default function AdminPage() {
  const [authState, setAuthState] = useState<'loading' | 'signedout' | 'forbidden' | 'ok'>('loading')
  const [showAuth, setShowAuth] = useState(false)
  const [reels, setReels] = useState<ReelRow[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  // form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [guideTitle, setGuideTitle] = useState('')
  const [guideSummary, setGuideSummary] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [roadmaps, setRoadmaps] = useState<RoadmapDraft[]>([{ ...emptyRoadmap }])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin')
    if (res.status === 401) { setAuthState('signedout'); return }
    if (res.status === 403) { setAuthState('forbidden'); return }
    if (!res.ok) { setAuthState('forbidden'); return }
    const data = await res.json()
    setReels(data.reels)
    setSubmissions(data.submissions)
    setAnalytics(data.analytics ?? null)
    setAuthState('ok')
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setAuthState('signedout')
  }

  function updateRoadmap(i: number, key: keyof RoadmapDraft, value: string) {
    setRoadmaps((prev) => prev.map((rm, idx) => (idx === i ? { ...rm, [key]: value } : rm)))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    // Build & validate roadmaps JSON
    const built: object[] = []
    for (const rm of roadmaps) {
      if (!rm.name.trim()) continue
      let steps: unknown = null
      if (rm.steps.trim()) {
        try { steps = JSON.parse(rm.steps) }
        catch { setMsg({ type: 'err', text: `Roadmap "${rm.name}": steps is not valid JSON.` }); return }
      }
      built.push({
        name: rm.name.trim(),
        duration_days: rm.duration_days ? parseInt(rm.duration_days, 10) : undefined,
        cost_estimate: rm.cost_estimate.trim() || undefined,
        difficulty: rm.difficulty ? parseInt(rm.difficulty, 10) : undefined,
        steps,
      })
    }

    const fd = new FormData()
    fd.append('title', title)
    fd.append('description', description)
    fd.append('videoUrl', videoUrl)
    fd.append('duration', duration)
    fd.append('guideTitle', guideTitle)
    fd.append('guideSummary', guideSummary)
    fd.append('roadmaps', JSON.stringify(built))
    if (thumbnail) fd.append('thumbnail', thumbnail)
    if (pdf) fd.append('pdf', pdf)

    setSaving(true)
    try {
      const res = await fetch('/api/admin', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create')
      setMsg({ type: 'ok', text: `Published! Live at /reels/${data.slug}` })
      // reset
      setTitle(''); setDescription(''); setVideoUrl(''); setDuration('')
      setGuideTitle(''); setGuideSummary(''); setThumbnail(null); setPdf(null)
      setRoadmaps([{ ...emptyRoadmap }])
      load()
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to create' })
    } finally {
      setSaving(false)
    }
  }

  function exportSubmissions() {
    const headers = ['Title', 'Description', 'Email', 'Status', 'Submitted']
    const rows = submissions.map((s) => [
      s.title,
      s.description ?? '',
      s.email ?? '',
      s.status,
      new Date(s.created_at).toLocaleString(),
    ])
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`biz-submissions-${stamp}.csv`, headers, rows)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This removes its guide and roadmaps too.`)) return
    const res = await fetch(`/api/admin?id=${id}`, { method: 'DELETE' })
    if (res.ok) setReels((prev) => prev.filter((r) => r.id !== id))
    else alert('Delete failed.')
  }

  // ── Gate states ───────────────────────────────────────────
  if (authState === 'loading') {
    return <Shell><div className="py-32 text-center"><Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" /></div></Shell>
  }
  if (authState === 'signedout') {
    return (
      <Shell>
        <div className="py-32 text-center">
          <h1 className="text-title mb-4">Admin access</h1>
          <p className="text-muted mb-8">Sign in with an authorized admin account to manage content.</p>
          <button onClick={() => setShowAuth(true)} className="btn-primary">Sign in</button>
        </div>
        <ModalAuth open={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); load() }} title="Admin sign in" subtitle="Only authorized emails can manage content." />
      </Shell>
    )
  }
  if (authState === 'forbidden') {
    return (
      <Shell>
        <div className="py-32 text-center">
          <h1 className="text-title mb-4">Not authorized</h1>
          <p className="text-muted mb-8">This account is not on the admin list. Add its email to the ADMIN_EMAILS environment variable in Vercel.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleSignOut} className="btn-secondary"><LogOut className="w-4 h-4" /> Sign out</button>
            <Link href="/" className="btn-primary">Home</Link>
          </div>
        </div>
      </Shell>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <Shell>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <img src="/illustrations/logo-mark.png" alt="biz" className="h-8 w-auto object-contain" />
          <div>
            <h1 className="text-title font-display">Admin</h1>
            <p className="text-muted text-sm mt-1">Create ideas, upload guides, manage content.</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="btn-secondary text-sm px-4 py-2"><LogOut className="w-4 h-4" /> Sign out</button>
      </div>

      {/* ── Analytics infographics ─────────────────────────── */}
      <section className="mb-10" aria-labelledby="analytics-heading">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-ink" />
          <h2 id="analytics-heading" className="text-lg font-display font-semibold">Overview</h2>
        </div>

        {analytics && !analytics.ready && (
          <div className="glass-card p-4 mb-4 text-sm text-muted">
            Analytics table not found yet. Run migration <code className="text-accent">002_analytics.sql</code> in Supabase to start collecting visits &amp; downloads.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatTile icon={Eye} label="Total visits" value={analytics?.totalVisits ?? 0} tint="bg-biz-sky/40" />
          <StatTile icon={Download} label="Roadmap downloads" value={analytics?.totalDownloads ?? 0} tint="bg-biz-purple/20" />
          <StatTile icon={Inbox} label="Idea submissions" value={submissions.length} tint="bg-yellow" />
          <StatTile icon={Flame} label="Published reels" value={reels.length} tint="bg-biz-green/25" />
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm mb-4">Traffic &amp; downloads</h3>
            {analytics && analytics.series.length > 0
              ? <MiniBarChart series={analytics.series} />
              : <p className="text-sm text-muted py-12 text-center">No data in the last 14 days yet.</p>}
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-1.5"><Flame className="w-4 h-4 text-accent" /> Top downloaded</h3>
            {analytics && analytics.topIdeas.length > 0 ? (
              <ol className="space-y-3">
                {analytics.topIdeas.map((t, i) => (
                  <li key={t.slug} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                    <span className="truncate flex-1">{t.slug.replace(/-/g, ' ')}</span>
                    <span className="text-muted text-xs">{t.count}</span>
                  </li>
                ))}
              </ol>
            ) : <p className="text-sm text-muted py-8 text-center">No downloads yet.</p>}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
        {/* Create form */}
        <form onSubmit={handleCreate} className="glass-card p-8 space-y-6">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2"><Plus className="w-5 h-5 text-ink" /> New idea</h2>

          <Field label="Reel title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={4} className={inputCls} placeholder="Weekend micro-fulfillment kiosk" />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="Short hook shown on the reel page" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Video URL (hosted MP4 / CDN)">
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={inputCls} placeholder="https://.../reel.mp4" />
            </Field>
            <Field label="Duration (seconds)">
              <input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" className={inputCls} placeholder="47" />
            </Field>
          </div>

          <Field label="Thumbnail image (uploaded)">
            <FileInput file={thumbnail} onChange={setThumbnail} accept="image/*" hint="PNG or JPG, shown on the reel card" />
          </Field>

          <div className="h-px bg-black/8" />
          <h3 className="font-semibold">Setup guide (optional)</h3>
          <Field label="Guide title">
            <input value={guideTitle} onChange={(e) => setGuideTitle(e.target.value)} className={inputCls} placeholder="10-Page Setup Guide" />
          </Field>
          <Field label="Guide summary">
            <textarea value={guideSummary} onChange={(e) => setGuideSummary(e.target.value)} rows={2} className={inputCls + ' resize-none'} />
          </Field>
          <Field label="Guide PDF (uploaded, gated behind sign-in)">
            <FileInput file={pdf} onChange={setPdf} accept="application/pdf" hint="The downloadable PDF users get after signing in" />
          </Field>

          <div className="h-px bg-black/8" />
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Roadmaps</h3>
            <button type="button" onClick={() => setRoadmaps((p) => [...p, { ...emptyRoadmap }])} className="btn-secondary text-xs px-3 py-1.5"><Plus className="w-3.5 h-3.5" /> Add</button>
          </div>
          {roadmaps.map((rm, i) => (
            <div key={i} className="rounded-14 border border-black/10 p-4 space-y-3 bg-white/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Roadmap {i + 1}</span>
                {roadmaps.length > 1 && (
                  <button type="button" onClick={() => setRoadmaps((p) => p.filter((_, idx) => idx !== i))} className="text-red-500 text-xs">Remove</button>
                )}
              </div>
              <input value={rm.name} onChange={(e) => updateRoadmap(i, 'name', e.target.value)} className={inputCls} placeholder="Weekend MVP (30 days)" />
              <div className="grid grid-cols-3 gap-2">
                <input value={rm.duration_days} onChange={(e) => updateRoadmap(i, 'duration_days', e.target.value)} type="number" className={inputCls} placeholder="Days" />
                <input value={rm.cost_estimate} onChange={(e) => updateRoadmap(i, 'cost_estimate', e.target.value)} className={inputCls} placeholder="$200–$500" />
                <select value={rm.difficulty} onChange={(e) => updateRoadmap(i, 'difficulty', e.target.value)} className={inputCls}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Difficulty {n}</option>)}
                </select>
              </div>
              <textarea value={rm.steps} onChange={(e) => updateRoadmap(i, 'steps', e.target.value)} rows={3} className={inputCls + ' font-mono text-xs resize-none'} placeholder='Steps as JSON: [{"order":1,"title":"...","description":"..."}]' />
            </div>
          ))}

          {msg && (
            <p className={`text-sm flex items-center gap-2 ${msg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
              {msg.type === 'ok' && <CheckCircle2 className="w-4 h-4" />}{msg.text}
            </p>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><Upload className="w-4 h-4" /> Publish idea</>}
          </button>
        </form>

        {/* Sidebar: reels + submissions */}
        <div className="space-y-8">
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold mb-4">Published reels ({reels.length})</h2>
            <div className="space-y-2 max-h-80 overflow-auto">
              {reels.length === 0 && <p className="text-sm text-muted">None yet.</p>}
              {reels.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 text-sm py-2 border-b border-black/5 last:border-0">
                  <Link href={`/reels/${r.slug}`} className="truncate hover:text-accent" target="_blank">{r.title}</Link>
                  <button onClick={() => handleDelete(r.id, r.title)} aria-label={`Delete ${r.title}`} className="text-muted hover:text-red-500 shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2"><Inbox className="w-4 h-4" /> Submissions ({submissions.length})</h2>
              {submissions.length > 0 && (
                <button onClick={exportSubmissions} className="btn-yellow text-xs px-3 py-1.5" title="Download all submissions as a spreadsheet (opens in Excel)">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export
                </button>
              )}
            </div>
            <div className="space-y-3 max-h-80 overflow-auto">
              {submissions.length === 0 && <p className="text-sm text-muted">No submissions yet.</p>}
              {submissions.map((s) => (
                <div key={s.id} className="text-sm border-b border-black/5 last:border-0 pb-3">
                  <p className="font-medium">{s.title}</p>
                  {s.description && <p className="text-muted text-xs mt-1 line-clamp-2">{s.description}</p>}
                  {s.email && <p className="text-accent text-xs mt-1">{s.email}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-14 border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all'

function StatTile({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tint: string }) {
  return (
    <div className={`glass-card p-5 relative overflow-hidden ${tint}`}>
      <Icon className="w-5 h-5 text-ink mb-3" aria-hidden="true" />
      <p className="text-3xl font-bold tracking-tight"><CountUp value={value} /></p>
      <p className="text-sm text-muted mt-0.5">{label}</p>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">{children}</div>
      </main>
      <Footer />
    </>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">{label}{required && <span className="text-accent"> *</span>}</span>
      {children}
    </label>
  )
}

function FileInput({ file, onChange, accept, hint }: { file: File | null; onChange: (f: File | null) => void; accept: string; hint?: string }) {
  return (
    <div>
      <input
        type="file" accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover file:cursor-pointer cursor-pointer"
      />
      {file ? <p className="text-xs text-green-600 mt-1">Selected: {file.name}</p> : hint ? <p className="text-xs text-muted mt-1">{hint}</p> : null}
    </div>
  )
}
