import { QUERY_KEYS } from '../constants'
import { queryClient } from '../lib/queryClient'
import { subscribeToAdminDataChanges } from './echo'

/** Refetch interval for open pages while live events cannot arrive. */
const FALLBACK_POLL_MS = 15_000

/** Bursts of change events within this window trigger a single refetch. */
const BATCH_MS = 300

/**
 * Cached queries each backend resource can affect (resource names come from
 * the backend RealtimeChangeTracker). Only mounted queries actually refetch.
 */
const RESOURCE_QUERY_KEYS = {
  users: [QUERY_KEYS.users.all, QUERY_KEYS.administrators.all, QUERY_KEYS.providers.all, QUERY_KEYS.supportTickets.all],
  roles: [QUERY_KEYS.roles.all, QUERY_KEYS.permissions.all, QUERY_KEYS.administrators.all, QUERY_KEYS.auth.me],
  providers: [QUERY_KEYS.providers.all, QUERY_KEYS.providerRecognition.all],
  'provider-recognition': [QUERY_KEYS.providerRecognition.all],
  'service-categories': [QUERY_KEYS.serviceCategories.all, QUERY_KEYS.services.all],
  services: [QUERY_KEYS.services.all, QUERY_KEYS.providerRecognition.all, QUERY_KEYS.dataManagement.all],
  bookings: [QUERY_KEYS.bookings.all, QUERY_KEYS.disputes.all],
  messages: [QUERY_KEYS.bookings.all, QUERY_KEYS.disputes.all, QUERY_KEYS.reports.all],
  reviews: [QUERY_KEYS.reviews.all, QUERY_KEYS.providerRecognition.all, QUERY_KEYS.services.all],
  reports: [QUERY_KEYS.reports.all],
  'support-tickets': [QUERY_KEYS.supportTickets.all],
  notifications: [QUERY_KEYS.notifications.all],
  settings: [QUERY_KEYS.settings.all],
  'data-management': [QUERY_KEYS.dataManagement.all],
  audit: [QUERY_KEYS.audit.all],
}

/** Aggregate views that any change can move. */
const ALWAYS_REFRESH = [QUERY_KEYS.dashboard.all, QUERY_KEYS.analytics.all]

function refreshAllData() {
  queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] !== QUERY_KEYS.auth.all[0],
  })
}

/**
 * Keep every open admin page current without manual refreshes.
 *
 * - Live: the backend pushes which resources changed; matching queries refetch.
 * - Not live (no WebSocket server, network drop, channel refused): open pages
 *   poll, and refresh when the tab becomes visible again.
 * - After reconnecting, everything refreshes to catch up on missed events.
 *
 * Returns a cleanup function.
 */
export function startLiveUpdates() {
  const pendingKeys = new Map()
  let batchTimer = null
  let isLive = false
  let wasEverLive = false

  const flushPending = () => {
    batchTimer = null
    pendingKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
    pendingKeys.clear()
  }

  const handleChange = ({ resources = [] } = {}) => {
    if (resources.some((resource) => !RESOURCE_QUERY_KEYS[resource])) {
      refreshAllData()
      return
    }

    const queryKeys = [...ALWAYS_REFRESH, ...resources.flatMap((resource) => RESOURCE_QUERY_KEYS[resource])]
    queryKeys.forEach((queryKey) => pendingKeys.set(JSON.stringify(queryKey), queryKey))
    batchTimer ??= setTimeout(flushPending, BATCH_MS)
  }

  const handleLiveChange = (live) => {
    if (live && !isLive && wasEverLive) refreshAllData()
    if (live) wasEverLive = true
    isLive = live
  }

  const pollTimer = setInterval(() => {
    if (!isLive && document.visibilityState === 'visible') refreshAllData()
  }, FALLBACK_POLL_MS)

  const handleVisibilityChange = () => {
    if (!isLive && document.visibilityState === 'visible') refreshAllData()
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  const unsubscribe = subscribeToAdminDataChanges({ onChange: handleChange, onLiveChange: handleLiveChange })

  return () => {
    unsubscribe()
    clearInterval(pollTimer)
    clearTimeout(batchTimer)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}
