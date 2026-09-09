import { useCallback, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AuthContext } from '../contexts/AuthContext'
import { APP_EVENTS, QUERY_KEYS, STORAGE_KEYS } from '../constants'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { queryClient } from '../lib/queryClient'
import { api } from '../services/api'
import { connectRealtime, disconnectRealtime, subscribeToUserNotifications } from '../services/echo'

/**
 * Provides the auth context backed by the backend API.
 *
 * - Token is persisted in localStorage and attached by the axios interceptor.
 * - The authenticated user is hydrated from GET /auth/me via React Query.
 * - login()/logout() are consumed through module mutations (useLogin/useLogout).
 */
export default function AuthProvider({ children }) {
  const [token, setToken] = useLocalStorage(STORAGE_KEYS.token, null)

  const meQuery = useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: () => api.get('/auth/me'),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  })

  // A 401 anywhere (expired/revoked token) drops the session immediately.
  useEffect(() => {
    const onUnauthorized = () => setToken(null)

    window.addEventListener(APP_EVENTS.unauthorized, onUnauthorized)

    return () => window.removeEventListener(APP_EVENTS.unauthorized, onUnauthorized)
  }, [setToken])

  useEffect(() => {
    const userId = meQuery.data?.data?.id

    if (!token || !userId) {
      disconnectRealtime()
      return undefined
    }

    connectRealtime(token)
    const unsubscribe = subscribeToUserNotifications(userId, (event) => {
      window.dispatchEvent(new CustomEvent(APP_EVENTS.realtimeNotification, { detail: event }))
    })

    return () => {
      unsubscribe()
      disconnectRealtime()
    }
  }, [token, meQuery.data?.data?.id])

  const login = useCallback(
    async (credentials) => {
      const response = await api.post('/auth/login', credentials)

      // Hydrate the "me" query with the login payload so no extra round-trip.
      // Shape it like GET /auth/me (envelope with `data` = the user) — the
      // rest of the app reads `meQuery.data.data` as the user object.
      queryClient.setQueryData(QUERY_KEYS.auth.me, {
        ...response,
        data: response.data.user,
      })
      setToken(response.data.token)

      return response.data
    },
    [setToken],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // The token may already be invalid server-side — always clear locally.
    } finally {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.all })
      setToken(null)
    }
  }, [setToken])

  const user = meQuery.data?.data ?? null
  const isAuthenticated = Boolean(token && user)
  const isLoading = Boolean(token) && meQuery.isPending

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
