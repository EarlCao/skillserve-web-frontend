import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi } from '../api/authApi'

/**
 * Change-password mutation.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully.')
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to change the password.')
    },
  })
}
