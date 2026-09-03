import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { reviewApi } from '../api/reviewApi'

/**
 * Paginated review list (search/filter/sort are server-side).
 */
export function useReviews(params) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.list(params),
    queryFn: () => reviewApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/**
 * Single review with relationships.
 */
export function useReview(id) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.detail(id),
    queryFn: () => reviewApi.show(id),
    enabled: Boolean(id),
  })
}

/**
 * Hide/unhide review mutation.
 */
export function useHideReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isHidden }) => reviewApi.hide(id, isHidden),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Review visibility updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update review visibility.')
    },
  })
}

/**
 * Remove review mutation.
 */
export function useRemoveReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewApi.remove,
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Review removed.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to remove the review.')
    },
  })
}
