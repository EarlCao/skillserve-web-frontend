import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ClipboardList, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import ErrorState from '../../../components/common/ErrorState'
import SearchInput from '../../../components/common/SearchInput'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useAuth } from '../../../contexts/AuthContext'
import { useAuditAdministrators, useAuditLogs } from '../hooks/useAudit'

const PER_PAGE = 15
const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : '—')

const VIEW_OPTIONS = [
  { value: 'all', label: 'All audit logs' },
  { value: 'login', label: 'Login activity' },
  { value: 'security', label: 'Security events' },
]

function actionLabel(action) {
  return action?.replaceAll('_', ' ') ?? 'Unknown action'
}

export default function AuditLogsPage() {
  const { user } = useAuth()
  const permissions = user?.permissions ?? []
  const isSuperAdmin = user?.roles?.includes('super-admin')
  const canAll = isSuperAdmin || permissions.includes('view audit logs')
  const canLogin = isSuperAdmin || permissions.includes('view login activity')
  const canSecurity = isSuperAdmin || permissions.includes('monitor security events')
  const [view, setView] = useState(() => (canAll ? 'all' : canLogin ? 'login' : 'security'))
  const [search, setSearch] = useState('')
  const [administratorId, setAdministratorId] = useState('')
  const [module, setModule] = useState('')
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const pagination = usePagination({ perPage: PER_PAGE })
  const administratorsQuery = useAuditAdministrators()
  const { data, isLoading, isFetching, isError, error, refetch } = useAuditLogs({
    view,
    search: debouncedSearch || undefined,
    administrator_id: administratorId || undefined,
    module: module || undefined,
    action: action || undefined,
    from: from || undefined,
    to: to || undefined,
    sort: 'created_at',
    direction: 'desc',
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const rows = data?.data ?? []
  const meta = data?.meta?.pagination
  const administrators = administratorsQuery.data?.data ?? []

  useEffect(() => {
    if (meta && pagination.currentPage > meta.last_page) pagination.setCurrentPage(meta.last_page)
  }, [meta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const resetPage = (setter) => (event) => {
    setter(event.target.value)
    pagination.setCurrentPage(1)
  }

  const columns = [
    { accessorKey: 'created_at', header: 'Time', cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.created_at)}</span> },
    { accessorKey: 'action', header: 'Action', cell: ({ row }) => <span className="font-medium capitalize">{actionLabel(row.original.action)}</span> },
    { accessorKey: 'module', header: 'Module', cell: ({ row }) => <span className="badge badge-ghost badge-sm capitalize">{row.original.module || 'system'}</span> },
    { accessorKey: 'administrator', header: 'Administrator', cell: ({ row }) => <div className="flex flex-col"><span className="font-medium">{row.original.administrator?.name ?? 'System'}</span><span className="text-xs text-base-content/60">{row.original.administrator?.email}</span></div> },
    { accessorKey: 'subject_type', header: 'Subject', cell: ({ row }) => <span className="capitalize">{row.original.subject_type || '—'}{row.original.subject_id ? ` #${row.original.subject_id}` : ''}</span> },
    { accessorKey: 'properties', header: 'Details', cell: ({ row }) => <span className="block max-w-[260px] truncate text-xs text-base-content/60" title={JSON.stringify(row.original.properties)}>{Object.entries(row.original.properties ?? {}).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') || '—'}</span> },
  ]

  return <div className="flex flex-col gap-4">
    <div><h1 className="text-2xl font-bold">Security & Audit Logs</h1><p className="text-sm text-base-content/60">Review administrator actions, login activity, and security events.</p></div>
    <Card><div className="flex flex-wrap gap-2">{VIEW_OPTIONS.filter((option) => option.value === 'all' ? canAll : option.value === 'login' ? canLogin : canSecurity).map((option) => <button key={option.value} type="button" className={`btn btn-sm ${view === option.value ? 'btn-primary' : 'btn-outline'}`} aria-pressed={view === option.value} onClick={() => { setView(option.value); pagination.setCurrentPage(1) }}>{option.label}</button>)}</div></Card>
    <Card bodyClassName="p-0"><div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4"><SearchInput value={search} onChange={resetPage(setSearch)} placeholder="Search actions or administrators…" className="w-56 shrink-0" /><select className="select select-bordered select-sm w-44 shrink-0" value={administratorId} onChange={resetPage(setAdministratorId)} aria-label="Filter by administrator"><option value="">All administrators</option>{administrators.map((admin) => <option key={admin.id} value={admin.id}>{admin.name}</option>)}</select><input className="input input-bordered input-sm shrink-0" value={module} onChange={resetPage(setModule)} placeholder="Module" aria-label="Filter by module" /><input className="input input-bordered input-sm shrink-0" value={action} onChange={resetPage(setAction)} placeholder="Action" aria-label="Filter by action" /><label className="flex shrink-0 items-center gap-1 text-sm">From <input type="date" className="input input-bordered input-sm" value={from} onChange={resetPage(setFrom)} /></label><label className="flex shrink-0 items-center gap-1 text-sm">To <input type="date" className="input input-bordered input-sm" value={to} onChange={resetPage(setTo)} /></label><Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh audit logs"><RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /></Button></div>{isError ? <ErrorState title="Could not load audit logs" message={error?.message} onRetry={refetch} /> : rows.length === 0 && !isLoading ? <div className="flex flex-col items-center gap-2 py-12 text-center text-base-content/60"><ClipboardList className="size-10" /><p>No audit activity found.</p></div> : <DataTable columns={columns} data={rows} isLoading={isLoading} emptyTitle="No audit activity found" emptyDescription="Try adjusting your filters." />}<div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4"><p className="text-sm text-base-content/60">{meta ? `${meta.from ?? 0}–${meta.to ?? 0} of ${meta.total}` : ''}</p><Pagination totalItems={meta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} /></div></Card>
  </div>
}
