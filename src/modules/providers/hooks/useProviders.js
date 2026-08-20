import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { providerApi } from '../api/providerApi'

/**
 * Paginated provider list (search/filter/sort are server-side).
 */
export function useProviders(params) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.list(params),
    queryFn: () => providerApi.list(params),
    // Keep the previous page rendered while the next one loads so the table
    // doesn't collapse (which makes the page jump to the top on pagination).
    placeholderData: keepPreviousData,
  })
}

/**
 * Single provider profile.
 */
export function useProvider(id) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.detail(id),
    queryFn: () => providerApi.show(id),
    enabled: Boolean(id),
  })
}

/**
 * Verification history for a provider.
 */
export function useVerificationHistory(id) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.verificationHistory(id),
    queryFn: () => providerApi.verificationHistory(id),
    enabled: Boolean(id),
  })
}

/**
 * Approve provider verification mutation.
 */
export function useApproveVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }) => providerApi.approveVerification(id, notes),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Provider verification approved.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to approve verification.')
    },
  })
}

/**
 * Reject provider verification mutation.
 */
export function useRejectVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => providerApi.rejectVerification(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Provider verification rejected.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to reject verification.')
    },
  })
}

/**
 * Request additional information mutation.
 */
export function useRequestAdditionalInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, message }) => providerApi.requestAdditionalInfo(id, message),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Additional information requested.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to request additional information.')
    },
  })
}

/**
 * Remove provider verification mutation.
 */
export function useRemoveVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => providerApi.removeVerification(id),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Provider verification removed.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to remove verification.')
    },
  })
}

/**
 * Suspend provider mutation.
 */
export function useSuspendProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => providerApi.suspend(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Provider suspended.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to suspend provider.')
    },
  })
}

/**
 * Activate provider mutation.
 */
export function useActivateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => providerApi.activate(id),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Provider activated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to activate provider.')
    },
  })
}
