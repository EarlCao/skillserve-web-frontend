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

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Export the current report to a CSV download.
 */
export function useExportReport() {
  return useMutation({
    mutationFn: (variables) => analyticsApi.export(variables),
    onSuccess: (blob, variables) => {
      downloadBlob(blob, `${variables.type}-report-${today()}.csv`)
      toast.success('Report exported.')
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to export the report.')
    },
  })
}

/**
 * Every report category in one Excel workbook: a Summary sheet, then one
 * sheet per category, over the given date range.
 */
export function useExportGeneralReport() {
  return useMutation({
    mutationFn: (params) => analyticsApi.generalExport(params),
    onSuccess: (blob) => {
      downloadBlob(blob, `general-report-${today()}.xlsx`)
      toast.success('General report generated.')
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to generate the general report.')
    },
  })
}
