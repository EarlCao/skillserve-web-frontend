import { useEffect, useState } from 'react'
import { Eye, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
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
import SupportTicketStatusBadge from '../components/SupportTicketStatusBadge'
import SupportTicketPriorityBadge from '../components/SupportTicketPriorityBadge'
import SupportTicketDetailsModal from '../components/SupportTicketDetailsModal'
import { useAssignSupportTicket, useResolveSupportTicket, useRespondToSupportTicket, useSupportTickets } from '../hooks/useSupportTickets'

const PER_PAGE = 10
const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : '—')

export default function SupportTicketsPage() {
  const { user } = useAuth()
  const permissions = user?.permissions ?? []
  const can = (permission) => permissions.includes('manage support') || permissions.includes(permission)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [category, setCategory] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState('desc')
  const [viewing, setViewing] = useState(null)
  const pagination = usePagination({ perPage: PER_PAGE })
  const disclosure = useDisclosure()

  const { data, isLoading, isFetching, isError, error, refetch } = useSupportTickets({
    search: debouncedSearch || undefined,
    status: status || undefined,
    priority: priority || undefined,
    category: category || undefined,
    assigned_to: assignedTo || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })
  const assign = useAssignSupportTicket()
  const respond = useRespondToSupportTicket()
  const resolve = useResolveSupportTicket()
  const tickets = data?.data ?? []
  const paginationMeta = data?.meta?.pagination

  useEffect(() => {
    if (paginationMeta && pagination.currentPage > paginationMeta.last_page) pagination.setCurrentPage(paginationMeta.last_page)
  }, [paginationMeta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = (setter) => (event) => { setter(event.target.value); pagination.setCurrentPage(1) }
  const openTicket = (id) => { setViewing(id); disclosure.open() }
  const actionLoading = assign.isPending || respond.isPending || resolve.isPending

  const columns = [
    { accessorKey: 'ticket_number', header: 'Ticket', cell: ({ row }) => <div className="flex flex-col"><span className="font-medium">{row.original.ticket_number}</span><span className="max-w-xs truncate text-xs text-base-content/60">{row.original.subject}</span></div> },
    { accessorKey: 'requester', header: 'Requester', cell: ({ row }) => row.original.requester?.name ?? 'System' },
    { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => <SupportTicketPriorityBadge priority={row.original.priority} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <SupportTicketStatusBadge status={row.original.status} /> },
    { accessorKey: 'assigned_to', header: 'Assignee', cell: ({ row }) => row.original.assigned_to?.name ?? 'Unassigned' },
    { accessorKey: 'updated_at', header: 'Updated', cell: ({ row }) => formatDateTime(row.original.updated_at) },
    { id: 'actions', header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => <Button variant="ghost" size="sm" onClick={() => openTicket(row.original.id)} aria-label={`View ${row.original.ticket_number}`}><Eye className="size-4" /></Button> },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div><h1 className="text-2xl font-bold">Support Management</h1><p className="text-sm text-base-content/60">Review, assign, respond to, and resolve support tickets.</p></div>
      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput value={search} onChange={(event) => { setSearch(event.target.value); pagination.setCurrentPage(1) }} placeholder="Search tickets, subjects, requesters…" className="w-56 shrink-0" />
          <select className="select select-bordered select-sm w-32 shrink-0" value={status} onChange={applyFilter(setStatus)} aria-label="Filter support tickets by status"><option value="">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select>
          <select className="select select-bordered select-sm w-32 shrink-0" value={priority} onChange={applyFilter(setPriority)} aria-label="Filter support tickets by priority"><option value="">All priorities</option><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select>
          <input className="input input-bordered input-sm w-36 shrink-0" value={category} onChange={applyFilter(setCategory)} placeholder="Category" aria-label="Filter support tickets by category" />
          <input className="input input-bordered input-sm w-36 shrink-0" value={assignedTo} onChange={applyFilter(setAssignedTo)} placeholder="Assignee ID" aria-label="Filter support tickets by assignee ID" inputMode="numeric" />
          <select className="select select-bordered select-sm w-36 shrink-0" value={sort} onChange={applyFilter(setSort)} aria-label="Sort support tickets"><option value="created_at">Created</option><option value="updated_at">Updated</option><option value="priority">Priority</option><option value="status">Status</option></select>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setDirection((value) => value === 'asc' ? 'desc' : 'asc')}>{direction === 'asc' ? 'Ascending' : 'Descending'}</Button>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh support tickets"><RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /></Button>
        </div>
        {isError ? <ErrorState title="Could not load support tickets" message={error?.message} onRetry={refetch} /> : <DataTable columns={columns} data={tickets} isLoading={isLoading} emptyTitle="No support tickets found" emptyDescription="Tickets created by clients or providers will appear here." />}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4"><p className="text-sm text-base-content/60">{paginationMeta ? `${paginationMeta.from ?? 0}–${paginationMeta.to ?? 0} of ${paginationMeta.total}` : ''}</p><Pagination totalItems={paginationMeta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} /></div>
      </Card>
      <SupportTicketDetailsModal
        open={disclosure.isOpen}
        onClose={() => { disclosure.close(); setViewing(null) }}
        ticketId={viewing}
        canAssign={can('assign support tickets')}
        canRespond={can('respond to support tickets')}
        canResolve={can('resolve support tickets')}
        actionLoading={actionLoading}
        onAssign={(id, assignedToValue) => assign.mutate({ id, assignedTo: assignedToValue })}
        onRespond={(id, body) => respond.mutate({ id, body })}
        onResolve={(id, resolutionNote) => resolve.mutate({ id, resolutionNote })}
      />
    </div>
  )
}
