import { api } from '../../../services/api'

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (payload) => api.put('/settings', payload),
}
