import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Eye, RefreshCw } from 'lucide-react'
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
import DisputeStatusBadge from '../../bookings/components/DisputeStatusBadge'
import DisputeDetailsModal from '../components/DisputeDetailsModal'
import DisputeActionModal from '../components/DisputeActionModal'
import {
  useAddDisputeNote,
  useCloseDispute,
  useDisputes,
  useInvestigateDispute,
  useRejectDispute,
  useResolveDispute,
} from '../hooks/useDisputes'

const PER_PAGE = 10
const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

export default function DisputesPage() {
  const { user } = useAuth()
  const canManage = ['manage bookings', 'manage booking disputes'].some((permission) => (user?.permissions ?? []).includes(permission))
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('disputed_at')
  const [direction, setDirection] = useState('desc')
  const pagination = usePagination({ perPage: PER_PAGE })
  const [viewing, setViewing] = useState(null)
  const [action, setAction] = useState(null)
  const detailsDisclosure = useDisclosure()
  const actionDisclosure = useDisclosure()

  const investigate = useInvestigateDispute()
  const addNote = useAddDisputeNote()
  const resolve = useResolveDispute()
  const reject = useRejectDispute()
  const close = useCloseDispute()

  const { data, isLoading, isFetching, isError, error, refetch } = useDisputes({
    search: debouncedSearch || undefined,
    status: status || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })
  const disputes = data?.data ?? []
  const paginationMeta = data?.meta?.pagination

  const applyFilter = (setter) => (value) => { setter(value); pagination.setCurrentPage(1) }
  useEffect(() => {
    if (paginationMeta && pagination.currentPage > paginationMeta.last_page) pagination.setCurrentPage(paginationMeta.last_page)
  }, [paginationMeta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const openAction = (nextAction) => { setAction(nextAction); actionDisclosure.open() }
  const finishAction = () => { actionDisclosure.close(); detailsDisclosure.close(); setAction(null); setViewing(null) }
  const submitAction = (value) => {
    const id = viewing
    const options = { onSuccess: finishAction }
    if (action === 'investigate') investigate.mutate({ id }, options)
    if (action === 'note') addNote.mutate({ id, note: value }, options)
    if (action === 'resolve') resolve.mutate({ id, resolution: value }, options)
    if (action === 'reject') reject.mutate({ id, note: value }, options)
    if (action === 'close') close.mutate({ id, note: value || undefined }, options)
  }
  const actionLoading = investigate.isPending || addNote.isPending || resolve.isPending || reject.isPending || close.isPending

  const columns = [
    { accessorKey: 'booking_number', header: 'Booking', cell: ({ row }) => <div className="flex flex-col"><span className="font-medium">{row.original.booking_number}</span><span className="text-xs text-base-content/60">{row.original.service?.title}</span></div> },
    { accessorKey: 'client', header: 'Client', cell: ({ row }) => row.original.client?.name ?? '—' },
    { accessorKey: 'provider', header: 'Provider', cell: ({ row }) => row.original.provider?.business_name ?? '—' },
    { accessorKey: 'dispute_reason', header: 'Reason', cell: ({ row }) => <span className="max-w-[220px] truncate" title={row.original.dispute_reason}>{row.original.dispute_reason}</span> },
    { accessorKey: 'dispute_status', header: 'Status', cell: ({ row }) => <DisputeStatusBadge status={row.original.dispute_status} /> },
    { accessorKey: 'disputed_at', header: 'Submitted', cell: ({ row }) => formatDateTime(row.original.disputed_at) ?? '—' },
    { id: 'actions', header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => <Button variant="ghost" size="sm" onClick={() => { setViewing(row.original.id); detailsDisclosure.open() }} aria-label={`View dispute ${row.original.booking_number}`}><Eye className="size-4" /></Button> },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div><h1 className="text-2xl font-bold">Dispute Management</h1><p className="text-sm text-base-content/60">Review disputes, examine evidence and statements, record notes, and make final decisions.</p></div>
      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput value={search} onChange={(event) => applyFilter(setSearch)(event.target.value)} placeholder="Search booking, client, provider…" className="w-44 shrink min-w-0 sm:w-64" />
          <select className="select select-bordered select-sm w-32 shrink-0" value={status} onChange={(event) => applyFilter(setStatus)(event.target.value)} aria-label="Filter disputes by status"><option value="">All statuses</option><option value="pending">Pending</option><option value="investigated">Investigated</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option><option value="closed">Closed</option></select>
          <input type="date" className="input input-bordered input-sm w-36 shrink-0" value={dateFrom} onChange={(event) => applyFilter(setDateFrom)(event.target.value)} aria-label="Disputed from" />
          <input type="date" className="input input-bordered input-sm w-36 shrink-0" value={dateTo} onChange={(event) => applyFilter(setDateTo)(event.target.value)} aria-label="Disputed to" />
          <select className="select select-bordered select-sm w-36 shrink-0" value={sort} onChange={(event) => applyFilter(setSort)(event.target.value)} aria-label="Sort disputes"><option value="disputed_at">Disputed date</option><option value="booking_number">Booking number</option><option value="dispute_status">Status</option></select>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setDirection((value) => value === 'asc' ? 'desc' : 'asc')}>{direction === 'asc' ? 'Ascending' : 'Descending'}</Button>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh disputes"><RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /></Button>
        </div>
        {isError ? <ErrorState title="Could not load disputes" message={error?.message} onRetry={refetch} /> : <DataTable columns={columns} data={disputes} isLoading={isLoading} emptyTitle="No disputes found" emptyDescription="Try adjusting your search or filters." />}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4"><p className="text-sm text-base-content/60">{paginationMeta ? `${paginationMeta.from ?? 0}–${paginationMeta.to ?? 0} of ${paginationMeta.total}` : ''}</p><Pagination totalItems={paginationMeta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} /></div>
      </Card>

      <DisputeDetailsModal open={detailsDisclosure.isOpen} onClose={() => { detailsDisclosure.close(); setViewing(null) }} bookingId={viewing} onAction={openAction} canManage={canManage} />
      <DisputeActionModal key={`${viewing ?? 'none'}-${action ?? 'none'}`} open={actionDisclosure.isOpen} onClose={() => { actionDisclosure.close(); setAction(null) }} action={action} loading={actionLoading} onConfirm={submitAction} />
    </div>
  )
}
