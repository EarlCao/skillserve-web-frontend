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

export function subscribeToUserNotifications(userId, onNotification) {
  if (!echo || !userId) return () => {}

  const channel = echo.private(`App.Models.User.${userId}`)
  channel.listen('.client.notification.created', onNotification)

  return () => channel.stopListening('.client.notification.created')
}
