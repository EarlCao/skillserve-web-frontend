import { api } from '../../../services/api'

/**
 * Commission configuration and the settlement ledger. All requests go through
 * the shared axios client (baseURL, interceptors, error normalization).
 */
export const commissionApi = {
  // Tiers — the bands that decide the rate.
  listTiers: (params) => api.get('/commission-tiers', { params }),
  createTier: (payload) => api.post('/commission-tiers', payload),
  updateTier: (id, payload) => api.patch(`/commission-tiers/${id}`, payload),
  deleteTier: (id) => api.delete(`/commission-tiers/${id}`),

  // Ledger — what each booking earned, and whether it has been remitted.
  list: (params) => api.get('/commissions', { params }),
  settle: (bookingId, payload) => api.patch(`/commissions/${bookingId}/settle`, payload),
  waive: (bookingId, reason) => api.patch(`/commissions/${bookingId}/waive`, { reason }),
}
