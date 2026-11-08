import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rig } from '../lib/rig'
import { paletteUniforms } from '../lib/palettes'
import { useUI } from '../lib/store'

const blendFor = (light: boolean) => (light ? THREE.NormalBlending : THREE.AdditiveBlending)
import { shellFrag, shellVert } from '../shaders/shell'
import {
  coreFrag, coreVert, edgeFrag, edgeVert, nodeFrag, nodeVert,
} from '../shaders/neural'

const damp = THREE.MathUtils.damp

/** Mechanical "logic ring": torus body + instanced gear teeth. Represents system architecture. */
function GearRing({ radius, teeth, speed, tilt }: { radius: number; teeth: number; speed: number; tilt: [number, number, number] }) {
  const group = useRef<THREE.Group>(null!)
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const mat = useRef<THREE.MeshStandardMaterial>(null!)

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const setRef = (m: THREE.InstancedMesh | null) => {
    if (!m) return
    mesh.current = m
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2
      dummy.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0)
      dummy.rotation.set(0, 0, a)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }

  useFrame((s, dt) => {
    const hover = useUI.getState().hovered ? 2.6 : 1
    group.current.rotation.z += dt * speed * hover
    const k = 1 + rig.explode * 0.9
    group.current.scale.setScalar(damp(group.current.scale.x, k, 3, dt))
    mat.current.emissiveIntensity = 0.25 + Math.sin(s.clock.elapsedTime * 2 + radius) * 0.1 + rig.gold * 0.3
    mat.current.opacity = rig.shell * 0.85 + 0.15
  })

  return (
    <group rotation={tilt}>
      <group ref={group}>
        <mesh>
          <torusGeometry args={[radius, 0.018, 12, 160]} />
          <meshStandardMaterial ref={mat} color="#c9a24a" metalness={1} roughness={0.25} emissive="#ff9a1f" transparent />
        </mesh>
        <instancedMesh ref={setRef} args={[undefined, undefined, teeth]}>
          <boxGeometry args={[0.07, 0.11, 0.05]} />
          <meshStandardMaterial color="#d9b25a" metalness={1} roughness={0.3} emissive="#ff8a00" emissiveIntensity={0.15} />
        </instancedMesh>
      </group>
    </group>
  )
}

