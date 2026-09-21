import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { z } from 'zod'
import './index.css'
import AppProvider from './providers'
import { router } from './routes'
import ErrorBoundary from './components/feedback/ErrorBoundary'

// Zod otherwise compiles validators with `new Function`, which the production
// Content-Security-Policy (no 'unsafe-eval') forbids.
z.config({ jitless: true })

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  } else {
    // The worker caches responses; in development it would serve stale Vite
    // modules (old HMR client, mixed React copies). Remove any leftover worker.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister())
    })
  }
}

// Route pages are lazy chunks. After a deploy, a tab still running the old
// build asks for chunk names that no longer exist; reload to pick up the new one.
// At most once a minute, so a chunk that is genuinely broken reaches the error
// boundary instead of reloading forever.
window.addEventListener('vite:preloadError', (event) => {
  try {
    const lastReload = Number(sessionStorage.getItem('chunk-reload-at') ?? 0)
    if (Date.now() - lastReload < 60_000) return
    sessionStorage.setItem('chunk-reload-at', String(Date.now()))
  } catch {
    return
  }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
)
