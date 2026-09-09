import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { administratorApi } from '../api/administratorApi'

function invalidateAdministratorCaches(queryClient) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.administrators.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.audit.all })
}

/**
 * Paginated administrator list (search/filter/sort are server-side).
 */
export function useAdministrators(params) {
  return useQuery({
    queryKey: QUERY_KEYS.administrators.list(params),
    queryFn: () => administratorApi.list(params),
    // Keep the previous page rendered while the next one loads so the table
    // doesn't collapse (which makes the page jump to the top on pagination).
    placeholderData: keepPreviousData,
  })
}

/**
 * Create-administrator mutation.
 */
export function useCreateAdministrator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: administratorApi.create,
    onSuccess: () => {
      toast.success('Administrator created.')
      invalidateAdministratorCaches(queryClient)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to create the administrator.')
    },
  })
}

/**
 * Update-administrator mutation.
 */
export function useUpdateAdministrator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }) => administratorApi.update(id, payload),
    onSuccess: () => {
      toast.success('Administrator updated.')
      invalidateAdministratorCaches(queryClient)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the administrator.')
    },
  })
}

/**
 * Reset an administrator's password (ends all their sessions).
 */
export function useResetAdministratorPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, password, password_confirmation }) =>
      administratorApi.resetPassword(id, { password, password_confirmation }),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Administrator password updated.')
      invalidateAdministratorCaches(queryClient)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to reset the password.')
    },
  })
}

/**
 * Activate/deactivate mutation.
 */
export function useUpdateAdministratorStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => administratorApi.updateStatus(id, status),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Administrator status updated.')
      invalidateAdministratorCaches(queryClient)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the administrator status.')
    },
  })
}
