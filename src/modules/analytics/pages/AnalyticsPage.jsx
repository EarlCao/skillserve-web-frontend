import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Download, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useAuth } from '../../../contexts/AuthContext'
import { useExportReport, useReport } from '../hooks/useAnalytics'

const PER_PAGE = 15

const REPORT_TYPES = [
  { value: 'users', label: 'User Reports', description: 'Registration, account status, and user activity.' },
  { value: 'providers', label: 'Provider Reports', description: 'Registration, verification, services, and performance.' },
  { value: 'services', label: 'Service Reports', description: 'Listings, categories, approvals, popularity, and status.' },
  { value: 'bookings', label: 'Booking Reports', description: 'Booking activity and current status.' },
  { value: 'reviews', label: 'Review Reports', description: 'Ratings, reviews, and review moderation.' },
  { value: 'activity', label: 'System Activity Reports', description: 'Important actions performed within the system.' },
]

const STATUS_OPTIONS = {
  users: [
    ['active', 'Active'], ['suspended', 'Suspended'], ['banned', 'Banned'],
  ],
  providers: [
    ['pending', 'Pending'], ['verified', 'Verified'], ['rejected', 'Rejected'], ['additional_info_required', 'Needs info'],
  ],
  services: [
    ['draft', 'Draft'], ['published', 'Published'], ['archived', 'Archived'],
  ],
  bookings: [
    ['pending', 'Pending'], ['confirmed', 'Confirmed'], ['active', 'Active'],
    ['completed', 'Completed'], ['cancelled', 'Cancelled'], ['disputed', 'Disputed'],
  ],
  reviews: [
    ['active', 'Active'], ['hidden', 'Hidden'], ['removed', 'Removed'],
  ],
  activity: [],
}

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : '—')
const formatMoney = (value) => (value == null ? '—' : Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 }))

const STATUS_BADGES = {
  active: 'badge-success', suspended: 'badge-warning', banned: 'badge-error',
  verified: 'badge-success', pending: 'badge-warning', rejected: 'badge-error',
  additional_info_required: 'badge-info', draft: 'badge-ghost', published: 'badge-success',
  archived: 'badge-ghost', confirmed: 'badge-info', completed: 'badge-success',
  cancelled: 'badge-error', disputed: 'badge-warning', hidden: 'badge-warning',
  removed: 'badge-error',
}

const badge = (status) => <span className={`badge ${STATUS_BADGES[status] ?? 'badge-ghost'} badge-sm capitalize`}>{String(status ?? '—').replaceAll('_', ' ')}</span>

const cell = (key) => ({ row }) => {
  const value = row.original[key]

  if (value == null || value === '') return <span className="text-base-content/40">—</span>

  return String(value)
}

const dateCell = (key) => ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original[key])}</span>

const COLUMNS = {
  users: [
    { accessorKey: 'id', header: 'ID', cell: cell('id') },
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <div className="flex flex-col"><span className="font-medium">{row.original.name}</span><span className="text-xs text-base-content/60">{row.original.email}</span></div> },
    { accessorKey: 'phone', header: 'Phone', cell: cell('phone') },
    { accessorKey: 'user_type', header: 'Type', cell: ({ row }) => <span className="capitalize">{row.original.user_type}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => badge(row.original.status) },
    { accessorKey: 'activities_count', header: 'Activities', cell: cell('activities_count') },
    { accessorKey: 'last_login_at', header: 'Last login', cell: dateCell('last_login_at') },
    { accessorKey: 'created_at', header: 'Registered', cell: dateCell('created_at') },
  ],
  providers: [
    { accessorKey: 'id', header: 'ID', cell: cell('id') },
    { accessorKey: 'business_name', header: 'Business', cell: ({ row }) => <div className="flex flex-col"><span className="font-medium">{row.original.business_name}</span><span className="text-xs text-base-content/60">{row.original.owner}</span></div> },
    { accessorKey: 'email', header: 'Email', cell: cell('email') },
    { accessorKey: 'verification_status', header: 'Verification', cell: ({ row }) => badge(row.original.verification_status) },
    { accessorKey: 'services_count', header: 'Services', cell: cell('services_count') },
    { accessorKey: 'total_bookings', header: 'Bookings', cell: cell('total_bookings') },
    { accessorKey: 'completed_bookings', header: 'Completed', cell: cell('completed_bookings') },
    { accessorKey: 'average_rating', header: 'Rating', cell: cell('average_rating') },
    { accessorKey: 'total_reviews', header: 'Reviews', cell: cell('total_reviews') },
    { accessorKey: 'created_at', header: 'Registered', cell: dateCell('created_at') },
  ],
  services: [
    { accessorKey: 'id', header: 'ID', cell: cell('id') },
    { accessorKey: 'title', header: 'Service', cell: cell('title') },
    { accessorKey: 'provider', header: 'Provider', cell: cell('provider') },
    { accessorKey: 'category', header: 'Category', cell: cell('category') },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => badge(row.original.status) },
    { accessorKey: 'approval_status', header: 'Approval', cell: ({ row }) => badge(row.original.approval_status) },
    { accessorKey: 'price', header: 'Price', cell: ({ row }) => formatMoney(row.original.price) },
    { accessorKey: 'total_bookings', header: 'Bookings', cell: cell('total_bookings') },
    { accessorKey: 'average_rating', header: 'Rating', cell: cell('average_rating') },
    { accessorKey: 'is_featured', header: 'Featured', cell: ({ row }) => (row.original.is_featured ? 'Yes' : 'No') },
    { accessorKey: 'created_at', header: 'Created', cell: dateCell('created_at') },
  ],
  bookings: [
    { accessorKey: 'id', header: 'ID', cell: cell('id') },
    { accessorKey: 'booking_number', header: 'Booking #', cell: cell('booking_number') },
    { accessorKey: 'client', header: 'Client', cell: cell('client') },
    { accessorKey: 'provider', header: 'Provider', cell: cell('provider') },
    { accessorKey: 'service', header: 'Service', cell: cell('service') },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => badge(row.original.status) },
    { accessorKey: 'payment_status', header: 'Payment', cell: ({ row }) => badge(row.original.payment_status) },
    { accessorKey: 'total_price', header: 'Total', cell: ({ row }) => formatMoney(row.original.total_price) },
    { accessorKey: 'scheduled_date', header: 'Scheduled', cell: dateCell('scheduled_date') },
    { accessorKey: 'created_at', header: 'Created', cell: dateCell('created_at') },
  ],
  reviews: [
    { accessorKey: 'id', header: 'ID', cell: cell('id') },
    { accessorKey: 'reviewer', header: 'Reviewer', cell: cell('reviewer') },
    { accessorKey: 'provider', header: 'Provider', cell: cell('provider') },
    { accessorKey: 'service', header: 'Service', cell: cell('service') },
    { accessorKey: 'rating', header: 'Rating', cell: cell('rating') },
    { accessorKey: 'comment', header: 'Comment', cell: ({ row }) => <span className="block max-w-[260px] truncate" title={row.original.comment}>{row.original.comment}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => badge(row.original.status) },
    { accessorKey: 'is_reported', header: 'Reported', cell: ({ row }) => (row.original.is_reported ? 'Yes' : 'No') },
    { accessorKey: 'created_at', header: 'Created', cell: dateCell('created_at') },
  ],
  activity: [
    { accessorKey: 'id', header: 'ID', cell: cell('id') },
    { accessorKey: 'description', header: 'Action', cell: ({ row }) => <span className="capitalize">{row.original.description?.replaceAll('_', ' ')}</span> },
    { accessorKey: 'log_name', header: 'Module', cell: ({ row }) => <span className="capitalize">{row.original.log_name}</span> },
    { accessorKey: 'actor', header: 'Administrator', cell: cell('actor') },
    { accessorKey: 'subject_type', header: 'Subject', cell: ({ row }) => <span className="capitalize">{row.original.subject_type}</span> },
    { accessorKey: 'created_at', header: 'Logged at', cell: dateCell('created_at') },
  ],
}

