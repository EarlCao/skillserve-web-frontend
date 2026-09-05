import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { analyticsApi } from '../api/analyticsApi'

/**
 * Paginated report rows for a given report type and filters.
 */
export function useReport(type, params) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.reports(type, params),
    queryFn: () => analyticsApi.list({ type, ...params }),
    enabled: Boolean(type),
    placeholderData: keepPreviousData,
  })
}

/**
 * Export the current report to a CSV download.
 */
export function useExportReport() {
  return useMutation({
    mutationFn: (variables) => analyticsApi.export(variables),
    onSuccess: (blob, variables) => {
      const date = new Date().toISOString().slice(0, 10)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${variables.type}-report-${date}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()

      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('Report exported.')
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to export the report.')
    },
  })
}
