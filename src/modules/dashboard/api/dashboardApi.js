import { api } from '../../../services/api'

export const dashboardApi = {
  summary: () => api.get('/dashboard'),
}
