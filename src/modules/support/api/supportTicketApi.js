import { api } from '../../../services/api'

export const supportTicketApi = {
  list: (params) => api.get('/support/tickets', { params }),
  show: (id) => api.get(`/support/tickets/${id}`),
  assignees: (search) => api.get('/support/tickets/assignees', { params: { search: search || undefined } }),
  assign: (id, assignedTo) => api.patch(`/support/tickets/${id}/assign`, { assigned_to: assignedTo || null }),
  respond: (id, body) => api.post(`/support/tickets/${id}/responses`, { body }),
  resolve: (id, resolutionNote) => api.patch(`/support/tickets/${id}/resolve`, { resolution_note: resolutionNote }),
}
