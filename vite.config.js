import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// Production-only Content-Security-Policy. The admin token lives in
// localStorage, so the page must never run script it did not ship: scripts
// come from this origin only, and nothing may be embedded from elsewhere.
// Dev is left alone (Vite's HMR needs inline script and a local websocket).
// Frame blocking (frame-ancestors / X-Frame-Options) must be a real header —
// see DEPLOYMENT.md → "Frontend — static site".
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  // Toast and chart libraries inject <style> tags at runtime.
  "style-src 'self' 'unsafe-inline'",
  // Profile photos, portfolio images and evidence come from the API host.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // The API and Reverb hosts differ per environment.
  "connect-src 'self' https: wss:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const contentSecurityPolicy = () => ({
  name: 'content-security-policy',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY }, injectTo: 'head-prepend' },
  ],
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    contentSecurityPolicy(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    hmr: {
      // On Windows + WSL, `localhost` resolves to ::1 first, which WSL does not
      // forward, so the HMR websocket fails. Connect over IPv4 explicitly.
      host: '127.0.0.1',
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Route pages are already lazy chunks (src/routes/lazyPages.jsx). Split
        // the shared runtime too, so no single chunk crosses Vite's 500 kB
        // warning and vendor code stays cached across app deploys.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'realtime', test: /node_modules[\\/](laravel-echo|pusher-js)[\\/]/ },
          ],
        },
      },
    },
  },
  optimizeDeps: {
    // The React Compiler injects this import during transform, so the dependency
    // scanner misses it. Pre-bundle it with React to avoid a late re-optimization
    // that can load two React copies ("Invalid hook call").
    include: ['react/compiler-runtime'],
  },
})
