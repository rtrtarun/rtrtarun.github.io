// Mutable animation state. GSAP tweens these values on scroll; R3F reads them every frame
// (no React re-renders in the hot path).
export const rig = {
  cx: 0, cy: 0.4, cz: 9.5, // camera position (before mouse inertia)
  lookY: 0,
  explode: 0,              // 0 = sealed core, 1 = exploded node graph
  shell: 1,                // outer glass shell visibility
  gold: 0,                 // 0 = cold blue palette, 1 = cyber-gold palette
  bloom: 1,
}
