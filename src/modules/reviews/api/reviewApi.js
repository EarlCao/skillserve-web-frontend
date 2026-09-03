import { api } from '../../../services/api'

/**
 * Reviews and Ratings management endpoints.
 */
export const reviewApi = {
  list: (params) => api.get('/reviews', { params }),
  show: (id) => api.get(`/reviews/${id}`),
  hide: (id, isHidden) => api.patch(`/reviews/${id}/hide`, { is_hidden: isHidden }),
  remove: (id) => api.delete(`/reviews/${id}`),
}
