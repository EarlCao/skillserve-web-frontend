import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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
