import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'biz — business ideas hiding in plain sight'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Branded default share card for the whole site.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#FFE111', padding: 72, position: 'relative', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#141414', letterSpacing: -2 }}>biz</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#141414', opacity: 0.7, marginTop: 18 }}>BUSINESS IDEAS HIDING IN PLAIN SIGHT</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          <div style={{ fontSize: 92, fontWeight: 900, color: '#141414', lineHeight: 1.02, letterSpacing: -3 }}>Find the biz hiding</div>
          <div style={{ fontSize: 92, fontWeight: 900, color: '#141414', lineHeight: 1.02, letterSpacing: -3 }}>in plain sight</div>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#141414', opacity: 0.8, marginTop: 24 }}>Free roadmaps · real rupee numbers · smart research bot</div>
        </div>
        <div style={{ position: 'absolute', right: 60, bottom: 60, display: 'flex', gap: 12 }}>
          {['#2FB457', '#FF5CA8', '#7B6EF6'].map((c) => (
            <div key={c} style={{ width: 26, height: 26, borderRadius: 999, background: c, border: '4px solid #141414' }} />
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
