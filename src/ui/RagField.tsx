import { useEffect, useRef } from 'react'
import { useUI } from '../lib/store'
import { retrieval } from '../lib/retrieval'

/**
 * Full-screen vector-search visual. A knowledge base is embedded as 2D points in topic clusters.
 * A query point (your cursor, or an auto-wander that follows the current section) retrieves its
 * top-K nearest neighbours; those chunks light up and stream into the query as "context".
 */

const K = 5
const CLUSTERS = [
  { name: 'RAG', x: 0.2, y: 0.28 },
  { name: 'AGENTS', x: 0.74, y: 0.24 },
  { name: 'MCP', x: 0.88, y: 0.66 },
  { name: 'EVALS', x: 0.5, y: 0.5 },
  { name: 'OBSERVABILITY', x: 0.14, y: 0.74 },
  { name: 'BACKEND', x: 0.5, y: 0.84 },
]
// per section: which cluster the idle query drifts toward (-1 = roam) and the query text shown
const SECTION_QUERY = [
  { c: -1, q: 'who is Tarun?' },
  { c: 1, q: 'production agents & RAG experience' },
  { c: 5, q: 'backend systems & APIs at scale' },
  { c: 2, q: 'experiments: MCP, evals' },
  { c: 4, q: 'how do I reach Tarun?' },
]
const PER_CLUSTER = 30

interface Pt { cx: number; cy: number; ox: number; oy: number; ph: number; cl: number; id: number; glow: number; x: number; y: number }

