import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { providerRecognitionApi } from '../api/providerRecognitionApi'

export function useRecognitionBadges(params) {
  return useQuery({ queryKey: QUERY_KEYS.providerRecognition.badges(params), queryFn: () => providerRecognitionApi.badges(params), placeholderData: keepPreviousData })
}

export function useRecognitionProviders(params, topRated = false) {
  return useQuery({
    queryKey: topRated ? QUERY_KEYS.providerRecognition.topRated(params) : QUERY_KEYS.providerRecognition.providers(params),
    queryFn: () => (topRated ? providerRecognitionApi.topRated(params) : providerRecognitionApi.providers(params)),
    placeholderData: keepPreviousData,
  })
}

function useRecognitionMutation(mutationFn, message) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      toast.success(data?.message ?? message)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providerRecognition.all })
    },
    onError: (error) => toast.error(error?.message ?? `Unable to ${message.toLowerCase()}`),
  })
}

export function useCreateBadge() { return useRecognitionMutation(providerRecognitionApi.createBadge, 'Badge created.') }
export function useUpdateBadge() { return useRecognitionMutation(({ id, ...payload }) => providerRecognitionApi.updateBadge(id, payload), 'Badge updated.') }
export function useDeleteBadge() { return useRecognitionMutation(providerRecognitionApi.deleteBadge, 'Badge deleted.') }
export function useAssignBadge() { return useRecognitionMutation(({ providerId, badgeId }) => providerRecognitionApi.assignBadge(providerId, badgeId), 'Badge assigned.') }
export function useRemoveBadge() { return useRecognitionMutation(({ providerId, badgeId }) => providerRecognitionApi.removeBadge(providerId, badgeId), 'Badge removed.') }
export function useToggleFeatured() { return useRecognitionMutation(({ providerId, isFeatured }) => providerRecognitionApi.featured(providerId, isFeatured), 'Featured status updated.') }
