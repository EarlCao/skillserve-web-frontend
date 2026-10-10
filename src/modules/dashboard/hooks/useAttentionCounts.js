import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../../../constants'
import { dashboardApi } from '../api/dashboardApi'

/**
 * New support tickets and pending reports, for the sidebar badges. A count
 * is null when the viewer may not open that list. Live updates refetch it on
 * every change, so a ticket or report filed in the app shows up at once.
 */
export function useAttentionCounts({ enabled = true } = {}) {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.dashboard.attention,
    queryFn: dashboardApi.attention,
    enabled,
    staleTime: 30_000,
  })

  return {
    openSupportTickets: data?.data?.open_support_tickets ?? 0,
    pendingReports: data?.data?.pending_reports ?? 0,
  }
}
