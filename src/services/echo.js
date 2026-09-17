import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { APP_CONFIG } from '../app/config'

window.Pusher = Pusher

let echo = null

export function connectRealtime(token) {
  disconnectRealtime()

  if (!token || !APP_CONFIG.realtime.key) return null

  const isSecure = APP_CONFIG.realtime.scheme === 'https'
  echo = new Echo({
    broadcaster: 'reverb',
    key: APP_CONFIG.realtime.key,
    wsHost: APP_CONFIG.realtime.host,
    wsPort: APP_CONFIG.realtime.port,
    wssPort: APP_CONFIG.realtime.port,
    forceTLS: isSecure,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${APP_CONFIG.apiBaseUrl.replace(/\/api\/?$/, '')}/api/broadcasting/auth`,
    auth: {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  })

  return echo
}

export function disconnectRealtime() {
  echo?.disconnect()
  echo = null
}

export function getRealtime() {
  return echo
}

const ADMIN_DATA_CHANNEL = 'admin.data'
const ADMIN_DATA_EVENT = '.admin.data.changed'

/**
 * Listen for "admin data changed" signals. `onLiveChange(isLive)` reports
 * whether events can currently arrive (socket connected and channel joined),
 * so callers can fall back to polling when they cannot.
 */
export function subscribeToAdminDataChanges({ onChange, onLiveChange }) {
  if (!echo) {
    onLiveChange(false)
    return () => {}
  }

  const connection = echo.connector.pusher.connection
  let connected = connection.state === 'connected'
  let subscribed = false
  const report = () => onLiveChange(connected && subscribed)

  const handleStateChange = ({ current }) => {
    connected = current === 'connected'
    if (!connected) subscribed = false
    report()
  }
  connection.bind('state_change', handleStateChange)

  const channel = echo.private(ADMIN_DATA_CHANNEL)
  channel
    .subscribed(() => {
      subscribed = true
      report()
    })
    .error(() => {
      subscribed = false
      report()
    })
    .listen(ADMIN_DATA_EVENT, onChange)

  report()

  return () => {
    connection.unbind('state_change', handleStateChange)
    channel.stopListening(ADMIN_DATA_EVENT)
  }
}

export function subscribeToUserNotifications(userId, onNotification) {
  if (!echo || !userId) return () => {}

  const channel = echo.private(`App.Models.User.${userId}`)
  channel.listen('.client.notification.created', onNotification)

  return () => channel.stopListening('.client.notification.created')
}
