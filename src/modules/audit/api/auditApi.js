import { api } from '../../../services/api'

export const auditApi = {
  list: (params) => api.get('/audit-logs', { params }),
  administrators: () => api.get('/audit-logs/administrators'),
}
