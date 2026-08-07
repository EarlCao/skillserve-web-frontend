import { useMemo, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'

/**
 * Provides the auth context.
 *
 * Phase 0: exposes the shape only. Phase 1 will wire login/logout to the
 * backend API and populate `user`.
 */
export default function AuthProvider({ children }) {
  // Phase 1 will wire the setters when login/logout flows are implemented.
  const [user] = useState(null)
  const [isLoading] = useState(false)

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login: async () => {
        throw new Error('login() is not implemented yet (Phase 1).')
      },
      logout: async () => {
        throw new Error('logout() is not implemented yet (Phase 1).')
      },
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
