import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/AuthContext'

/**
 * Login mutation. Delegates to AuthProvider.login (which stores the token
 * and hydrates the authenticated user) and surfaces toasts.
 */
export function useLogin() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data?.user?.name ?? 'administrator'}!`)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to sign in. Please try again.')
    },
  })
}
