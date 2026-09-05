import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { notificationApi } from '../api/notificationApi'

export function useNotifications(params) {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.list(params),
    queryFn: () => notificationApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useNotificationRecipients(target, search) {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.recipients(target, search),
    queryFn: () => notificationApi.recipients({ target, search: search || undefined }),
    enabled: target === 'selected' || target === 'customers' || target === 'providers',
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.createAnnouncement,
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Announcement created.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to create the announcement.')
    },
  })
}
