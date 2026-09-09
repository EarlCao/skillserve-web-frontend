import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { reportApi } from '../api/reportApi'

/**
 * Paginated report list (search/filter/sort are server-side).
 */
export function useReports(params) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.list(params),
    queryFn: () => reportApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/**
 * Single report with its reported item and moderation stamps.
 */
export function useReport(id) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.detail(id),
    queryFn: () => reportApi.show(id),
    enabled: Boolean(id),
  })
}

/**
 * Invalidate reports and the related module caches because moderation can
 * change the reported entity and dashboard/analytics aggregates.
 */
function invalidateReportCaches(queryClient) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.providers.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analytics.all })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.audit.all })
}

/**
 * Assign a report to an investigator and start the investigation.
 */
export function useInvestigateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, note }) => reportApi.investigate(id, note),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Report investigation started.')
      invalidateReportCaches(queryClient)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to start the investigation.')
    },
  })
}

/**
 * Append an investigation note to a report.
 */
export function useAddReportNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, note }) => reportApi.addNote(id, note),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Investigation note added.')
      invalidateReportCaches(queryClient)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to add the investigation note.')
    },
  })
}

/**
 * Resolve a report.
 */
export function useResolveReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, resolutionNote }) => reportApi.resolve(id, resolutionNote),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Report resolved.')
      invalidateReportCaches(queryClient)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to resolve the report.')
    },
  })
}

/**
 * Reject a report.
 */
export function useRejectReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => reportApi.reject(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Report rejected.')
      invalidateReportCaches(queryClient)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to reject the report.')
    },
  })
}

/**
 * Take a moderation action on the reported item.
 */
export function useTakeReportAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }) => reportApi.takeAction(id, payload),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Moderation action taken.')
      invalidateReportCaches(queryClient)
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to take the moderation action.')
    },
  })
}
