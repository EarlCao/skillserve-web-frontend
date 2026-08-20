import { api } from '../../../services/api'

/**
 * Service management endpoints. All requests go through the shared axios client
 * (baseURL, interceptors, error normalization).
 */
export const serviceApi = {
  list: (params) => api.get('/services', { params }),
  show: (id) => api.get(`/services/${id}`),
  create: (payload) => api.post('/services', payload),
  update: (id, payload) => api.put(`/services/${id}`, payload),
  approve: (id, notes) => api.patch(`/services/${id}/approve`, { notes }),
  reject: (id, reason) => api.patch(`/services/${id}/reject`, { reason }),
  hide: (id, isHidden) => api.patch(`/services/${id}/hide`, { is_hidden: isHidden }),
  feature: (id, isFeatured) => api.patch(`/services/${id}/feature`, { is_featured: isFeatured }),
  remove: (id) => api.delete(`/services/${id}`),
}
