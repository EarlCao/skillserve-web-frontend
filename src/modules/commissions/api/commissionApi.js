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
  listPresets: () => api.get('/commission-tiers/presets'),
  applyPreset: (key) => api.post(`/commission-tiers/presets/${key}/apply`),

  // Rules — the fallback rate and when unpaid commission blocks a provider.
  getSettings: () => api.get('/commission-settings'),
  updateSettings: (payload) => api.put('/commission-settings', payload),

  // Ledger — what each booking earned, and whether it has been remitted.
  list: (params) => api.get('/commissions', { params }),
  settle: (bookingId, payload) => api.patch(`/commissions/${bookingId}/settle`, payload),
  waive: (bookingId, reason) => api.patch(`/commissions/${bookingId}/waive`, { reason }),

  // GCash payments providers submit — the reference to find in SkillServe's
  // GCash history before confirming.
  listRemittances: (params) => api.get('/commission-remittances', { params }),
  confirmRemittance: (id, notes) => api.patch(`/commission-remittances/${id}/confirm`, { notes }),
  rejectRemittance: (id, reason) => api.patch(`/commission-remittances/${id}/reject`, { reason }),
  // The receipt is private, so it is fetched with the admin's token as a blob.
  remittanceProof: (id) => api.get(`/commission-remittances/${id}/proof`, { responseType: 'blob' }),
}
