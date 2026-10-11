import { api } from '../../../services/api'

/**
 * Authentication endpoints. All requests go through the shared axios client
 * (baseURL, interceptors, error normalization) — never a raw axios call.
 */
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (payload) => api.post('/auth/change-password', payload),
  uploadPhoto: (file) => {
    const form = new FormData()
    form.append('photo', file)
    return api.post('/auth/me/photo', form)
  },
  removePhoto: () => api.delete('/auth/me/photo'),
}
