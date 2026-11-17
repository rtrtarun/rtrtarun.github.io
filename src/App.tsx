import RagField from './ui/RagField'
import Hud from './ui/Hud'
import { Contact, Development, Experience, Labs, Landing } from './ui/Sections'
import { useScrollRig } from './lib/useScrollRig'

export default function App() {
  useScrollRig()
  return (
    <div className="scanlines">
      <RagField />
      <Hud />
      {/* Scroll track. Each section's content sits over the fixed vector-search canvas. */}
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
