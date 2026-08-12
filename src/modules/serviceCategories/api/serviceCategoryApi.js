import { api } from '../../../services/api'

/**
 * Service category management endpoints. All requests go through the shared
 * axios client (baseURL, interceptors, error normalization).
 *
 * Subcategory operations are always nested under the parent category.
 */
export const serviceCategoryApi = {
  list: (params) => api.get('/service-categories', { params }),
  show: (id) => api.get(`/service-categories/${id}`),
  create: (payload) => api.post('/service-categories', payload),
  update: (id, payload) => api.put(`/service-categories/${id}`, payload),
  updateStatus: (id, status) => api.patch(`/service-categories/${id}/status`, { status }),
  remove: (id) => api.delete(`/service-categories/${id}`),

  createSubcategory: (categoryId, payload) => api.post(`/service-categories/${categoryId}/subcategories`, payload),
  updateSubcategory: (categoryId, subcategoryId, payload) =>
    api.put(`/service-categories/${categoryId}/subcategories/${subcategoryId}`, payload),
  deleteSubcategory: (categoryId, subcategoryId) =>
    api.delete(`/service-categories/${categoryId}/subcategories/${subcategoryId}`),
}
