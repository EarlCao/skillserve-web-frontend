import { api } from '../../../services/api'

export const analyticsApi = {
  list: (params) => api.get('/analytics/reports', { params }),
  // CSV downloads: with `responseType: 'blob'` the resolved value is the file.
  export: (params) => api.get('/analytics/reports/export', { params, responseType: 'blob' }),
  generalExport: (params) => api.get('/analytics/reports/general/export', { params, responseType: 'blob' }),
}
