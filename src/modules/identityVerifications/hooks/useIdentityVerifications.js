import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { identityVerificationApi } from '../api/identityVerificationApi'

/**
 * A decision changes whether an account may transact at all, so it also
 * refreshes the user, booking and audit views.
 */
function invalidateIdentityCaches(queryClient) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.identityVerifications.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.audit.all })
}

export function useIdentityVerifications(params) {
  return useQuery({
    queryKey: QUERY_KEYS.identityVerifications.list(params),
    queryFn: () => identityVerificationApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useIdentityVerification(id) {
  return useQuery({
    queryKey: QUERY_KEYS.identityVerifications.detail(id),
    queryFn: () => identityVerificationApi.show(id),
    enabled: Boolean(id),
  })
}

/**
 * Opens an ID image in a new tab. Same approach as the provider verification
 * documents: fetch with the admin's token, then open a blob URL, because the
 * file is not reachable without authorization.
 */
export function useOpenIdentityDocument() {
  return useMutation({
    mutationFn: ({ id, documentId }) => identityVerificationApi.document(id, documentId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      // Long enough for the new tab to load it.
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to open this document.'),
  })
}

export function useApproveIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }) => identityVerificationApi.approve(id, notes),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Identity verified.')
      invalidateIdentityCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to approve this submission.'),
  })
}

export function useRejectIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => identityVerificationApi.reject(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Submission rejected.')
      invalidateIdentityCaches(queryClient)
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to reject this submission.'),
  })
}
