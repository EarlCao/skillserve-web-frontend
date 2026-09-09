/**
 * App-level configuration.
 *
 * Vite only exposes variables prefixed with VITE_ to the client. Set these
 * in a frontend .env file when needed (e.g. .env.local).
 */
export const APP_CONFIG = {
  name: 'SkillServe',
  version: '0.1.0',
  isDev: import.meta.env.DEV,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  realtime: {
    key: import.meta.env.VITE_REVERB_APP_KEY ?? '',
    host: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
    port: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    scheme: import.meta.env.VITE_REVERB_SCHEME ?? 'http',
  },
}
