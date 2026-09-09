import { useState } from 'react'
import { Archive, Download, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ErrorState from '../../../components/common/ErrorState'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import Pagination from '../../../components/tables/Pagination'
import Skeleton from '../../../components/ui/Skeleton'
import { useAuth } from '../../../contexts/AuthContext'
import { usePagination } from '../../../hooks/usePagination'
import { dataManagementApi } from '../api/dataManagementApi'
import { useArchiveRecord, useArchivedRecords, useDeletedRecords, usePermanentlyDelete, useRestoreArchive, useRestoreDeleted } from '../hooks/useDataManagement'

const TYPES = [['users', 'Users'], ['providers', 'Providers'], ['services', 'Services'], ['bookings', 'Bookings'], ['reviews', 'Reviews'], ['activity', 'System activity']]

export default function DataManagementPage() {
  const [exportType, setExportType] = useState('users')
  const [confirm, setConfirm] = useState(null)
  const [archiveId, setArchiveId] = useState('')
  const pagination = usePagination({ perPage: 10 })
  const archivePagination = usePagination({ perPage: 10 })
  const { user } = useAuth()
  const permissions = user?.permissions ?? []
  const isSuperAdmin = user?.roles?.includes('super-admin')
  const canExport = isSuperAdmin || permissions.includes('export system data')
  const canArchive = isSuperAdmin || permissions.includes('archive records')
  const canRestoreArchive = isSuperAdmin || permissions.includes('restore archived records')
  const canRestoreDeleted = isSuperAdmin || permissions.includes('restore deleted records')
  const canDelete = isSuperAdmin || permissions.includes('manage deleted records')
  const deleted = useDeletedRecords({ per_page: 10, page: pagination.currentPage }, canDelete)
  const archives = useArchivedRecords({ per_page: 10, page: archivePagination.currentPage }, canRestoreArchive)
  const archive = useArchiveRecord()
  const restoreArchive = useRestoreArchive()
  const restore = useRestoreDeleted()
  const remove = usePermanentlyDelete()
  const records = deleted.data?.data ?? []

  const download = async () => {
    try {
      const response = await dataManagementApi.export(exportType)
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a'); link.href = url; link.download = `${exportType}-export.csv`; link.click(); URL.revokeObjectURL(url)
      toast.success('Export downloaded.')
    } catch (error) { toast.error(error?.message ?? 'Unable to export data.') }
  }

  return (
    <div className="flex flex-col gap-4">
      <div><h1 className="text-2xl font-bold">Data Management</h1><p className="text-sm text-base-content/60">Export system records and manage records removed from active use.</p></div>
      {canExport && <Card title="Export system data" description="Download a CSV export of an authorized system record set."><div className="flex flex-wrap gap-2"><select className="select select-bordered" value={exportType} onChange={(event) => setExportType(event.target.value)} aria-label="Export record type">{TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Button onClick={download}><Download className="size-4" /> Export CSV</Button></div></Card>}
      {canArchive && <Card title="Archive a service" description="Archived services are removed from publication without deleting their record."><div className="flex flex-wrap gap-2"><input className="input input-bordered" type="number" min="1" value={archiveId} onChange={(event) => setArchiveId(event.target.value)} placeholder="Service ID" aria-label="Service ID to archive" /><Button disabled={!archiveId} loading={archive.isPending} onClick={() => archive.mutate({ resource_type: 'services', resource_id: Number(archiveId) }, { onSuccess: () => setArchiveId('') })}><Archive className="size-4" /> Archive service</Button></div></Card>}
      {canRestoreArchive && <Card title="Archived records" description="Restore archived services to their previous publication state.">{archives.isError ? <ErrorState title="Could not load archived records" message={archives.error?.message} onRetry={archives.refetch} /> : archives.isLoading ? <Skeleton className="h-32 w-full" /> : (archives.data?.data ?? []).length === 0 ? <p className="py-8 text-center text-sm text-base-content/60">No archived records</p> : <><div className="overflow-x-auto"><table className="table"><thead><tr><th>Type</th><th>ID</th><th>Archived</th><th /></tr></thead><tbody>{archives.data.data.map((record) => <tr key={record.id}><td className="capitalize">{record.resource_type.replaceAll('_', ' ')}</td><td>{record.resource_id}</td><td>{record.archived_at ? new Date(record.archived_at).toLocaleString() : '—'}</td><td className="text-right"><Button size="sm" variant="outline" loading={restoreArchive.isPending} onClick={() => restoreArchive.mutate(record.id)}><RotateCcw className="size-4" /> Restore</Button></td></tr>)}</tbody></table></div><div className="flex justify-end border-t border-base-200 p-4"><Pagination totalItems={archives.data?.meta?.pagination?.total ?? 0} perPage={10} pagination={archivePagination} /></div></>}</Card>}
      <Card title="Deleted records" description="Review soft-deleted records. Restore eligible records or permanently remove them.">
        {deleted.isLoading ? <Skeleton className="h-48 w-full" /> : deleted.isError ? <ErrorState title="Could not load deleted records" message={deleted.error?.message} onRetry={deleted.refetch} /> : records.length === 0 ? <div className="flex flex-col items-center gap-2 py-12 text-center"><Archive className="size-10 text-base-content/30" /><p className="font-medium">No deleted records</p></div> : <><div className="overflow-x-auto"><table className="table"><thead><tr><th>Type</th><th>Record</th><th>Deleted</th><th className="text-right">Actions</th></tr></thead><tbody>{records.map((record) => <tr key={`${record.resource_type}-${record.resource_id}`}><td className="capitalize">{record.resource_type.replaceAll('_', ' ')}</td><td>{record.label}</td><td>{record.deleted_at ? new Date(record.deleted_at).toLocaleString() : '—'}</td><td className="flex justify-end gap-2">{canRestoreDeleted && <Button size="sm" variant="outline" onClick={() => restore.mutate({ type: record.resource_type, id: record.resource_id })} loading={restore.isPending}><RotateCcw className="size-4" /> Restore</Button>}{canDelete && ['messages', 'reports'].includes(record.resource_type) && <Button size="sm" variant="error" onClick={() => setConfirm(record)}><Trash2 className="size-4" /> Delete</Button>}</td></tr>)}</tbody></table></div><div className="flex justify-end border-t border-base-200 p-4"><Pagination totalItems={deleted.data?.meta?.pagination?.total ?? 0} perPage={10} pagination={pagination} /></div></>}
      </Card>
       <ConfirmDialog open={Boolean(confirm)} onCancel={() => setConfirm(null)} onConfirm={() => { if (!confirm) return; remove.mutate({ type: confirm.resource_type, id: confirm.resource_id }, { onSuccess: () => setConfirm(null) }) }} loading={remove.isPending} title="Permanently delete record?" description="This action cannot be undone." confirmText="Delete permanently" variant="error" />
    </div>
  )
}
