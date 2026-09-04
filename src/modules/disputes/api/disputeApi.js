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
}
