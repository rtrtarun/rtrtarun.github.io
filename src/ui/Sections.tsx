import { useMemo, useState } from 'react'
import { PORTFOLIO as P } from '../content'
import ContactConsole from './ContactConsole'
import { asset } from '../lib/asset'

type Item = (typeof P.experience)[number]['items'][number]

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-sm border border-cyan/25 bg-cyan/5 px-2 py-0.5 font-mono text-[10px] text-cyan/90">{children}</span>
)

const Eyebrow = ({ code, title }: { code: string; title: string }) => (
  <p className="mb-2 font-mono text-[11px] tracking-[0.35em] text-gold">{code} // {title}</p>
)

function Modal({ onClose, children, action }: { onClose: () => void; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-sm p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        {children}
        <div className="mt-6 flex flex-wrap items-center gap-6">
          {action}
          <button onClick={onClose} className="font-mono text-[11px] tracking-[0.3em] text-gold hover:text-white">[ CLOSE ]</button>
        </div>
      </div>
    </div>
  )
}

function WorkDetail({ item }: { item: Item }) {
  const story = item.story as unknown as { h: string; t: string }[] | undefined
  const details = item.details as unknown as string[]
  return (
    <>
      <h3 className="text-2xl font-light text-white">{item.title}</h3>
      <p className="mt-2 text-slate-300">{item.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">{item.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
      {story?.map((s) => (
        <div key={s.h} className="mt-5">
          <h4 className="font-mono text-[11px] tracking-[0.25em] text-gold">{s.h.toUpperCase()}</h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{s.t}</p>
        </div>
      ))}
      {item.highlights.length > 0 && (
        <ul className="mt-5 list-none space-y-2 text-sm text-slate-300">
          {item.highlights.map((h) => <li key={h}><span className="text-cyan">▸</span> {h}</li>)}
        </ul>
      )}
      {details.length > 0 && (
        <ul className="mt-5 space-y-2 text-sm text-slate-400">{details.map((d) => <li key={d}>– {d}</li>)}</ul>
      )}
    </>
  )
}

const Wrap = ({ id, children, align = 'left' }: { id: string; children: React.ReactNode; align?: 'left' | 'right' }) => (
  <section id={id} className={`flex min-h-screen items-center px-5 py-28 md:px-16 ${align === 'right' ? 'justify-end' : ''}`}>
    <div className="pointer-events-auto w-full max-w-2xl">{children}</div>
  </section>
)

export function Landing() {
  return <section id="core" className="h-screen" aria-label="The Core" />
}

const Chapter = ({ n, title, note }: { n: string; title: string; note?: string }) => (
  <div className="mb-3 mt-10 first:mt-0">
    <p className="font-mono text-[10px] tracking-[0.3em] text-slate-500">CHAPTER {n}</p>
    <h2 className="text-3xl font-light text-white">{title}</h2>
    {note && <p className="mt-1 text-sm text-slate-400">{note}</p>}
  </div>
)

function Highlight({ badge, title, intro, points, mark }: { badge: string; title: string; intro: string; points: string[]; mark: string }) {
  return (
    <div className="glass mt-4 rounded-sm p-6">
      <span className="font-mono text-[10px] tracking-[0.25em] text-cyan">{badge.toUpperCase()}</span>
      <h3 className="mt-1 text-2xl font-light text-white">{title}</h3>
      <p className="mt-2 text-slate-300">{intro}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-400">
        {points.map((p) => <li key={p}><span className="text-gold">{mark}</span> {p}</li>)}
      </ul>
    </div>
  )
}

/** 01: Who I am, current AI focus, and the full work experience (all roles, with tech filter). */
export function Experience() {
  const [open, setOpen] = useState<Item | null>(null)
  const [tag, setTag] = useState<string | null>(null)

  const topTags = useMemo(() => {
    const counts: Record<string, number> = {}
    P.experience.forEach((r) => r.items.forEach((i) => i.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1 })))
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 10)
  }, [])
  const workItems = P.experience.reduce((n, r) => n + r.items.length, 0)
  const clients = new Set(P.experience.map((r) => r.client)).size
  const stats: [number, string][] = [[clients, 'Client engagements'], [P.experience.length, 'Teams'], [workItems, 'Systems & features']]

  return (
    <Wrap id="experience">
      <Eyebrow code="01" title="THE COGNITIVE ENGINE" />
      <Chapter n="I" title="Who I am" />
      <div className="glass rounded-sm p-6">
        <div className="flex flex-col gap-5 sm:flex-row">
          <img src={asset(P.photo)} alt={`Portrait of ${P.name}`} className="aspect-square w-32 flex-none self-start rounded-sm border border-white/15 object-cover object-top sm:w-52 sm:block" />
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">{P.about.map((a) => <p key={a}>{a}</p>)}</div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {stats.map(([n, l]) => (
            <div key={l} className="rounded-sm border border-white/10 p-3 text-center">
              <strong className="block text-3xl font-light text-gold">{n}</strong>
              <span className="font-mono text-[10px] tracking-[0.15em] text-slate-400">{l.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      <Highlight badge="Current focus" mark="◆" {...P.aiHighlight} />
      <Highlight mark="▮" {...P.devHighlight} />

      <Chapter n="II" title="Work experience" note="Select any piece of work to read what it was and what I did." />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[null, ...topTags].map((t) => (
          <button key={t ?? 'all'} onClick={() => setTag(t === tag ? null : t)}
            className={`rounded-sm border px-2 py-1 font-mono text-[10px] transition ${(t ?? null) === tag ? 'border-gold bg-gold/15 text-gold' : 'border-white/15 text-slate-400 hover:border-cyan/60'}`}>
            {t ?? 'All'}
          </button>
        ))}
      </div>
      {P.experience.map((role) => {
        const items = role.items.filter((it) => !tag || it.tags.includes(tag))
        if (!items.length) return null
        return (
          <div key={role.title + role.period} className="glass mt-4 rounded-sm p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg text-white">{role.title} <span className="text-slate-500">· {role.org}</span></h3>
              <span className="font-mono text-[11px] text-cyan/80">{role.period}</span>
            </div>
            <p className="mt-1 font-mono text-[10px] tracking-[0.15em] text-gold/80">{[role.client, role.team].filter(Boolean).join(' · ').toUpperCase()}</p>
            <p className="mt-2 text-sm text-slate-400">{role.summary}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {items.map((it) => (
                <button key={it.title} onClick={() => setOpen(it)}
                  className="group rounded-sm border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-sm text-slate-200 transition hover:border-gold/60 hover:bg-gold/5">
                  <span className="text-cyan group-hover:text-gold">◉</span> {it.title}
                </button>
              ))}
            </div>
          </div>
        )
      })}
      {open && <Modal onClose={() => setOpen(null)}><WorkDetail item={open} /></Modal>}
    </Wrap>
  )
}

