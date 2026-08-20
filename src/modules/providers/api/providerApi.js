import { api } from '../../../services/api'

/**
 * Provider management endpoints. All requests go through the shared axios client
 * (baseURL, interceptors, error normalization).
 */
export const providerApi = {
  list: (params) => api.get('/providers', { params }),
  show: (id) => api.get(`/providers/${id}`),
  approveVerification: (id, notes) => api.patch(`/providers/${id}/verification/approve`, { notes }),
  rejectVerification: (id, reason) => api.patch(`/providers/${id}/verification/reject`, { reason }),
  requestAdditionalInfo: (id, message) => api.patch(`/providers/${id}/verification/request-info`, { message }),
  removeVerification: (id) => api.patch(`/providers/${id}/verification/remove`),
  verificationHistory: (id) => api.get(`/providers/${id}/verification-history`),
  suspend: (id, reason) => api.patch(`/providers/${id}/suspend`, { reason }),
  activate: (id) => api.patch(`/providers/${id}/activate`),
}
