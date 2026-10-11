import { api } from '../../../services/api'

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (payload) => api.put('/settings', payload),
  // Public: the theme is applied on the sign-in page too.
  appearance: () => api.get('/appearance'),
}
