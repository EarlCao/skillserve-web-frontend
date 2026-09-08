import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { supportTicketApi } from '../api/supportTicketApi'

export function useSupportTickets(params) {
  return useQuery({
    queryKey: QUERY_KEYS.supportTickets.list(params),
    queryFn: () => supportTicketApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useSupportTicket(id) {
  return useQuery({
    queryKey: QUERY_KEYS.supportTickets.detail(id),
    queryFn: () => supportTicketApi.show(id),
    enabled: Boolean(id),
  })
}

export function useSupportAssignees(search) {
  return useQuery({
    queryKey: QUERY_KEYS.supportTickets.assignees(search),
    queryFn: () => supportTicketApi.assignees(search),
  })
}

function invalidateSupport(queryClient, id) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supportTickets.all })
  if (id) queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supportTickets.detail(id) })
}

export function useAssignSupportTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, assignedTo }) => supportTicketApi.assign(id, assignedTo),
    onSuccess: (data, variables) => {
      toast.success(data?.message ?? 'Support ticket assignment updated.')
      invalidateSupport(queryClient, variables.id)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to update the assignment.'),
  })
}

export function useRespondToSupportTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }) => supportTicketApi.respond(id, body),
    onSuccess: (data, variables) => {
      toast.success(data?.message ?? 'Support response added.')
      invalidateSupport(queryClient, variables.id)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to add the response.'),
  })
}

export function useResolveSupportTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, resolutionNote }) => supportTicketApi.resolve(id, resolutionNote),
    onSuccess: (data, variables) => {
      toast.success(data?.message ?? 'Support ticket resolved.')
      invalidateSupport(queryClient, variables.id)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to resolve the ticket.'),
  })
}
