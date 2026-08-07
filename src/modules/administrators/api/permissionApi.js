import { api } from '../../../services/api'

/**
 * Permission matrix endpoints (read-only catalog grouped by module).
 */
export const permissionApi = {
  matrix: () => api.get('/permissions'),
}
