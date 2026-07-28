// Zero-dependency canvas confetti burst. Respects reduced-motion.
export function fireConfetti(count = 130) {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const colors = ['#FFE111', '#FF5CA8', '#2FB457', '#7B6EF6', '#8FD3FF', '#FF6A2B']
  const canvas = document.createElement('canvas')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483647'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  const resize = () => {
    canvas.width = innerWidth * dpr
    canvas.height = innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  const cx = innerWidth / 2
  const cy = innerHeight * 0.42
  type P = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; c: string; shape: number }
  const parts: P[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 6 + Math.random() * 9
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      r: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[(Math.random() * colors.length) | 0],
      shape: (Math.random() * 2) | 0,
    }
  })

  let frame = 0
  const gravity = 0.32
  const drag = 0.986
  function tick() {
    frame++
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    let alive = 0
    for (const p of parts) {
      p.vx *= drag
      p.vy = p.vy * drag + gravity
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      if (p.y < innerHeight + 40) alive++
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = Math.max(0, 1 - frame / 150)
      ctx.fillStyle = p.c
      if (p.shape === 0) ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r)
      else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill() }
      ctx.restore()
    }
    if (alive > 0 && frame < 160) requestAnimationFrame(tick)
    else { window.removeEventListener('resize', resize); canvas.remove() }
  }
  window.addEventListener('resize', resize)
  requestAnimationFrame(tick)
}
