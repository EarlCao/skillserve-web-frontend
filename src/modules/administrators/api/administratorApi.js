import { api } from '../../../services/api'

/**
 * Administrator management endpoints. All requests go through the shared
 * axios client (baseURL, interceptors, error normalization).
 */
export const administratorApi = {
  list: (params) => api.get('/administrators', { params }),
  create: (payload) => api.post('/administrators', payload),
  update: (id, payload) => api.put(`/administrators/${id}`, payload),
  updateStatus: (id, status) => api.patch(`/administrators/${id}/status`, { status }),
  resetPassword: (id, payload) => api.patch(`/administrators/${id}/password`, payload),
}
