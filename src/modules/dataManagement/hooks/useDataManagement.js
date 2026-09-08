import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { dataManagementApi } from '../api/dataManagementApi'

export function useArchivedRecords(params, enabled = true) { return useQuery({ queryKey: QUERY_KEYS.dataManagement.archives(params), queryFn: () => dataManagementApi.archives(params), enabled }) }
export function useDeletedRecords(params, enabled = true) { return useQuery({ queryKey: QUERY_KEYS.dataManagement.deleted(params), queryFn: () => dataManagementApi.deleted(params), enabled }) }

function mutation(key, fn, message) {
  return { mutationFn: fn, onSuccess: () => { toast.success(message); key.invalidateQueries({ queryKey: QUERY_KEYS.dataManagement.all }) }, onError: (error) => toast.error(error?.message ?? 'The data operation failed.') }
}

export function useArchiveRecord() { const client = useQueryClient(); return useMutation(mutation(client, dataManagementApi.archive, 'Record archived.')) }
export function useRestoreArchive() { const client = useQueryClient(); return useMutation(mutation(client, dataManagementApi.restoreArchive, 'Archived record restored.')) }
export function useRestoreDeleted() { const client = useQueryClient(); return useMutation(mutation(client, ({ type, id }) => dataManagementApi.restoreDeleted(type, id), 'Deleted record restored.')) }
export function usePermanentlyDelete() { const client = useQueryClient(); return useMutation(mutation(client, ({ type, id }) => dataManagementApi.permanentlyDelete(type, id), 'Record permanently deleted.')) }
