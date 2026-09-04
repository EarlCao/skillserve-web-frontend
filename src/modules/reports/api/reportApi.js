import { api } from '../../../services/api'

/**
 * Reports and Moderation endpoints. All requests go through the shared axios
 * client (baseURL, interceptors, error normalization).
 */
export const reportApi = {
  list: (params) => api.get('/reports', { params }),
  show: (id) => api.get(`/reports/${id}`),
  investigate: (id, note) => api.patch(`/reports/${id}/investigate`, { note }),
  addNote: (id, note) => api.patch(`/reports/${id}/notes`, { note }),
  resolve: (id, resolutionNote) => api.patch(`/reports/${id}/resolve`, { resolution_note: resolutionNote }),
  reject: (id, reason) => api.patch(`/reports/${id}/reject`, { reason }),
  takeAction: (id, payload) => api.patch(`/reports/${id}/action`, payload),
}