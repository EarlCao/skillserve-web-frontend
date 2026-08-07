import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/AuthContext'

/**
 * Logout mutation. AuthProvider.logout invalidates the server token and
 * clears the local session; the RequireAuth guard then redirects to /login.
 */
export function useLogout() {
  const { logout } = useAuth()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success('Signed out successfully.')
    },
    onError: () => {
      // The local session is still cleared by the provider; nothing to show.
    },
  })
}
