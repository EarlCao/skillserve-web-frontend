/**
 * App-level configuration.
 *
 * Vite only exposes variables prefixed with VITE_ to the client. Set these
 * in a frontend .env file when needed (e.g. .env.local).
 *
 * The API base URL is resolved dynamically so the admin panel works from
 * both localhost (desktop dev) and any LAN IP (mobile / other devices).
 * When VITE_API_BASE_URL is set it takes precedence; otherwise the
 * current page hostname is used with port 8000.
 */
function resolveApiBaseUrl() {
  const explicit = import.meta.env.VITE_API_BASE_URL
  if (explicit) return explicit

  const { hostname, protocol } = window.location

  // localhost / 127.0.0.1 → keep the dev default
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api'
  }

  // Any other host (e.g. WSL IP, LAN IP, domain) → same host, port 8000
  return `${protocol}//${hostname}:8000/api`
}

function resolveRealtime() {
  const { hostname, protocol } = window.location
  const wsScheme = protocol === 'https:' ? 'wss' : 'ws'

  return {
    key: import.meta.env.VITE_REVERB_APP_KEY ?? '5854c89dcedeece0181cb0c6cb75c711',
    host: import.meta.env.VITE_REVERB_HOST || (hostname === 'localhost' || hostname === '127.0.0.1' ? 'localhost' : hostname),
    port: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    scheme: import.meta.env.VITE_REVERB_SCHEME ?? (wsScheme === 'wss' ? 'https' : 'http'),
  }
}

export const APP_CONFIG = {
  name: 'SkillServe',
  version: '0.1.0',
  isDev: import.meta.env.DEV,
  apiBaseUrl: resolveApiBaseUrl(),
  realtime: resolveRealtime(),
}