function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(h: string): [number, number, number] {
  const s = h.trim().replace('#', '')
  const n = parseInt(s.length === 3 ? s.replace(/./g, '$&$&') : s, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** UI accent colours for the current palette/theme (light theme darkens them, like index.css does). */
function readColors() {
  const cs = getComputedStyle(document.documentElement)
  const light = document.documentElement.dataset.theme === 'light'
  const mix = (hex: string, k: number): [number, number, number] => {
    const [r, g, b] = hexToRgb(hex)
    return light ? [r * k, g * k, b * k] : [r, g, b]
  }
  return { cool: mix(cs.getPropertyValue('--c') || '#38bdf8', 0.52), warm: mix(cs.getPropertyValue('--g') || '#ffb840', 0.58), light }
}

export default function RagField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true
    let colors = readColors()

    // build the knowledge base
    const rnd = mulberry(7)
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd())
    const pts: Pt[] = []
    CLUSTERS.forEach((c, ci) => {
      for (let i = 0; i < PER_CLUSTER; i++) {
        pts.push({ cx: c.x, cy: c.y, ox: gauss(), oy: gauss(), ph: rnd() * 6.28, cl: ci, id: 1000 + Math.floor(rnd() * 9000), glow: 0, x: 0, y: 0 })
      }
    })

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2)
      w = innerWidth; h = innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    addEventListener('resize', resize)

    const mouse = { x: w * 0.5, y: h * 0.5, last: -1e9 }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.last = performance.now()
    }
    addEventListener('pointermove', onMove)

    const onVis = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', onVis)

    const unsubUI = useUI.subscribe((s, p) => { if (s.palette !== p.palette || s.theme !== p.theme) requestAnimationFrame(() => { colors = readColors() }) })

    const q = { x: w * 0.5, y: h * 0.5 }
    const rgba = (c: number[], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const t = reduced ? 0 : now / 1000
      const size = Math.min(w, h)
      const spread = size * 0.075
      const { cool, warm, light } = colors
      const sec = SECTION_QUERY[useUI.getState().section] ?? SECTION_QUERY[0]

      // positions
      for (const p of pts) {
        p.x = p.cx * w + p.ox * spread + Math.sin(t * 0.35 + p.ph) * 6
        p.y = p.cy * h + p.oy * spread + Math.cos(t * 0.3 + p.ph * 1.3) * 6
      }

      // query target: cursor if recently moved, otherwise wander (toward this section's cluster)
      let tx: number, ty: number
      if (now - mouse.last < 3000) { tx = mouse.x; ty = mouse.y }
      else if (sec.c >= 0) {
        const c = CLUSTERS[sec.c]
        tx = c.x * w + Math.cos(t * 0.5) * spread * 1.1; ty = c.y * h + Math.sin(t * 0.7) * spread * 0.9
      } else {
        tx = w * (0.5 + Math.sin(t * 0.17) * 0.32); ty = h * (0.5 + Math.sin(t * 0.23 + 1) * 0.3)
      }
      q.x += (tx - q.x) * 0.08; q.y += (ty - q.y) * 0.08

      // top-K nearest neighbours
      const top: { p: Pt; d: number }[] = []
      for (const p of pts) {
        const d = Math.hypot(p.x - q.x, p.y - q.y)
        if (top.length < K || d < top[top.length - 1].d) {
          top.push({ p, d }); top.sort((a, b) => a.d - b.d); if (top.length > K) top.pop()
        }
      }
      const hitSet = new Set(top.map((x) => x.p))
      const kRadius = top[top.length - 1].d

      retrieval.query = sec.q
      retrieval.hits = top.map(({ p, d }) => ({
        label: `chunk_${p.id}`, cluster: CLUSTERS[p.cl].name, sim: Math.max(0, Math.min(0.99, 1 - d / (size * 0.9))),
      }))

      ctx.clearRect(0, 0, w, h)

      // faint grid
      ctx.strokeStyle = rgba(cool, light ? 0.06 : 0.05); ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = (w % 64) / 2; x < w; x += 64) { ctx.moveTo(x, 0); ctx.lineTo(x, h) }
      for (let y = (h % 64) / 2; y < h; y += 64) { ctx.moveTo(0, y); ctx.lineTo(w, y) }
      ctx.stroke()

      // cluster halos + labels
      ctx.font = '10px "Fira Code", monospace'; ctx.textAlign = 'center'
      for (const c of CLUSTERS) {
        const cx = c.x * w, cy = c.y * h
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, spread * 2.4)
        g.addColorStop(0, rgba(cool, light ? 0.1 : 0.09)); g.addColorStop(1, rgba(cool, 0))
        ctx.fillStyle = g; ctx.fillRect(cx - spread * 2.5, cy - spread * 2.5, spread * 5, spread * 5)
        ctx.fillStyle = rgba(cool, light ? 0.55 : 0.4)
        ctx.fillText(c.name, cx, cy - spread * 2.1)
      }

      // k-NN search ball
      ctx.save()
      ctx.setLineDash([4, 6]); ctx.lineDashOffset = -t * 12
      ctx.strokeStyle = rgba(warm, 0.35); ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(q.x, q.y, kRadius + 8 + Math.sin(t * 3) * 2, 0, 6.283); ctx.stroke()
      ctx.restore()

      // points
      for (const p of pts) {
        const hit = hitSet.has(p)
        p.glow += ((hit ? 1 : 0) - p.glow) * 0.12
        if (p.glow < 0.02) {
          ctx.fillStyle = rgba(cool, light ? 0.5 : 0.38)
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.7, 0, 6.283); ctx.fill()
          continue
        }
        // ray to query + flowing context particle
        ctx.strokeStyle = rgba(warm, 0.55 * p.glow); ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke()
        const f = (t * 0.7 + p.ph) % 1
        ctx.fillStyle = rgba(warm, p.glow)
        ctx.beginPath(); ctx.arc(p.x + (q.x - p.x) * f, p.y + (q.y - p.y) * f, 2, 0, 6.283); ctx.fill()
        // the retrieved chunk
        ctx.fillStyle = rgba(warm, 0.18 * p.glow)
        ctx.beginPath(); ctx.arc(p.x, p.y, 9 * p.glow, 0, 6.283); ctx.fill()
        ctx.fillStyle = rgba(warm, 1)
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 6.283); ctx.fill()
      }

      // query marker + text
      ctx.strokeStyle = rgba(warm, 1); ctx.fillStyle = rgba(warm, 1); ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(q.x, q.y - 7); ctx.lineTo(q.x + 7, q.y); ctx.lineTo(q.x, q.y + 7); ctx.lineTo(q.x - 7, q.y); ctx.closePath(); ctx.stroke()
      ctx.beginPath(); ctx.arc(q.x, q.y, 2, 0, 6.283); ctx.fill()
      ctx.textAlign = 'left'; ctx.font = '11px "Fira Code", monospace'
      ctx.fillStyle = rgba(warm, 0.95)
      ctx.fillText(`query("${sec.q}")`, q.x + 14, q.y - 12)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
      unsubUI()
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
