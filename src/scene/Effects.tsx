import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { rig } from '../lib/rig'
import { useUI } from '../lib/store'

export default function Effects() {
  const light = useUI((s) => s.theme === 'light')
  const bloom = useRef<any>(null)
  const ca = useRef<any>(null)
  const last = useRef(new THREE.Vector2())

  useFrame(({ pointer }, dt) => {
    // bloom follows the scroll-driven rig; chromatic aberration kicks with pointer velocity
    if (bloom.current) bloom.current.intensity = THREE.MathUtils.damp(bloom.current.intensity, 1.3 * rig.bloom * (useUI.getState().theme === 'light' ? 0.25 : 1), 3, dt)
    if (ca.current) {
      const v = pointer.distanceTo(last.current)
      last.current.copy(pointer)
      const o = ca.current.offset as THREE.Vector2
      const k = 0.0005 + Math.min(v * 0.02, 0.004)
      o.set(THREE.MathUtils.damp(o.x, k, 6, dt), THREE.MathUtils.damp(o.y, k, 6, dt))
    }
  })

  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.25} luminanceSmoothing={0.2} intensity={1.3} radius={0.8} />
      <DepthOfField target={[0, 0, 0]} focalLength={0.06} bokehScale={3.2} height={480} />
      <ChromaticAberration ref={ca} offset={new THREE.Vector2(0.0005, 0.0005)} radialModulation modulationOffset={0.3} />
      {/* tone-map BEFORE noise: SOFT_LIGHT on HDR (>1) values inverts colours -> speckled heat-map look */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.12} />
      <Vignette eskil={false} offset={0.2} darkness={light ? 0.2 : 0.9} />
    </EffectComposer>
  )
}
