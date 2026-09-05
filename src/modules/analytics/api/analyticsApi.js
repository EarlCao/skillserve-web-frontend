import { api } from '../../../services/api'
import axiosInstance from '../../../services/axios'

export const analyticsApi = {
  list: (params) => api.get('/analytics/reports', { params }),
  export: (params) => axiosInstance
    .get('/analytics/reports/export', { params, responseType: 'blob' })
    .then(({ data }) => data),
}
