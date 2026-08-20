import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { serviceApi } from '../api/serviceApi'

/**
 * Paginated service list (search/filter/sort are server-side).
 */
export function useServices(params) {
  return useQuery({
    queryKey: QUERY_KEYS.services.list(params),
    queryFn: () => serviceApi.list(params),
    // Keep the previous page rendered while the next one loads so the table
    // doesn't collapse (which makes the page jump to the top on pagination).
    placeholderData: keepPreviousData,
  })
}

/**
 * Single service with relationships.
 */
export function useService(id) {
  return useQuery({
    queryKey: QUERY_KEYS.services.detail(id),
    queryFn: () => serviceApi.show(id),
    enabled: Boolean(id),
  })
}

/**
 * Create-service mutation.
 */
export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: serviceApi.create,
    onSuccess: () => {
      toast.success('Service created.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to create the service.')
    },
  })
}

/**
 * Update-service mutation.
 */
export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }) => serviceApi.update(id, payload),
    onSuccess: () => {
      toast.success('Service updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the service.')
    },
  })
}

/**
 * Approve-service mutation.
 */
export function useApproveService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }) => serviceApi.approve(id, notes),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Service approved.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to approve the service.')
    },
  })
}

/**
 * Reject-service mutation.
 */
export function useRejectService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => serviceApi.reject(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Service rejected.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to reject the service.')
    },
  })
}

/**
 * Hide/unhide-service mutation.
 */
export function useHideService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isHidden }) => serviceApi.hide(id, isHidden),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Service visibility updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update service visibility.')
    },
  })
}

/**
 * Feature/unfeature-service mutation.
 */
export function useFeatureService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isFeatured }) => serviceApi.feature(id, isFeatured),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Service featured status updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update service featured status.')
    },
  })
}

/**
 * Delete-service mutation.
 */
export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: serviceApi.remove,
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Service deleted.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to delete the service.')
    },
  })
}
