import { api } from '../../../services/api'

export const disputeApi = {
  list: (params) => api.get('/disputes', { params }),
  show: (id) => api.get(`/disputes/${id}`),
  history: (id) => api.get(`/disputes/${id}/history`),
  investigate: (id) => api.patch(`/disputes/${id}/investigate`),
  addNote: (id, note) => api.patch(`/disputes/${id}/notes`, { note }),
  resolve: (id, resolution) => api.patch(`/disputes/${id}/resolve`, { resolution }),
  reject: (id, note) => api.patch(`/disputes/${id}/reject`, { note }),
  close: (id, note) => api.patch(`/disputes/${id}/close`, { note }),
  // Evidence lives in private storage behind the admin's token, so it is
  // fetched as a blob rather than opened as a plain link.
  evidence: (downloadPath) => api.get(downloadPath, { responseType: 'blob' }),
}
