import { useEffect, useState, useCallback } from 'react'

/**
 * Tracks the browser's online/offline status and exposes a `refetch`
 * function that pings the backend health endpoint to verify actual
 * connectivity (the browser `navigator.onLine` flag only checks
 * whether a network interface is available, not whether the API is
 * reachable).
 *
 * @returns {{ isOnline, isChecking, lastCheckedAt, checkConnection }}
 */
export function useNetworkStatus({ healthUrl = '/api/health', pollInterval = 30_000 } = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState(null)

  const checkConnection = useCallback(async () => {
    setIsChecking(true)
    try {
      const res = await fetch(healthUrl, { method: 'GET', cache: 'no-store' })
      setIsOnline(res.ok)
    } catch {
      setIsOnline(false)
    } finally {
      setLastCheckedAt(new Date())
      setIsChecking(false)
    }
  }, [healthUrl])

  useEffect(() => {
    const handleOnline = () => checkConnection()
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    checkConnection()

    const interval = setInterval(checkConnection, pollInterval)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [checkConnection, pollInterval])

  return { isOnline, isChecking, lastCheckedAt, checkConnection }
}
