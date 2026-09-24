import { api } from '../../../services/api'

/**
 * National ID review queue. All requests go through the shared axios client
 * (baseURL, interceptors, error normalization).
 */
export const identityVerificationApi = {
  list: (params) => api.get('/identity-verifications', { params }),
  show: (id) => api.get(`/identity-verifications/${id}`),
  approve: (id, notes) => api.patch(`/identity-verifications/${id}/approve`, { notes }),
  reject: (id, reason) => api.patch(`/identity-verifications/${id}/reject`, { reason }),
  // Private file behind the admin's token, so it is fetched as a blob rather
  // than opened as a plain link. The ID image is never reachable by URL.
  document: (id, documentId) =>
    api.get(`/identity-verifications/${id}/documents/${documentId}/download`, { responseType: 'blob' }),
}
