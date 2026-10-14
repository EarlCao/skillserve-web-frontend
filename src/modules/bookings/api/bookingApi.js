import { api } from '../../../services/api'

export const bookingApi = {
  list: (params) => api.get('/bookings', { params }),
  show: (id) => api.get(`/bookings/${id}`),
  history: (id) => api.get(`/bookings/${id}/history`),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  markPaid: (id, paymentReference) =>
    api.patch(`/bookings/${id}/mark-paid`, { payment_reference: paymentReference || null }),
  refund: (id, amount, reason) => api.patch(`/bookings/${id}/refund`, { amount, reason }),
  // Settle what a provider owes back after a cancellation: returned | not_returned.
  resolveRefund: (id, resolution, note) => api.patch(`/bookings/${id}/refund/resolve`, { resolution, note }),
  manageDispute: (id, action, resolution) =>
    api.patch(`/bookings/${id}/dispute`, { action, resolution }),
}
