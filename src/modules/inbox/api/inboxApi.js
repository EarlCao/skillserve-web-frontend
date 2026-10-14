import { api } from '../../../services/api'

/** The signed-in administrator's own alerts (the Inbox and its bell). */
export const inboxApi = {
  list: (params) => api.get('/inbox', { params }),
  unreadCount: () => api.get('/inbox/unread-count'),
  markRead: (id) => api.patch(`/inbox/${id}/read`),
  readAll: () => api.post('/inbox/read-all'),
}
