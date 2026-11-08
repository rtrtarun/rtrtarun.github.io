import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { useUI } from '../lib/store'
import Core from './Core'
import CameraRig from './CameraRig'
import Effects from './Effects'
import { FogDome, GridFloor, Particles } from './Environment3D'

export default function Scene() {
  const light = useUI((s) => s.theme === 'light')
  const bg = light ? '#e8eef8' : '#02040a'
  return (
    <Canvas
      className="!fixed inset-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 9.5], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
      // events are read from <body> so the glass HUD on top never blocks hover/pointer on the core
      eventSource={document.body}
      eventPrefix="client"
    >
      <color key={bg} attach="background" args={[bg]} />
      <fogExp2 key={bg} attach="fog" args={[bg, light ? 0.012 : 0.035]} />

      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={14} color="#4aa8ff" distance={12} />
      <pointLight position={[6, 4, 5]} intensity={40} color="#ffb840" distance={25} />

      {/* procedural IBL (no network HDR) so the metal gears have something to reflect */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="ring" intensity={4} color="#6fb6ff" scale={8} position={[0, 0, -6]} />
        <Lightformer intensity={3} color="#ffb840" scale={[10, 2, 1]} position={[-6, 3, 4]} rotation-y={Math.PI / 3} />
      </Environment>

      <Suspense fallback={null}>
        <FogDome />
        <GridFloor />
        <Particles />
        <Core />
      </Suspense>

      <CameraRig />
      <Effects />
    </Canvas>
  )
}
