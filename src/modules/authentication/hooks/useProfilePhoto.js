import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { authApi } from '../api/authApi'

/**
 * Set or remove the signed-in administrator's profile photo. The response is
 * the updated administrator, written straight into the "me" query so the
 * header shows the new photo without another request.
 */
export function useProfilePhoto() {
  const queryClient = useQueryClient()
  const onSuccess = (response) => {
    queryClient.setQueryData(QUERY_KEYS.auth.me, (current) => ({ ...current, data: response.data }))
    toast.success(response?.message ?? 'Profile photo updated.')
  }

  const upload = useMutation({
    mutationFn: authApi.uploadPhoto,
    onSuccess,
    onError: (error) => toast.error(error?.message ?? 'Unable to save the photo.'),
  })

  const remove = useMutation({
    mutationFn: authApi.removePhoto,
    onSuccess,
    onError: (error) => toast.error(error?.message ?? 'Unable to remove the photo.'),
  })

  return { upload, remove, isPending: upload.isPending || remove.isPending }
}
