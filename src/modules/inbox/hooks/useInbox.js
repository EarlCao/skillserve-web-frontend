import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { inboxApi } from '../api/inboxApi'

export function useInboxAlerts(params) {
  return useQuery({
    queryKey: QUERY_KEYS.inbox.list(params),
    queryFn: () => inboxApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Unread alerts, for the bell and the sidebar badge. */
export function useInboxUnreadCount() {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.inbox.unreadCount,
    queryFn: inboxApi.unreadCount,
    staleTime: 30_000,
  })

  return data?.data?.unread_count ?? 0
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inboxApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inbox.all }),
  })
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inboxApi.readAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inbox.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to mark the alerts as read.')
    },
  })
}
