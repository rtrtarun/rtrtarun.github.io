import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { rig } from '../lib/rig'
import { paletteUniforms } from '../lib/palettes'
import { useUI } from '../lib/store'

const useBlend = () => useUI((s) => (s.theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending))
import { particleFrag, particleVert } from '../shaders/particles'
import { gridFrag, gridVert } from '../shaders/grid'
import { fogFrag, fogVert } from '../shaders/neural'

const damp = THREE.MathUtils.damp

/** Shared smoothed pointer position in world space (on the z=0 plane and the floor plane). */
const mouseWorld = new THREE.Vector3(999, 999, 999)
const mouseFloor = new THREE.Vector3(999, 0, 999)
const ray = new THREE.Raycaster()
const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), 3.2)
const hit = new THREE.Vector3()

function useMouseWorld() {
  useFrame(({ pointer, camera }, dt) => {
    ray.setFromCamera(pointer, camera)
    if (ray.ray.intersectPlane(planeZ, hit)) mouseWorld.set(
      damp(mouseWorld.x, hit.x, 6, dt), damp(mouseWorld.y, hit.y, 6, dt), 0)
    if (ray.ray.intersectPlane(planeY, hit)) mouseFloor.set(
      damp(mouseFloor.x, hit.x, 6, dt), 0, damp(mouseFloor.z, hit.z, 6, dt))
  })
}

/** GPU particle field: curl-noise drift, vertical data streams, pointer repulsion. All in the vertex shader. */
export function Particles({ count = 14000 }: { count?: number }) {
  const blending = useBlend()
  const { geo, uniforms } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const rnd = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      // shell-biased distribution so the centre stays clear for the core
      const r = 3 + Math.pow(Math.random(), 0.7) * 13
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      pos.set([r * Math.sin(ph) * Math.cos(th), (Math.random() - 0.5) * 24, r * Math.sin(ph) * Math.sin(th)], i * 3)
      rnd.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))
    const uniforms = {
      uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uExplode: { value: 0 }, uGold: { value: 0 }, uMouse: { value: mouseWorld }, uMouseForce: { value: 1 }, ...paletteUniforms,
    }
    return { geo, uniforms }
  }, [count])

  useMouseWorld()
  useFrame(({ clock }, dt) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uExplode.value = damp(uniforms.uExplode.value, rig.explode, 3, dt)
    uniforms.uGold.value = damp(uniforms.uGold.value, rig.gold, 3, dt)
    uniforms.uMouseForce.value = damp(uniforms.uMouseForce.value, useUI.getState().entered ? 0.6 : 1, 3, dt)
  })

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        vertexShader={particleVert} fragmentShader={particleFrag} uniforms={uniforms}
        transparent depthWrite={false} blending={blending}
      />
    </points>
  )
}

/** Dynamic shader grid floor with pointer ripples. */
export function GridFloor() {
  const blending = useBlend()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uGold: { value: 0 }, uMouse: { value: mouseFloor }, ...paletteUniforms,
  }), [])
  useFrame(({ clock }, dt) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uGold.value = damp(uniforms.uGold.value, rig.gold, 3, dt)
  })
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -3.2, 0]}>
      <planeGeometry args={[120, 120]} />
      <shaderMaterial
        vertexShader={gridVert} fragmentShader={gridFrag} uniforms={uniforms}
        transparent depthWrite={false} blending={blending}
      />
    </mesh>
  )
}

/** Inside-out noise sphere gives the dark volumetric-fog backdrop. */
export function FogDome() {
  const light = useUI((s) => s.theme === 'light')
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uGold: { value: 0 }, ...paletteUniforms }), [])
  const camera = useThree((s) => s.camera)
  useFrame(({ clock }, dt) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uGold.value = damp(uniforms.uGold.value, rig.gold, 3, dt)
  })
  return (
    <mesh scale={60} position={camera.position} renderOrder={-1} visible={!light}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={fogVert} fragmentShader={fogFrag} uniforms={uniforms}
        side={THREE.BackSide} transparent depthWrite={false} blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
