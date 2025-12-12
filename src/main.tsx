import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/custom.css'
import './styles/fonts.css'
import './styles/animations.css'
import './styles/internal.css'
import './styles/index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
