import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../../../constants'
import { permissionApi } from '../api/permissionApi'

/**
 * Permission matrix grouped by module.
 */
export function usePermissionMatrix() {
  return useQuery({
    queryKey: QUERY_KEYS.permissions.matrix,
    queryFn: permissionApi.matrix,
  })
}
