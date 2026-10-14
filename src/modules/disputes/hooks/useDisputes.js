import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { disputeApi } from '../api/disputeApi'

export function useDisputes(params) {
  return useQuery({
    queryKey: QUERY_KEYS.disputes.list(params),
    queryFn: () => disputeApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useDispute(id) {
  return useQuery({
    queryKey: QUERY_KEYS.disputes.detail(id),
    queryFn: () => disputeApi.show(id),
    enabled: Boolean(id),
  })
}

export function useDisputeHistory(id) {
  return useQuery({
    queryKey: QUERY_KEYS.disputes.history(id),
    queryFn: () => disputeApi.history(id),
    enabled: Boolean(id),
  })
}

function useDisputeMutation(mutationFn, fallback) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      toast.success(data?.message ?? fallback)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disputes.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all })
    },
    onError: (error) => toast.error(error?.message ?? fallback),
  })
}

export function useInvestigateDispute() {
  return useDisputeMutation(({ id }) => disputeApi.investigate(id), 'Dispute under investigation.')
}

export function useAddDisputeNote() {
  return useDisputeMutation(({ id, note }) => disputeApi.addNote(id, note), 'Dispute note added.')
}

export function useResolveDispute() {
  return useDisputeMutation(({ id, resolution }) => disputeApi.resolve(id, resolution), 'Dispute resolved.')
}

export function useRejectDispute() {
  return useDisputeMutation(({ id, note }) => disputeApi.reject(id, note), 'Dispute rejected.')
}

export function useCloseDispute() {
  return useDisputeMutation(({ id, note }) => disputeApi.close(id, note), 'Dispute closed.')
}
