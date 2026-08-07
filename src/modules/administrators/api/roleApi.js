import { api } from '../../../services/api'

/**
 * Role management endpoints (CRUD + permission-matrix sync).
 */
export const roleApi = {
  list: (params) => api.get('/roles', { params }),
  create: (payload) => api.post('/roles', payload),
  update: (id, payload) => api.put(`/roles/${id}`, payload),
  remove: (id) => api.delete(`/roles/${id}`),
  syncPermissions: (id, permissions) => api.put(`/roles/${id}/permissions`, { permissions }),
}
