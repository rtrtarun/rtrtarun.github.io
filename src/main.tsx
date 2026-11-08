import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initPalette, initTheme } from './lib/palettes'

initPalette()
initTheme()

createRoot(document.getElementById('root')!).render(<App />)
