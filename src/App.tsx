import Scene from './scene/Scene'
import Hud from './ui/Hud'
import { Contact, Development, Experience, Labs, Landing } from './ui/Sections'
import { useScrollRig } from './lib/useScrollRig'

export default function App() {
  useScrollRig()
  return (
    <div className="scanlines">
      <Scene />
      <Hud />
      {/* Scroll track. Each section's content sits over the fixed 3D canvas; its scroll position drives the camera. */}
      <main id="scroll-root" className="relative z-10">
        <Landing />
        <Experience />
        <Development />
        <Labs />
        <Contact />
      </main>
    </div>
  )
}
