import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { roleApi } from '../api/roleApi'

/**
 * Paginated role list (search/sort are server-side).
 */
export function useRoles(params) {
  return useQuery({
    queryKey: QUERY_KEYS.roles.list(params),
    queryFn: () => roleApi.list(params),
  })
}

/**
 * Create-role mutation.
 */
export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roleApi.create,
    onSuccess: () => {
      toast.success('Role created.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles.all })
      // Role names appear on the administrators list; keep it fresh too.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.administrators.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to create the role.')
    },
  })
}

/**
 * Update-role mutation.
 */
export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }) => roleApi.update(id, payload),
    onSuccess: () => {
      toast.success('Role updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.administrators.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the role.')
    },
  })
}

/**
 * Delete-role mutation.
 */
export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => roleApi.remove(id),
    onSuccess: () => {
      toast.success('Role deleted.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.administrators.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to delete the role.')
    },
  })
}

/**
 * Sync a role's permissions from the matrix.
 */
export function useSyncRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, permissions }) => roleApi.syncPermissions(id, permissions),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Role permissions updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.administrators.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the role permissions.')
    },
  })
}
