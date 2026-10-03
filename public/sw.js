// Bump versions to purge caches written by older workers on activate.
const STATIC_CACHE = 'skillserve-static-v2'
const API_CACHE = 'skillserve-api-v2'
// Content-hashed build output (/assets/*): a file name never changes content.
const ASSET_CACHE = 'skillserve-assets-v1'
// Each deploy adds new hashed files; keep the newest ones only.
const MAX_ASSET_ENTRIES = 150

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
]

// Install — precache critical static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, API_CACHE, ASSET_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  )
})

// Fetch — network-first everywhere; the cache is only an offline fallback.
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // API requests: network-first with short timeout, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirst(request, API_CACHE, 5000),
    )
    return
  }

  // Leave other cross-origin requests (fonts, CDNs) to the browser.
  if (url.origin !== self.location.origin) return

  // Hashed build assets: cache-first, so a reload doesn't re-request every
  // chunk. A deploy ships new file names, which miss the cache and are fetched.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirstAsset(request))
    return
  }

  // App shell: network-first so a new deploy is picked up
  // immediately (cache-first kept serving an index.html that referenced
  // assets which no longer exist).
  event.respondWith(
    networkFirstStatic(request, STATIC_CACHE),
  )
})

async function cacheFirstAsset(request) {
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    // A missing file can come back as the SPA rewrite (index.html, status 200);
    // never store that under an asset name.
    const isHtml = response.headers.get('Content-Type')?.includes('text/html')
    if (response.ok && !isHtml) {
      await cache.put(request, response.clone())
      trimCache(cache, MAX_ASSET_ENTRIES)
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys()
  // keys() lists entries oldest first.
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map((key) => cache.delete(key)))
}

async function networkFirstStatic(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/')
      return offlineResponse || new Response('Offline', { status: 503 })
    }
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request, cacheName, timeout) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(request, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
