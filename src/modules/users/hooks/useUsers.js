import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { userApi } from '../api/userApi'

/**
 * Paginated user list (search/filter/sort are server-side).
 */
export function useUsers(params) {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(params),
    queryFn: () => userApi.list(params),
    // Keep the previous page rendered while the next one loads so the table
    // doesn't collapse (which makes the page jump to the top on pagination).
    placeholderData: keepPreviousData,
  })
}

/**
 * Full moderation (ban/unban/suspend/activate) history for a user.
 */
export function useBanHistory(id) {
  return useQuery({
    queryKey: QUERY_KEYS.users.history(id),
    queryFn: () => userApi.banHistory(id),
    enabled: Boolean(id),
  })
}

/**
 * Single user profile.
 */
export function useUser(id) {
  return useQuery({
    queryKey: QUERY_KEYS.users.detail(id),
    queryFn: () => userApi.show(id),
    enabled: Boolean(id),
  })
}

/**
 * Update-user mutation.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }) => userApi.update(id, payload),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'User updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the user.')
    },
  })
}

/**
 * Suspend-user mutation.
 */
export function useSuspendUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => userApi.suspend(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'User suspended.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to suspend the user.')
    },
  })
}

/**
 * Activate-user mutation.
 */
export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => userApi.activate(id),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'User activated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to activate the user.')
    },
  })
}

/**
 * Ban-user mutation (temporary or permanent).
 */
export function useBanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason, duration, days }) => userApi.ban(id, { reason, duration, days }),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'User banned.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to ban the user.')
    },
  })
}

/**
 * Unban-user mutation.
 */
export function useUnbanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => userApi.unban(id, { reason }),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'User unbanned.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to unban the user.')
    },
  })
}

/**
 * Delete-user mutation.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => userApi.remove(id),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'User deleted.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to delete the user.')
    },
  })
}
