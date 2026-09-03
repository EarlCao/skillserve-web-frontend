import { api } from '../../../services/api'

export const bookingApi = {
  list: (params) => api.get('/bookings', { params }),
  show: (id) => api.get(`/bookings/${id}`),
  history: (id) => api.get(`/bookings/${id}/history`),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  manageDispute: (id, action, resolution) =>
    api.patch(`/bookings/${id}/dispute`, { action, resolution }),
}
