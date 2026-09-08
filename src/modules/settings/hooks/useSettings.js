import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { settingsApi } from '../api/settingsApi'

export function useSettings() {
  return useQuery({ queryKey: QUERY_KEYS.settings.detail, queryFn: settingsApi.get })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (response) => {
      queryClient.setQueryData(QUERY_KEYS.settings.detail, response)
      toast.success(response?.message ?? 'Settings updated.')
    },
    onError: (error) => toast.error(error?.message ?? 'Unable to update settings.'),
  })
}
