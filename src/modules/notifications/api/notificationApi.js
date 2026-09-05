import { api } from '../../../services/api'

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  recipients: (params) => api.get('/notifications/recipients', { params }),
  createAnnouncement: (payload) => api.post('/notifications/announcements', payload),
}
