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
  optimizeDeps: {
    // The React Compiler injects this import during transform, so the dependency
    // scanner misses it. Pre-bundle it with React to avoid a late re-optimization
    // that can load two React copies ("Invalid hook call").
    include: ['react/compiler-runtime'],
  },
})
