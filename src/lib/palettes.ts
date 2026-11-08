import * as THREE from 'three'
import { useUI } from './store'

export interface Palette {
  id: string
  name: string
  /** 3D: cool base, cool highlight, warm accent (fed to every shader as uniforms) */
  a: string
  b: string
  c: string
}

// Same idea as the old site's themes (Forest, Violet, Ocean, Rose, Amber), plus the default "Core".
// UI colours for each live in index.css under [data-palette="..."].
export const PALETTES: Palette[] = [
  { id: 'core', name: 'Core', a: '#2a85ff', b: '#40e5ff', c: '#ffb840' },
  { id: 'forest', name: 'Forest', a: '#1fa86a', b: '#6ee7a8', c: '#d9c35a' },
  { id: 'violet', name: 'Violet', a: '#7c5cff', b: '#c084fc', c: '#ff9ad5' },
  { id: 'ocean', name: 'Ocean', a: '#1e6fff', b: '#22d3ee', c: '#5eead4' },
  { id: 'rose', name: 'Rose', a: '#e11d6a', b: '#fb7185', c: '#ffc27a' },
  { id: 'amber', name: 'Amber', a: '#f59e0b', b: '#fde047', c: '#ff7a3d' },
]

/** Shared uniform objects: spread into every ShaderMaterial so one change recolours the whole scene. */
export const paletteUniforms = {
  uPA: { value: new THREE.Color() },
  uPB: { value: new THREE.Color() },
  uPC: { value: new THREE.Color() },
  uLight: { value: 0 }, // 0 = dark theme, 1 = light theme
}

// shaders treat these as final display colours, so skip the sRGB -> linear conversion
const put = (u: { value: THREE.Color }, hex: string) => u.value.setHex(parseInt(hex.slice(1), 16), THREE.LinearSRGBColorSpace)

export function setPalette(id: string) {
  const p = PALETTES.find((x) => x.id === id) ?? PALETTES[0]
  put(paletteUniforms.uPA, p.a); put(paletteUniforms.uPB, p.b); put(paletteUniforms.uPC, p.c)
  document.documentElement.dataset.palette = p.id
  try { localStorage.setItem('palette', p.id) } catch { /* private mode */ }
  useUI.setState({ palette: p.id })
}

export function initPalette() {
  let saved = 'core'
  try { saved = localStorage.getItem('palette') || 'core' } catch { /* ignore */ }
  setPalette(saved)
}

export function setTheme(t: 'dark' | 'light') {
  document.documentElement.dataset.theme = t
  paletteUniforms.uLight.value = t === 'light' ? 1 : 0
  try { localStorage.setItem('theme', t) } catch { /* private mode */ }
  useUI.setState({ theme: t })
}

export function initTheme() {
  let saved: string | null = null
  try { saved = localStorage.getItem('theme') } catch { /* ignore */ }
  setTheme(saved === 'light' ? 'light' : 'dark')
}