/** 02: SDE pipeline. "Projects I've built" as stacked modules. */
export function Development() {
  const [shot, setShot] = useState<{ src: string; caption: string } | null>(null)
  return (
    <Wrap id="development" align="right">
      <Eyebrow code="02" title="THE SYSTEM PIPELINE" />
      <Chapter n="III" title="Projects I've built" />
      {P.projects.map((pr, i) => (
        <article key={pr.title} className="glass mt-4 rounded-sm border-l-2 border-l-gold/70 p-6">
          <p className="font-mono text-[10px] tracking-[0.25em] text-gold">{String(i + 1).padStart(2, '0')} / {String(P.projects.length).padStart(2, '0')}</p>
          <h3 className="text-xl text-white">{pr.title} <span className="text-slate-500">· {pr.subtitle}</span></h3>
          <p className="mt-2 text-sm text-slate-300">{pr.whatItDoes}</p>
          <ul className="mt-3 space-y-1 text-sm text-slate-400">{pr.features.map((f) => <li key={f}>▸ {f}</li>)}</ul>
          <div className="mt-3 flex flex-wrap gap-1.5">{pr.stack.map((s) => <Tag key={s}>{s}</Tag>)}</div>
          <p className="mt-3 text-sm italic text-slate-400">{pr.why}</p>
          {pr.shots.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 font-mono text-[10px] tracking-[0.25em] text-cyan/80">LIVE SERVICE · CLICK TO ENLARGE</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {pr.shots.map((sh) => (
                  <button key={sh.src} onClick={() => setShot(sh)} className="group overflow-hidden rounded-sm border border-white/10 transition hover:border-gold/60">
                    <img src={asset(sh.src)} alt={sh.caption} loading="lazy" className="aspect-[16/10] w-full object-cover object-top transition group-hover:scale-105" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-5">
            {pr.demo && <a href={pr.demo} target="_blank" rel="noopener" className="rounded-sm border border-gold/60 bg-gold/10 px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-gold hover:bg-gold/20">LIVE DEMO ↗</a>}
          {pr.github && <a href={pr.github} target="_blank" rel="noopener" className="self-center font-mono text-[11px] tracking-[0.25em] text-cyan hover:text-gold">GITHUB →</a>}
          </div>
        </article>
      ))}
      {shot && (
        <Modal onClose={() => setShot(null)}>
          <img src={asset(shot.src)} alt={shot.caption} className="w-full rounded-sm border border-white/10" />
          <p className="mt-3 text-sm text-slate-300">{shot.caption}</p>
        </Modal>
      )}
    </Wrap>
  )
}

/** 03: Labs. Skills as clickable artifacts (plain-English popups) + certifications. */
export function Labs() {
  const [skill, setSkill] = useState<string | null>(null)
  const [cert, setCert] = useState<(typeof P.certifications)[number] | null>(null)
  const info = skill ? (P.skillInfo as Record<string, { what: string; like: string }>)[skill] : null
  return (
    <Wrap id="labs">
      <Eyebrow code="03" title="THE EXPERIMENTS" />
      <div className="glass rounded-sm p-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-slate-500">CHAPTER IV</p>
        <h2 className="text-3xl font-light text-white">Skill stack</h2>
        <p className="mt-1 text-sm text-slate-400">Poke a skill. The ones that glow gold explain themselves.</p>
        {Object.entries(P.skills).map(([group, list]) => (
          <div key={group} className="mt-4">
            <h4 className="font-mono text-[11px] tracking-[0.25em] text-cyan/80">{group.toUpperCase()}</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(list as string[]).map((s) => {
                const has = s in P.skillInfo
                return (
                  <button key={s} disabled={!has} onClick={() => setSkill(s)}
                    className={`rounded-sm border px-2 py-1 text-xs transition ${has ? 'border-gold/40 text-gold hover:-translate-y-0.5 hover:bg-gold/10' : 'cursor-default border-white/10 text-slate-400'}`}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="glass mt-5 rounded-sm p-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-slate-500">CHAPTER V</p>
        <h2 className="text-3xl font-light text-white">Certifications</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {P.certifications.map((c) => (
            <li key={c.title}>
              <button onClick={() => setCert(c)} className="block w-full rounded-sm border border-white/10 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-cyan/60 hover:bg-cyan/5">
                {c.title}<span className="block font-mono text-[10px] text-slate-500">{c.org} · {c.period}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {cert && (
        <Modal
          onClose={() => setCert(null)}
          action={<a href={cert.url} target="_blank" rel="noopener" className="rounded-sm border border-gold/60 bg-gold/10 px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-gold hover:bg-gold/20">VERIFY ON CREDLY ↗</a>}
        >
          <p className="font-mono text-[10px] tracking-[0.25em] text-cyan">{cert.org.toUpperCase()} · {cert.period.toUpperCase()}</p>
          <h3 className="mt-1 text-2xl font-light text-white">{cert.title}</h3>
          <h4 className="mt-5 font-mono text-[11px] tracking-[0.25em] text-gold">ABOUT</h4>
          <p className="mt-1 text-slate-300">{cert.about}</p>
          <h4 className="mt-5 font-mono text-[11px] tracking-[0.25em] text-gold">SKILLS</h4>
          <div className="mt-2 flex flex-wrap gap-1.5">{cert.skills.map((k) => <Tag key={k}>{k}</Tag>)}</div>
        </Modal>
      )}
      {skill && info && (
        <Modal onClose={() => setSkill(null)}>
          <h3 className="text-2xl text-white">{skill}</h3>
          <h4 className="mt-4 font-mono text-[11px] tracking-[0.25em] text-gold">WHAT IT IS</h4>
          <p className="mt-1 text-slate-300">{info.what}</p>
          <h4 className="mt-4 font-mono text-[11px] tracking-[0.25em] text-gold">THINK OF IT LIKE THIS</h4>
          <p className="mt-1 text-slate-300">{info.like}</p>
        </Modal>
      )}
    </Wrap>
  )
}

export function Contact() {
  return (
    <Wrap id="contact" align="right">
      <Eyebrow code="04" title="CONSOLE" />
      <ContactConsole />
    </Wrap>
  )
}
