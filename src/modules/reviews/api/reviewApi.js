import { api } from '../../../services/api'

/**
 * Reviews and Ratings management endpoints.
 */
export const reviewApi = {
  list: (params) => api.get('/reviews', { params }),
  show: (id) => api.get(`/reviews/${id}`),
  hide: (id, isHidden, reason) => api.patch(`/reviews/${id}/hide`, { is_hidden: isHidden, reason }),
  remove: (id, reason) => api.delete(`/reviews/${id}`, { data: { reason } }),
}
