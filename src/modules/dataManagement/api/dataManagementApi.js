import { api } from '../../../services/api'

export const dataManagementApi = {
  archives: (params) => api.get('/data-management/archives', { params }),
  deleted: (params) => api.get('/data-management/deleted', { params }),
  archive: (payload) => api.post('/data-management/archives', payload),
  restoreArchive: (id) => api.post(`/data-management/archives/${id}/restore`),
  restoreDeleted: (type, id) => api.post(`/data-management/deleted/${type}/${id}/restore`),
  permanentlyDelete: (type, id) => api.delete(`/data-management/deleted/${type}/${id}`),
  // A CSV download: with `responseType: 'blob'` the resolved value is the file.
  export: (type) => api.get('/data-management/export', { params: { type }, responseType: 'blob' }),
}
