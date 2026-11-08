import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { rig } from './rig'
import { SECTIONS, useUI } from './store'

gsap.registerPlugin(ScrollTrigger)

export let lenis: Lenis | null = null

/**
 * Lenis smooth scroll drives GSAP ScrollTrigger; a single scrubbed timeline
 * animates the shared `rig` object (camera path, explode, palette) across the 5 scenes.
 */
export function useScrollRig() {
  useEffect(() => {
    lenis = new Lenis({ lerp: 0.085 })
    lenis.stop() // locked on the landing screen until "ENTER THE SYSTEM"
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis!.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Camera/palette keyframes per scene. Each transition is scrubbed while that
    // section scrolls into view, so it stays in sync with variable-height content.
    const KF = [
      { cx: 0, cy: 0.4, cz: 9.5, lookY: 0, explode: 0, shell: 1, gold: 0, bloom: 1 },     // 00 core
      { cx: 0, cy: 0, cz: 2.6, lookY: 0, explode: 1, shell: 0.15, gold: 0, bloom: 1.2 },  // 01 dive inside, explode to node graph
      { cx: 0, cy: 2.5, cz: -9, lookY: -1, explode: 1, shell: 0, gold: 1, bloom: 0.9 },   // 02 fly past, industrial gold
      { cx: 6, cy: 1, cz: 7, lookY: 0, explode: 0.2, shell: 0.8, gold: 0.3, bloom: 1 },   // 03 labs
      { cx: 0, cy: 0.5, cz: 15, lookY: 0, explode: 0, shell: 1, gold: 0, bloom: 0.6 },    // 04 contact
    ]
    const tweens = SECTIONS.slice(1).map((s, i) =>
      gsap.fromTo(rig, KF[i], {
        ...KF[i + 1], ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: `#${s.id}`, start: 'top bottom', end: 'top top', scrub: 1 },
      }),
    )
    const triggers = SECTIONS.map((s, i) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`, start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => { if (self.isActive) useUI.getState().setSection(i) },
      }),
    )

    return () => {
      tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill() })
      triggers.forEach((t) => t.kill())
      gsap.ticker.remove(tick)
      lenis?.destroy(); lenis = null
    }
  }, [])
}

/** Jump to any scene. Unlocks scrolling first, so nav tabs work even before ENTER THE SYSTEM. */
export function goTo(id: string, duration = 2.2) {
  useUI.getState().setEntered(true)
  lenis?.start()
  lenis?.scrollTo(`#${id}`, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) })
}

/** ENTER THE SYSTEM: glide to the first scene. */
export const enterSystem = () => goTo('experience', 2.8)
