import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { SECTIONS, useUI } from './store'

gsap.registerPlugin(ScrollTrigger)

export let lenis: Lenis | null = null

/**
 * Lenis smooth scroll drives GSAP ScrollTrigger, which tracks the active section.
 */
export function useScrollRig() {
  useEffect(() => {
    lenis = new Lenis({ lerp: 0.085 })
    lenis.stop() // locked on the landing screen until "ENTER THE SYSTEM"
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis!.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const triggers = SECTIONS.map((s, i) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`, start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => { if (self.isActive) useUI.getState().setSection(i) },
      }),
    )

    return () => {
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
