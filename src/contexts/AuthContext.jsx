import { createContext, useContext } from 'react'

/**
 * Authentication context — Phase 0 skeleton only.
 *
 * Phase 1 (Authentication & Authorization) will implement the login/logout
 * flows; feature code should already consume this context through useAuth().
 */
export const AuthContext = createContext(null)

/**
 * Access the auth state. Must be used inside <AuthProvider>.
 *
 * @returns {{
 *   user: object | null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   login: (credentials: object) => Promise<unknown>,
 *   logout: () => Promise<unknown>,
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within <AuthProvider>.')
  }

  return context
}
