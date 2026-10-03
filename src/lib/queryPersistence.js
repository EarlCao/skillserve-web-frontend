import { defaultShouldDehydrateQuery, dehydrate, hydrate } from '@tanstack/react-query'
import { STORAGE_KEYS } from '../constants'

/**
 * Keeps the React Query cache across a page reload, so a refresh paints the
 * signed-in admin and the last-seen data at once instead of waiting on
 * GET /auth/me and every page request again. Restored data is marked stale,
 * so each mounted query still refetches in the background.
 *
 * sessionStorage, not localStorage: it is per-tab and gone when the tab
 * closes, so admin data does not linger on the machine.
 */
const SNAPSHOT_KEY = 'skillserve:query-cache'

/** Older snapshots are dropped rather than shown. */
const MAX_AGE_MS = 30 * 60_000

/** Same parsing as the axios interceptor: useLocalStorage stores JSON. */
function readToken() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.token))
    return typeof parsed === 'string' && parsed ? parsed : null
  } catch {
    return null
  }
}

/**
 * Identifies the login a snapshot belongs to without storing the secret:
 * Sanctum tokens are `<id>|<secret>`, and the id is not sensitive.
 */
function sessionTag(token) {
  return token.split('|')[0]
}

function clearSnapshot() {
  try {
    sessionStorage.removeItem(SNAPSHOT_KEY)
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

/** Loads the snapshot saved by the previous page in this tab, if it is ours. */
export function restoreQueryCache(queryClient) {
  const token = readToken()

  try {
    const snapshot = JSON.parse(sessionStorage.getItem(SNAPSHOT_KEY))

    if (!token || !snapshot) return
    if (snapshot.session !== sessionTag(token)) return
    if (Date.now() - snapshot.savedAt > MAX_AGE_MS) return

    hydrate(queryClient, snapshot.state)
    // A reload should still show current data: refetch everything once mounted.
    queryClient.invalidateQueries({ refetchType: 'none' })
  } catch {
    clearSnapshot()
  }
}

/** Saves the cache when the page goes away (reload, navigation, tab close). */
export function persistQueryCacheOnPageHide(queryClient) {
  window.addEventListener('pagehide', () => {
    const token = readToken()

    if (!token) {
      clearSnapshot()
      return
    }

    try {
      const state = dehydrate(queryClient, {
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) && !(query.state.data instanceof Blob),
        shouldDehydrateMutation: () => false,
      })

      sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ savedAt: Date.now(), session: sessionTag(token), state }))
    } catch {
      // Over the storage quota or storage disabled — the next load just fetches.
      clearSnapshot()
    }
  })
}
