import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Browsers block <script type="module"> and crossorigin CSS when a page is opened straight from disk (file://).
// Emit a classic deferred script instead, so dist/index.html also works when double-clicked.
const fileProtocolFriendly = (): Plugin => ({
  name: 'file-protocol-friendly',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      const scripts: string[] = []
      html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_m, src) => {
        scripts.push(`<script defer src="${src}"></script>`)
        return ''
      })
      html = html.replace(/ crossorigin(="[^"]*")?/g, '')
      return html.replace('</head>', scripts.join('\n') + '\n</head>')
    },
  },
})

export default defineConfig(({ command }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(command === 'build' ? [fileProtocolFriendly()] : [])],
  build: {
    chunkSizeWarningLimit: 1500,
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
  },
}))
