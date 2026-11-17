// Mutable state shared between the canvas (writes every frame) and the HUD (reads on a timer).
export interface Hit { label: string; cluster: string; sim: number }

export const retrieval: { query: string; hits: Hit[] } = { query: '', hits: [] }
