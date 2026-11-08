import { useEffect, useState } from 'react'
import { PORTFOLIO as P } from '../content'
import { asset } from '../lib/asset'
import { SECTIONS, useUI } from '../lib/store'
import { rig } from '../lib/rig'
import { PALETTES, setPalette, setTheme } from '../lib/palettes'
import { enterSystem, goTo } from '../lib/useScrollRig'

function Corner({ className }: { className: string }) {
  return <span className={`absolute h-3 w-3 border-cyan/70 ${className}`} />
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass relative rounded-sm p-4 font-mono text-[11px] leading-relaxed ${className}`}>
      <Corner className="left-0 top-0 border-l border-t" />
      <Corner className="right-0 top-0 border-r border-t" />
      <Corner className="bottom-0 left-0 border-b border-l" />
      <Corner className="bottom-0 right-0 border-b border-r" />
      <div className="mb-2 flex items-center gap-2 tracking-[0.25em] text-cyan/80">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /> {title}
      </div>
      {children}
    </div>
  )
}

/** Live telemetry: reads the mutable rig on a timer instead of re-rendering each frame. */
function Telemetry() {
  const [t, setT] = useState({ ex: 0, z: 0 })
  useEffect(() => {
    const i = setInterval(() => setT({ ex: rig.explode, z: rig.cz }), 120)
    return () => clearInterval(i)
  }, [])
  const bar = (v: number) => '█'.repeat(Math.round(v * 12)).padEnd(12, '░')
  return (
    <div className="text-slate-300/80">
      <div>EXPLODE &nbsp;{bar(t.ex)} {(t.ex * 100).toFixed(0)}%</div>
      <div>CAM.Z &nbsp;&nbsp;&nbsp;{t.z.toFixed(2)}</div>
      <div>STATE &nbsp;&nbsp;&nbsp;{t.ex > 0.5 ? 'GRAPH.EXPANDED' : 'CORE.SEALED'}</div>
    </div>
  )
}

export default function Hud() {
  const section = useUI((s) => s.section)
  const entered = useUI((s) => s.entered)
  const hovered = useUI((s) => s.hovered)
  const palette = useUI((s) => s.palette)
  const theme = useUI((s) => s.theme)
  const [open, setOpen] = useState(false)
  const cur = SECTIONS[section]

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-5 md:p-8">
      {/* top bar */}
      <header className="flex items-start justify-between font-mono text-[11px] tracking-[0.2em]">
        <div className="glass pointer-events-auto rounded-sm px-3 py-2 text-cyan/90">
          <span className="text-gold">◆</span> TARUN.SYS
        </div>
        <div className="flex items-start gap-3">
        <nav className="glass pointer-events-auto hidden gap-5 rounded-sm px-4 py-2 md:flex">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(s.id)}
              className={`transition-colors ${i === section ? 'text-gold' : 'text-slate-400 hover:text-cyan'}`}
            >
              {s.code} {s.id.toUpperCase()}
            </button>
          ))}
          <a
            href={asset(P.resumeUrl)} target="_blank" rel="noopener"
            className="border-l border-white/15 pl-5 text-gold transition-colors hover:text-white"
          >
            RESUME ↗
          </a>
        </nav>
        <div className="glass pointer-events-auto flex items-center gap-2 rounded-sm px-3 py-2" role="group" aria-label="Colour theme">
          {PALETTES.map((p) => (
            <button
              key={p.id} title={p.name} aria-label={`${p.name} theme`} onClick={() => setPalette(p.id)}
              className={`h-4 w-4 rounded-full border transition hover:scale-125 ${palette === p.id ? 'scale-125 border-white' : 'border-white/30'}`}
              style={{ background: `linear-gradient(135deg, ${p.a} 50%, ${p.c} 50%)` }}
            />
          ))}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="ml-1 border-l border-white/20 pl-3 text-sm leading-none text-gold transition hover:scale-125"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
        </div>
      </header>

      {/* hero text, only on landing */}
      <div className={`absolute left-5 top-1/2 max-w-xl -translate-y-1/2 transition-all duration-1000 md:left-12 ${section === 0 ? 'opacity-100' : 'pointer-events-none -translate-x-8 opacity-0'}`}>
        <img
          src={asset(P.photo)} alt={`Portrait of ${P.name}`}
          className="mb-6 aspect-square w-44 rounded-sm border border-gold/50 object-cover object-top shadow-[0_0_40px_rgba(255,184,64,.25)] md:w-56"
        />
        <p className="mb-3 font-mono text-xs tracking-[0.35em] text-cyan/80">// INITIALISING CORE</p>
        <h1 className="text-4xl font-light leading-[1.05] tracking-tight text-white md:text-6xl">
          {P.name} <span className="text-gold">//</span>
        </h1>
        <p className="mt-4 text-lg font-light text-slate-300 md:text-2xl">
          {P.role}
        </p>
        <p className="mt-4 max-w-md text-sm text-slate-400">{P.tagline}</p>
        <div className="mt-4 flex max-w-lg flex-wrap gap-1.5">
          {P.keywords.map((k) => <span key={k} className="rounded-sm border border-cyan/25 bg-black/40 px-2 py-0.5 font-mono text-[10px] text-cyan/90">{k}</span>)}
        </div>
        <button
          onClick={enterSystem}
          className="glass pointer-events-auto group relative mt-10 overflow-hidden rounded-sm px-8 py-4 font-mono text-xs tracking-[0.35em] text-white transition-all hover:border-gold/60 hover:shadow-[0_0_40px_rgba(255,184,64,.25)]"
        >
          <span className="relative z-10">ENTER THE SYSTEM →</span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </button>
      </div>

      {/* side panels */}
      <aside className={`absolute right-5 top-24 hidden w-64 flex-col gap-4 transition-opacity duration-700 md:right-8 ${section === 0 ? 'md:flex' : 'pointer-events-none opacity-0 md:flex'}`}>
        <Panel title="NEURAL.CORE">
          <Telemetry />
        </Panel>
        <Panel title="MODULES">
          <ul className="space-y-1 text-slate-300/80">
            <li>▸ SYSTEM.ARCH <span className="text-cyan">[RINGS]</span></li>
            <li>▸ ML.LAYER <span className="text-gold">[NODES]</span></li>
            <li>▸ DATA.STREAM <span className="text-cyan">[ACTIVE]</span></li>
          </ul>
        </Panel>
      </aside>

      {/* bottom bar */}
      <footer className="flex items-end justify-between font-mono text-[11px] tracking-[0.2em]">
        <div className="pointer-events-auto relative">
          {open && (
            <ul className="glass absolute bottom-full left-0 mb-2 w-72 rounded-sm p-2">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => { goTo(s.id); setOpen(false) }}
                    className={`flex w-full items-baseline gap-3 rounded-sm px-3 py-2 text-left transition-colors hover:bg-white/5 ${i === section ? 'text-gold' : 'text-slate-300 hover:text-cyan'}`}
                  >
                    <span className="text-[10px] opacity-70">{s.code}</span>
                    <span><span className="block text-xs text-white">{s.title}</span><span className="text-[10px] text-slate-400">{s.sub}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Open scene index" className="block text-left">
            <Panel title={`SCENE ${cur.code}  ${open ? '▾' : '▴'}`} className="w-72 transition-colors hover:border-gold/50">
              <div className="text-sm text-white">{cur.title}</div>
              <div className="text-slate-400">{cur.sub}</div>
            </Panel>
          </button>
        </div>
        <div className="hidden text-right text-slate-500 md:block">
          {hovered ? <span className="text-gold">CORE.LINK ESTABLISHED</span> : 'HOVER THE CORE'}
          <div className="mt-1">{entered ? 'SCROLL ↓' : 'LOCKED'}</div>
        </div>
      </footer>
    </div>
  )
}
