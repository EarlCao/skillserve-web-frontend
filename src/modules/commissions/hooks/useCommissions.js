import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { getFirstFieldError } from '../../../lib/errors'
import { commissionApi } from '../api/commissionApi'

/**
 * A rate change affects what future bookings are charged, and a settlement
 * changes a provider's ability to take on work — so both also refresh the
 * bookings, dashboard and audit views.
 */
function invalidateCommissionCaches(queryClient) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commissions.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commissionRemittances.all })
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

/** Ready-made tier sets; they only change with a deploy. */
export function useCommissionPresets({ enabled = true } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.commissionTiers.presets,
    queryFn: commissionApi.listPresets,
    staleTime: Infinity,
    enabled,
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
 * Overlapping ranges come back as a 422 on `min_amount` ("Another tier
 * already has this price range …"). Toast that field message rather than the
 * generic "The given data was invalid." The tier form also shows it inline.
 */
const toastTierError = (fallback) => (error) => toast.error(getFirstFieldError(error, fallback))

export function useCreateCommissionTier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: commissionApi.createTier,
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Commission tier created.')
      invalidateCommissionCaches(queryClient)
    },
    onError: toastTierError('Unable to create this tier.'),
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
    onError: toastTierError('Unable to update this tier.'),
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

/** Replaces every active tier with the preset's bands. */
export function useApplyCommissionPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (key) => commissionApi.applyPreset(key),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Commission preset applied.')
      invalidateCommissionCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to apply this preset.'),
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

export function useCommissionRemittances(params) {
  return useQuery({
    queryKey: QUERY_KEYS.commissionRemittances.list(params),
    queryFn: () => commissionApi.listRemittances(params),
    placeholderData: keepPreviousData,
  })
}

/** Settles every booking the payment covered, so the ledger refreshes too. */
export function useConfirmRemittance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }) => commissionApi.confirmRemittance(id, notes),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Payment confirmed.')
      invalidateCommissionCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to confirm this payment.'),
  })
}

export function useRejectRemittance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => commissionApi.rejectRemittance(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Payment rejected.')
      invalidateCommissionCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to reject this payment.'),
  })
}

/** Open the provider's GCash receipt in a new tab, from memory. */
export function useOpenRemittanceProof() {
  return useMutation({
    mutationFn: (id) => commissionApi.remittanceProof(id),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      // Long enough for the new tab to load it.
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to open this receipt.'),
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

/** The commission rules: fallback rate and when unpaid commission blocks a provider. */
export function useCommissionSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.commissionSettings,
    queryFn: commissionApi.getSettings,
  })
}

export function useUpdateCommissionSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: commissionApi.updateSettings,
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Commission settings saved.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commissionSettings })
      invalidateCommissionCaches(queryClient)
    },
    onError: (error) => toast.error(getFirstFieldError(error) ?? error?.message ?? 'Unable to save the commission settings.'),
  })
}
