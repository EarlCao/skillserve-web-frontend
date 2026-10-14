import { api } from '../../../services/api'

export const supportTicketApi = {
  list: (params) => api.get('/support/tickets', { params }),
  show: (id) => api.get(`/support/tickets/${id}`),
  assignees: (search) => api.get('/support/tickets/assignees', { params: { search: search || undefined } }),
  assign: (id, assignedTo) => api.patch(`/support/tickets/${id}/assign`, { assigned_to: assignedTo || null }),
  // Photos go as multipart images[]; text alone as JSON.
  respond: (id, body, images = []) => {
    if (images.length === 0) return api.post(`/support/tickets/${id}/responses`, { body })
    const form = new FormData()
    if (body) form.append('body', body)
    images.forEach((file) => form.append('images[]', file))
    return api.post(`/support/tickets/${id}/responses`, form)
  },
  resolve: (id, resolutionNote) => api.patch(`/support/tickets/${id}/resolve`, { resolution_note: resolutionNote }),
}
