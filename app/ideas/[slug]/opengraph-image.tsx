import { ImageResponse } from 'next/og'
import { IDEAS } from '@/lib/demoData'

export const runtime = 'nodejs'
export const alt = 'biz idea'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CAT_COLOR: Record<string, string> = {
  'E-commerce': '#8FD3FF', 'Content': '#7B6EF6', 'Digital Products': '#2FB457',
  'Local Services': '#FF5CA8', 'Automation': '#FFE111', 'Real Estate': '#FF6A2B', 'Finance': '#2FB457',
}

// Per-idea branded share card so links look great on social/chat.
export default function Image({ params }: { params: { slug: string } }) {
  const idea = IDEAS.find((i) => i.slug === params.slug)
  const accent = (idea && CAT_COLOR[idea.category]) || '#FFE111'
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFDF5', padding: 0, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFE111', borderBottom: '8px solid #141414', padding: '32px 64px' }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#141414', letterSpacing: -2 }}>biz</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#141414', background: '#fff', border: '4px solid #141414', borderRadius: 999, padding: '8px 22px' }}>{idea?.category ?? 'Business idea'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '56px 64px', flex: 1 }}>
          <div style={{ fontSize: 76, fontWeight: 900, color: '#141414', lineHeight: 1.03, letterSpacing: -2 }}>{idea?.title ?? 'Hidden business idea'}</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#141414', opacity: 0.72, marginTop: 20, maxWidth: 980 }}>{idea?.tagline ?? ''}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 'auto' }}>
            {idea && [`${idea.monthlyPotential}/mo`, `Cost ${idea.startupCost}`, `${idea.timeToFirst}`].map((raw) => raw.replace(/₹/g, 'Rs ')).map((t) => (
              <div key={t} style={{ fontSize: 26, fontWeight: 800, color: '#141414', background: accent, border: '4px solid #141414', borderRadius: 999, padding: '10px 24px' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