/** Thin orbital path with a satellite riding it. */
function Orbit({ radius, tilt, speed, phase = 0 }: { radius: number; tilt: [number, number, number]; speed: number; phase?: number }) {
  const sat = useRef<THREE.Mesh>(null!)
  const line = useMemo(() => {
    const pts = Array.from({ length: 129 }, (_, i) => {
      const a = (i / 128) * Math.PI * 2
      return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
    })
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: '#4aa8ff', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
  }, [radius])

  useFrame((s) => {
    const a = s.clock.elapsedTime * speed + phase
    sat.current.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius)
    const lm = line.material as THREE.LineBasicMaterial
    const lb = blendFor(useUI.getState().theme === 'light')
    if (lm.blending !== lb) { lm.blending = lb; lm.needsUpdate = true }
    lm.opacity = useUI.getState().theme === 'light' ? 0.7 : 0.35
    lm.color.copy(paletteUniforms.uPB.value).lerp(paletteUniforms.uPC.value, rig.gold)
  })

  return (
    <group rotation={tilt}>
      <primitive object={line} />
      <mesh ref={sat}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Inner bioluminescent core + neural graph (nodes, edges, travelling pulses). */
function NeuralCore({ uniforms, blend }: { uniforms: Record<string, THREE.IUniform>; blend: THREE.Blending }) {
  const { nodePositions, edgeGeo, nodeGeo } = useMemo(() => {
    const N = 64
    const pos: THREE.Vector3[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      const rad = 0.78 + Math.random() * 0.25
      pos.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(rad))
    }
    // connect each node to its 3 nearest neighbours
    const ep: number[] = [], eph: number[] = [], et: number[] = []
    const seen = new Set<string>()
    pos.forEach((p, i) => {
      pos.map((q, j) => ({ j, d: p.distanceTo(q) }))
        .filter((o) => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 3)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`
          if (seen.has(key)) return
          seen.add(key)
          const ph = Math.random()
          const q = pos[j]
          ep.push(p.x, p.y, p.z, q.x, q.y, q.z)
          eph.push(ph, ph)
          et.push(0, 1)
        })
    })
    const edgeGeo = new THREE.BufferGeometry()
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(ep, 3))
    edgeGeo.setAttribute('aPhase', new THREE.Float32BufferAttribute(eph, 1))
    edgeGeo.setAttribute('aT', new THREE.Float32BufferAttribute(et, 1))

    const nodeGeo = new THREE.BufferGeometry().setFromPoints(pos)
    nodeGeo.setAttribute('aPhase', new THREE.Float32BufferAttribute(pos.map(() => Math.random()), 1))
    nodeGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(pos.map((_, i) => i), 1))
    return { nodePositions: pos, edgeGeo, nodeGeo }
  }, [])
  void nodePositions

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.55, 24]} />
        <shaderMaterial vertexShader={coreVert} fragmentShader={coreFrag} uniforms={uniforms} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <shaderMaterial
          vertexShader={edgeVert} fragmentShader={edgeFrag} uniforms={uniforms}
          transparent depthWrite={false} blending={blend}
        />
      </lineSegments>
      <points geometry={nodeGeo}>
        <shaderMaterial
          vertexShader={nodeVert} fragmentShader={nodeFrag} uniforms={uniforms}
          transparent depthWrite={false} blending={blend}
        />
      </points>
    </group>
  )
}

export default function Core() {
  const root = useRef<THREE.Group>(null!)
  const shellMat = useRef<THREE.ShaderMaterial>(null!)
  const wire = useRef<THREE.MeshBasicMaterial>(null!)
  const hoverV = useRef(0)
  const setHovered = useUI((s) => s.setHovered)
  const blend = blendFor(useUI((s) => s.theme === 'light'))

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uExplode: { value: 0 },
    uGold: { value: 0 },
    uHover: { value: 0 },
    uOpacity: { value: 1 },
    uActive: { value: -1 },
    ...paletteUniforms,
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  }), [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const hovered = useUI.getState().hovered
    hoverV.current = damp(hoverV.current, hovered ? 1 : 0, 4, dt)

    uniforms.uTime.value = t
    uniforms.uHover.value = hoverV.current
    uniforms.uExplode.value = damp(uniforms.uExplode.value, rig.explode, 4, dt)
    uniforms.uGold.value = damp(uniforms.uGold.value, rig.gold, 3, dt)
    uniforms.uOpacity.value = rig.shell
    uniforms.uActive.value = Math.floor(t * 0.8) % 64 // cycles a "focused" node; swap for click-selection later
    if (wire.current) {
      wire.current.opacity = (useUI.getState().theme === 'light' ? 0.3 : 0.12) * rig.shell
      wire.current.color.copy(paletteUniforms.uPB.value).lerp(paletteUniforms.uPC.value, rig.gold)
    }

    // hover/rotate: core leans toward the pointer with inertia, idles with a slow spin
    const g = root.current
    g.rotation.y += dt * (0.12 + hoverV.current * 0.5)
    g.rotation.x = damp(g.rotation.x, -state.pointer.y * 0.35, 2.5, dt)
    g.rotation.z = damp(g.rotation.z, state.pointer.x * 0.15, 2.5, dt)
    g.position.y = Math.sin(t * 0.6) * 0.08
  })

  return (
    <group ref={root}>
      <NeuralCore uniforms={uniforms} blend={blend} />

      {/* glass shell + geodesic wireframe */}
      <mesh>
        <icosahedronGeometry args={[1.45, 10]} />
        <shaderMaterial
          ref={shellMat} vertexShader={shellVert} fragmentShader={shellFrag} uniforms={uniforms}
          transparent depthWrite={false} blending={blend}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.47, 2]} />
        <meshBasicMaterial ref={wire} color="#6fb6ff" wireframe transparent opacity={0.12} depthWrite={false} blending={blend} />
      </mesh>

      {/* system-architecture rings */}
      <GearRing radius={1.85} teeth={48} speed={0.18} tilt={[Math.PI / 2.2, 0, 0]} />
      <GearRing radius={2.25} teeth={64} speed={-0.12} tilt={[0.4, 0.3, 0.9]} />
      <GearRing radius={2.65} teeth={80} speed={0.08} tilt={[-0.6, 0, 0.3]} />

      <Orbit radius={3.1} tilt={[0.5, 0, 0.2]} speed={0.35} />
      <Orbit radius={3.6} tilt={[-0.9, 0, 0.5]} speed={-0.25} phase={2} />
      <Orbit radius={4.2} tilt={[0.2, 0, -0.7]} speed={0.18} phase={4} />

      {/* invisible hit-sphere so hover is generous and cheap to raycast */}
      <mesh
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
      >
        <sphereGeometry args={[2.3, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}
