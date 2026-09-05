import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../../../constants'
import { dashboardApi } from '../api/dashboardApi'

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.summary,
    queryFn: dashboardApi.summary,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