/**
 * Reports & Analytics: generate tabular reports across every platform domain
 * and export them to CSV.
 */
export default function AnalyticsPage() {
  const { user } = useAuth()
  const [type, setType] = useState('users')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const pagination = usePagination({ perPage: PER_PAGE })
  const exportMutation = useExportReport()

  const { data, isLoading, isFetching, isError, error, refetch } = useReport(type, {
    search: debouncedSearch || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    sort: 'created_at',
    direction: 'desc',
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const rows = data?.data ?? []
  const paginationMeta = data?.meta?.pagination

  const applyFilter = (setter) => (value) => {
    setter(value)
    pagination.setCurrentPage(1)
  }

  const selectType = (value) => {
    setType(value)
    setStatus('')
    setSearch('')
    setFrom('')
    setTo('')
    pagination.setCurrentPage(1)
  }

  useEffect(() => {
    if (paginationMeta && pagination.currentPage > paginationMeta.last_page) {
      pagination.setCurrentPage(paginationMeta.last_page)
    }
  }, [paginationMeta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeType = REPORT_TYPES.find((item) => item.value === type)
  const columns = COLUMNS[type] ?? []
  const statusOptions = STATUS_OPTIONS[type] ?? []
  const canExport = user?.roles?.includes('super-admin') || user?.permissions?.includes('export analytics')

  const currentParams = {
    type,
    search: debouncedSearch || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-base-content/60">{activeType?.description}</p>
        </div>
        {canExport && (
          <Button
            variant="outline"
            size="sm"
            loading={exportMutation.isPending}
            onClick={() => exportMutation.mutate(currentParams)}
            aria-label="Export report"
          >
            <Download className="size-4" /> Export CSV
          </Button>
        )}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => selectType(item.value)}
              aria-pressed={type === item.value}
              className={`btn btn-sm ${type === item.value ? 'btn-primary' : 'btn-outline'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search…"
            className="w-44 shrink min-w-0 sm:w-60"
          />

          {statusOptions.length > 0 && (
            <select
              className="select select-bordered select-sm w-36 shrink-0"
              value={status}
              onChange={(event) => applyFilter(setStatus)(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-2 text-sm shrink-0">
            From
            <input type="date" className="input input-bordered input-sm" value={from} onChange={(event) => applyFilter(setFrom)(event.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm shrink-0">
            To
            <input type="date" className="input input-bordered input-sm" value={to} onChange={(event) => applyFilter(setTo)(event.target.value)} />
          </label>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh report"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load report" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            key={type}
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyTitle="No records found"
            emptyDescription="Try adjusting your filters or date range."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
          <p className="text-sm text-base-content/60">
            {paginationMeta ? `${paginationMeta.from ?? 0}–${paginationMeta.to ?? 0} of ${paginationMeta.total}` : ''}
          </p>
          <Pagination totalItems={paginationMeta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
        </div>
      </Card>
    </div>
  )
}
