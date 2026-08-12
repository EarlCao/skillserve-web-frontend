import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { serviceCategoryApi } from '../api/serviceCategoryApi'

/**
 * Paginated category list (search/filter/sort are server-side).
 */
export function useServiceCategories(params) {
  return useQuery({
    queryKey: QUERY_KEYS.serviceCategories.list(params),
    queryFn: () => serviceCategoryApi.list(params),
    // Keep the previous page rendered while the next one loads so the table
    // doesn't collapse (which makes the page jump to the top on pagination).
    placeholderData: keepPreviousData,
  })
}

/**
 * Single category with its subcategories (category details modal).
 */
export function useServiceCategory(id) {
  return useQuery({
    queryKey: QUERY_KEYS.serviceCategories.detail(id),
    queryFn: () => serviceCategoryApi.show(id),
    enabled: Boolean(id),
  })
}

/**
 * Create-category mutation.
 */
export function useCreateServiceCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: serviceCategoryApi.create,
    onSuccess: () => {
      toast.success('Service category created.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategories.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to create the service category.')
    },
  })
}

/**
 * Update-category mutation.
 */
export function useUpdateServiceCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }) => serviceCategoryApi.update(id, payload),
    onSuccess: () => {
      toast.success('Service category updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategories.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the service category.')
    },
  })
}

/**
 * Enable/disable mutation.
 */
export function useUpdateServiceCategoryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => serviceCategoryApi.updateStatus(id, status),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Service category status updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategories.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the service category status.')
    },
  })
}

/**
 * Delete-category mutation.
 */
export function useDeleteServiceCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: serviceCategoryApi.remove,
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Service category deleted.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategories.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to delete the service category.')
    },
  })
}

/**
 * Create-subcategory mutation.
 */
export function useCreateSubcategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, ...payload }) => serviceCategoryApi.createSubcategory(categoryId, payload),
    onSuccess: () => {
      toast.success('Subcategory created.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategories.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to create the subcategory.')
    },
  })
}

/**
 * Update-subcategory mutation.
 */
export function useUpdateSubcategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, subcategoryId, ...payload }) =>
      serviceCategoryApi.updateSubcategory(categoryId, subcategoryId, payload),
    onSuccess: () => {
      toast.success('Subcategory updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategories.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the subcategory.')
    },
  })
}

/**
 * Delete-subcategory mutation.
 */
export function useDeleteSubcategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, subcategoryId }) =>
      serviceCategoryApi.deleteSubcategory(categoryId, subcategoryId),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Subcategory deleted.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategories.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to delete the subcategory.')
    },
  })
}
