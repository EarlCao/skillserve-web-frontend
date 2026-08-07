import { api } from '../../../services/api'

/**
 * User management endpoints. All requests go through the shared axios client
 * (baseURL, interceptors, error normalization).
 */
export const userApi = {
  list: (params) => api.get('/users', { params }),
  show: (id) => api.get(`/users/${id}`),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  suspend: (id, reason) => api.patch(`/users/${id}/suspend`, { reason }),
  activate: (id) => api.patch(`/users/${id}/activate`),
  ban: (id, { reason, duration, days } = {}) => api.patch(`/users/${id}/ban`, { reason, duration, days }),
  unban: (id, { reason } = {}) => api.patch(`/users/${id}/unban`, { reason }),
  banHistory: (id) => api.get(`/users/${id}/moderation-history`),
  remove: (id) => api.delete(`/users/${id}`),
}
