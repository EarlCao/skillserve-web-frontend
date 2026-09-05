import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Bell, Plus, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useAuth } from '../../../contexts/AuthContext'
import { useCreateAnnouncement, useNotifications } from '../hooks/useNotifications'
import AnnouncementModal from '../components/AnnouncementModal'

const PER_PAGE = 10
const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : '—')

function statusClass(status) {
  return { sent: 'badge-success', scheduled: 'badge-info', pending: 'badge-warning', failed: 'badge-error' }[status] ?? 'badge-ghost'
}

export default function NotificationsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [target, setTarget] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const pagination = usePagination({ perPage: PER_PAGE })
  const modal = useDisclosure()
  const { user } = useAuth()
  const permissions = user?.permissions ?? []
  const canSend = permissions.includes('send announcements') || user?.roles?.includes('super-admin')
  const canTarget = permissions.includes('target notifications') || user?.roles?.includes('super-admin')
  const canSchedule = permissions.includes('schedule announcements') || user?.roles?.includes('super-admin')
  const createMutation = useCreateAnnouncement()
  const { data, isLoading, isFetching, isError, error, refetch } = useNotifications({
    search: debouncedSearch || undefined,
    status: status || undefined,
    target: target || undefined,
    sort: 'created_at',
    direction: 'desc',
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const announcements = data?.data ?? []
  const meta = data?.meta?.pagination
  useEffect(() => {
    if (meta && pagination.currentPage > meta.last_page) pagination.setCurrentPage(meta.last_page)
  }, [meta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const resetPage = (setter) => (event) => {
    setter(event.target.value)
    pagination.setCurrentPage(1)
  }

  const columns = [
    { accessorKey: 'title', header: 'Announcement', cell: ({ row }) => <div className="max-w-[300px]"><p className="truncate font-medium">{row.original.title}</p><p className="truncate text-xs text-base-content/60">{row.original.message}</p></div> },
    { accessorKey: 'target', header: 'Audience', cell: ({ row }) => <span className="capitalize">{row.original.target === 'all' ? 'All users' : row.original.target}</span> },
    { accessorKey: 'recipient_count', header: 'Recipients', cell: ({ row }) => row.original.recipient_count },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <span className={`badge ${statusClass(row.original.status)} badge-sm capitalize`}>{row.original.status}</span> },
    { accessorKey: 'created_at', header: 'Created', cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.created_at)}</span> },
    { accessorKey: 'scheduled_at', header: 'Scheduled / sent', cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.scheduled_at ?? row.original.sent_at)}</span> },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Notifications & Announcements</h1><p className="text-sm text-base-content/60">Send targeted announcements and review delivery history.</p></div>
        {canSend && <Button onClick={modal.open}><Plus className="size-4" /> New announcement</Button>}
      </div>
      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput value={search} onChange={resetPage(setSearch)} placeholder="Search announcements…" className="w-56 shrink-0" />
          <select className="select select-bordered select-sm w-32 shrink-0" value={status} onChange={resetPage(setStatus)} aria-label="Filter by status"><option value="">All statuses</option><option value="sent">Sent</option><option value="scheduled">Scheduled</option><option value="pending">Pending</option></select>
          <select className="select select-bordered select-sm w-36 shrink-0" value={target} onChange={resetPage(setTarget)} aria-label="Filter by audience"><option value="">All audiences</option><option value="customers">Clients</option><option value="providers">Providers</option><option value="selected">Selected users</option></select>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh notifications"><RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /></Button>
        </div>
        {isError ? <ErrorState title="Could not load notification history" message={error?.message} onRetry={refetch} /> : announcements.length === 0 && !isLoading ? <div className="p-8"><div className="mx-auto flex max-w-sm flex-col items-center text-center"><Bell className="size-10 text-base-content/30" /><p className="mt-3 font-medium">No notifications found</p><p className="text-sm text-base-content/60">Create an announcement to notify your users.</p></div></div> : <DataTable columns={columns} data={announcements} isLoading={isLoading} emptyTitle="No notifications found" />}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4"><p className="text-sm text-base-content/60">{meta ? `${meta.from ?? 0}–${meta.to ?? 0} of ${meta.total}` : ''}</p><Pagination totalItems={meta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} /></div>
      </Card>
      <AnnouncementModal key={modal.isOpen ? 'open' : 'closed'} open={modal.isOpen} onClose={modal.close} mutation={createMutation} canTarget={canTarget} canSchedule={canSchedule} />
    </div>
  )
}
