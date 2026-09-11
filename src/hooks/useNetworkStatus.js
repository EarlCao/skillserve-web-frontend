import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Tracks the browser's online/offline status and pings the backend health
 * endpoint to verify actual connectivity (navigator.onLine only checks
 * whether a network interface is available, not whether the API is reachable).
 *
 * @returns {{ isOnline, isChecking, lastCheckedAt, checkConnection }}
 */
export function useNetworkStatus({ healthUrl = '/api/health', pollInterval = 30_000 } = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState(null)
  const mountedRef = useRef(true)

  const checkConnection = useCallback(async () => {
    setIsChecking(true)
    try {
      const res = await fetch(healthUrl, { method: 'GET', cache: 'no-store' })
      if (mountedRef.current) setIsOnline(res.ok)
    } catch {
      if (mountedRef.current) setIsOnline(false)
    } finally {
      if (mountedRef.current) {
        setLastCheckedAt(new Date())
        setIsChecking(false)
      }
    }
  }, [healthUrl])

  useEffect(() => {
    mountedRef.current = true

    const handleOnline = () => {
      // Defer the async check so React doesn't batch it with the event handler
      const id = setTimeout(checkConnection, 0)
      return () => clearTimeout(id)
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check — deferred to avoid setState-in-effect
    const initId = setTimeout(checkConnection, 0)

    const interval = setInterval(checkConnection, pollInterval)

    return () => {
      mountedRef.current = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearTimeout(initId)
      clearInterval(interval)
    }
  }, [checkConnection, pollInterval])

  return { isOnline, isChecking, lastCheckedAt, checkConnection }
}
