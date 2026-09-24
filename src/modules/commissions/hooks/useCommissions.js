import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { commissionApi } from '../api/commissionApi'

/**
 * A rate change affects what future bookings are charged, and a settlement
 * changes a provider's ability to take on work — so both also refresh the
 * bookings, dashboard and audit views.
 */
function invalidateCommissionCaches(queryClient) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commissions.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commissionTiers.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.audit.all })
}

export function useCommissionTiers(params) {
  return useQuery({
    queryKey: QUERY_KEYS.commissionTiers.list(params),
    queryFn: () => commissionApi.listTiers(params),
    placeholderData: keepPreviousData,
  })
}

export function useCommissions(params) {
  return useQuery({
    queryKey: QUERY_KEYS.commissions.list(params),
    queryFn: () => commissionApi.list(params),
    // Keeps the table rendered while the next page loads, so the page does
    // not collapse and jump to the top.
    placeholderData: keepPreviousData,
  })
}

/**
 * Overlapping ranges come back as a 422 on `min_amount`. The message is the
 * backend's own ("This range overlaps the active tier …"), which names the
 * clashing band and is more useful than anything generic.
 */
export function useCreateCommissionTier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: commissionApi.createTier,
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Commission tier created.')
      invalidateCommissionCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to create this tier.'),
  })
}

export function useUpdateCommissionTier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }) => commissionApi.updateTier(id, payload),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Commission tier updated.')
      invalidateCommissionCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to update this tier.'),
  })
}

export function useDeleteCommissionTier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => commissionApi.deleteTier(id),
    onSuccess: () => {
      toast.success('Commission tier retired.')
      invalidateCommissionCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to retire this tier.'),
  })
}

export function useSettleCommission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, payload }) => commissionApi.settle(bookingId, payload),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Commission settled.')
      invalidateCommissionCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to record this settlement.'),
  })
}

export function useWaiveCommission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, reason }) => commissionApi.waive(bookingId, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Commission waived.')
      invalidateCommissionCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to waive this commission.'),
  })
}
