import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

/**
 * Ask for a reset link. The API answers the same way for every address, so
 * the page shows one neutral confirmation whatever happens server-side.
 */
export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword })
}

/** Set a new password from the emailed token. */
export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword })
}
