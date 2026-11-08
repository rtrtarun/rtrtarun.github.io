// Resolve a public/ file against the Vite base so it works at a domain root, a subpath, or file://.
export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, '')
