import { create } from 'zustand'

export const SECTIONS = [
  { id: 'core', code: '00', title: 'THE CORE', sub: 'Landing' },
  { id: 'experience', code: '01', title: 'THE COGNITIVE ENGINE', sub: 'AI · Experience' },
  { id: 'development', code: '02', title: 'THE SYSTEM PIPELINE', sub: 'Full Stack · SDE' },
  { id: 'labs', code: '03', title: 'THE EXPERIMENTS', sub: 'Labs' },
  { id: 'contact', code: '04', title: 'CONSOLE', sub: 'Contact' },
] as const

interface UI {
  section: number
  hovered: boolean
  entered: boolean
  palette: string
  theme: 'dark' | 'light'
  setSection: (n: number) => void
  setHovered: (h: boolean) => void
  setEntered: (e: boolean) => void
}

export const useUI = create<UI>((set) => ({
  section: 0,
  hovered: false,
  entered: false,
  palette: 'core',
  theme: 'dark',
  setSection: (section) => set({ section }),
  setHovered: (hovered) => set({ hovered }),
  setEntered: (entered) => set({ entered }),
}))
