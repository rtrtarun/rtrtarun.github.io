import { useState } from 'react'
import { PORTFOLIO as P } from '../content'
import { asset } from '../lib/asset'

const field = 'w-full rounded-sm border border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-cyan outline-none transition focus:border-gold/70 focus:shadow-[0_0_20px_rgba(255,184,64,.15)]'
const label = 'mb-1 block font-mono text-[10px] tracking-[0.25em] text-slate-400'

/**
 * Terminal-style contact form. Same behaviour as the old site: honeypot field, posts to the
 * Apps Script URL when contact.formUrl is set, otherwise falls back to the visitor's mail app.
 */
export default function ContactConsole() {
  const [status, setStatus] = useState<{ msg: string; bad?: boolean }>({ msg: '' })
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    if (f.get('website')) return // honeypot
    if (!form.checkValidity()) { setStatus({ msg: '> ERROR: fill every required field with valid details.', bad: true }); form.reportValidity(); return }

    if (!P.contact.formUrl) {
      const body = `Name: ${f.get('firstName')} ${f.get('lastName')}\nEmail: ${f.get('email')}\nPhone: ${f.get('phone')}\nReason: ${f.get('reason')}\n\n${f.get('message')}`
      location.href = `mailto:${P.links.email}?subject=${encodeURIComponent('Portfolio enquiry: ' + f.get('reason'))}&body=${encodeURIComponent(body)}`
      return
    }
    setBusy(true); setStatus({ msg: '> TRANSMITTING…' })
    try {
      // Apps Script sends no CORS headers, so the response is opaque (no-cors).
      await fetch(P.contact.formUrl, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(f as unknown as Record<string, string>) })
      form.reset(); setStatus({ msg: '> MESSAGE RECEIVED. I will get back to you soon.' })
    } catch {
      setStatus({ msg: `> TRANSMISSION FAILED. Email me at ${P.links.email}`, bad: true })
    }
    setBusy(false)
  }

  return (
    <div className="glass rounded-sm p-6">
      <p className="font-mono text-[10px] tracking-[0.3em] text-slate-500">CHAPTER VI</p>
      <h2 className="text-3xl font-light text-white">Reach out to me!</h2>
      <p className="mt-1 text-sm text-slate-400">Discuss a project or just want to say hi? My inbox is open for all.</p>
      <ul className="my-4 grid grid-cols-3 gap-3 font-mono text-[11px]">
        <li className="rounded-sm border border-white/10 p-2"><span className="block text-[9px] tracking-[0.2em] text-slate-500">ROLE</span><span className="text-slate-200">{P.contact.role}</span></li>
        <li className="rounded-sm border border-white/10 p-2"><span className="block text-[9px] tracking-[0.2em] text-slate-500">LOCATION</span><span className="text-slate-200">{P.contact.location}</span></li>
        <li className="rounded-sm border border-white/10 p-2"><span className="block text-[9px] tracking-[0.2em] text-slate-500">OPEN FOR OPPORTUNITIES</span><span className="text-emerald-400">{P.contact.openToWork ? 'Yes' : 'No'}</span></li>
      </ul>
      <div className="mb-4 flex items-center gap-2 font-mono text-[11px] text-slate-400">
        <i className="h-2 w-2 rounded-full bg-red-400/80" /><i className="h-2 w-2 rounded-full bg-gold/80" /><i className="h-2 w-2 rounded-full bg-emerald-400/80" />
        <span className="ml-2 tracking-[0.2em]">tarun@core:~$ ./contact {P.contact.openToWork && <span className="text-emerald-400">--open-to-work</span>}</span>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className={label} htmlFor="fn">FIRST_NAME</label><input id="fn" name="firstName" required maxLength={60} className={field} /></div>
          <div><label className={label} htmlFor="ln">LAST_NAME</label><input id="ln" name="lastName" required maxLength={60} className={field} /></div>
          <div><label className={label} htmlFor="em">EMAIL</label><input id="em" name="email" type="email" required maxLength={120} className={field} /></div>
          <div><label className={label} htmlFor="ph">PHONE</label><input id="ph" name="phone" type="tel" required maxLength={30} pattern="[0-9+()\- ]{6,}" className={field} /></div>
        </div>
        <div>
          <label className={label} htmlFor="rs">REASON</label>
          <select id="rs" name="reason" required defaultValue="" className={field}>
            <option value="" disabled>Choose a reason…</option>
            {P.contact.reasons.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div><label className={label} htmlFor="ms">MESSAGE</label><textarea id="ms" name="message" required rows={4} maxLength={2000} className={field} /></div>
        {/* honeypot: hidden from humans, bots fill it */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" />
        <div className="flex flex-wrap items-center gap-4">
          <button disabled={busy} className="rounded-sm border border-gold/60 bg-gold/10 px-6 py-3 font-mono text-xs tracking-[0.3em] text-gold transition hover:bg-gold/20 disabled:opacity-50">
            {busy ? 'SENDING…' : 'TRANSMIT →'}
          </button>
          {P.bookCallUrl && <a href={P.bookCallUrl} target="_blank" rel="noopener" className="font-mono text-xs tracking-[0.25em] text-cyan hover:text-gold">BOOK A CALL</a>}
          <a href={asset(P.resumeUrl)} target="_blank" rel="noopener" className="font-mono text-xs tracking-[0.25em] text-cyan hover:text-gold">RESUME</a>
        </div>
        <p role="status" className={`font-mono text-xs ${status.bad ? 'text-red-400' : 'text-emerald-400'}`}>{status.msg}</p>
      </form>
      <div className="mt-5 flex flex-wrap gap-5 border-t border-white/10 pt-4 font-mono text-[11px] tracking-[0.2em] text-slate-400">
        <a className="hover:text-gold" href={P.links.github} target="_blank" rel="noopener">GITHUB</a>
        <a className="hover:text-gold" href={P.links.linkedin} target="_blank" rel="noopener">LINKEDIN</a>
        <a className="hover:text-gold" href={P.links.credly} target="_blank" rel="noopener">CREDLY</a>
        <a className="hover:text-gold" href={`mailto:${P.links.email}`}>{P.links.email}</a>
      </div>
      <p className="mt-4 font-mono text-[10px] text-slate-600">© {new Date().getFullYear()} {P.name}</p>
    </div>
  )
}
