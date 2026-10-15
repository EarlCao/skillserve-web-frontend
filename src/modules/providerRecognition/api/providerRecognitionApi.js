import { api } from '../../../services/api'

export const providerRecognitionApi = {
  badges: (params) => api.get('/provider-recognition/badges', { params }),
  createBadge: (payload) => api.post('/provider-recognition/badges', payload),
  updateBadge: (id, payload) => api.put(`/provider-recognition/badges/${id}`, payload),
  deleteBadge: (id) => api.delete(`/provider-recognition/badges/${id}`),
  providers: (params) => api.get('/provider-recognition/providers', { params }),
  topRated: (params) => api.get('/provider-recognition/top-rated', { params }),
  assignBadge: (providerId, badgeId, reason) => api.post(`/provider-recognition/providers/${providerId}/badges`, { badge_id: badgeId, reason }),
  removeBadge: (providerId, badgeId, reason) => api.delete(`/provider-recognition/providers/${providerId}/badges/${badgeId}`, { data: { reason } }),
  featured: (providerId, isFeatured, reason) => api.patch(`/provider-recognition/providers/${providerId}/featured`, { is_featured: isFeatured, reason }),
}
