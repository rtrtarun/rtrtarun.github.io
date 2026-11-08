import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rig } from '../lib/rig'

const damp = THREE.MathUtils.damp
const target = new THREE.Vector3()

/**
 * Scroll (GSAP) writes the base camera position into `rig`.
 * Here we layer inertia-based mouse panning on top and look at the core.
 */
export default function CameraRig() {
  useFrame(({ camera, pointer }, dt) => {
    const px = pointer.x * 1.1
    const py = pointer.y * 0.6
    camera.position.x = damp(camera.position.x, rig.cx + px, 2.2, dt)
    camera.position.y = damp(camera.position.y, rig.cy + py, 2.2, dt)
    camera.position.z = damp(camera.position.z, rig.cz, 3.5, dt)
    target.set(0, rig.lookY, 0)
    camera.lookAt(target)
  })
  return null
}
