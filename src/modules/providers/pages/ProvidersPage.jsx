import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Ban, Eye, Power, RefreshCw, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useDisclosure } from '../../../hooks/useDisclosure'
import {
  useProviders,
  useSuspendProvider,
  useActivateProvider,
  useRemoveVerification,
} from '../hooks/useProviders'
import ProviderAvatar from '../components/ProviderAvatar'
import ProviderStatusBadge from '../components/ProviderStatusBadge'
import VerificationStatusBadge from '../components/VerificationStatusBadge'
import ProviderActionModal from '../components/ProviderActionModal'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

/**
 * Provider management list: server-side search, status/verification filters,
 * sorting, pagination and the moderation actions (suspend / activate / remove verification).
 */
export default function ProvidersPage() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState('desc')
  const pagination = usePagination({ perPage: PER_PAGE })

  const [moderationTarget, setModerationTarget] = useState(null) // { provider, action }
  const [confirmTarget, setConfirmTarget] = useState(null) // { provider, action }
  const actionDisclosure = useDisclosure()
  const confirmDisclosure = useDisclosure()

  const suspendMutation = useSuspendProvider()
  const activateMutation = useActivateProvider()
  const removeVerificationMutation = useRemoveVerification()

  const { data, isLoading, isFetching, isError, error, refetch } = useProviders({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    verification: verificationFilter || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const providers = data?.data ?? []
  const paginationMeta = data?.meta?.pagination

  // A filter change restarts at page 1.
  const applyFilter = (setter) => (value) => {
    setter(value)
    pagination.setCurrentPage(1)
  }

  // Step back when the current page no longer exists (e.g. last row removed).
  useEffect(() => {
    if (paginationMeta && pagination.currentPage > paginationMeta.last_page) {
      pagination.setCurrentPage(paginationMeta.last_page)
    }
  }, [paginationMeta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const confirmModeration = (payload) => {
    const target = moderationTarget
    if (!target) return

    if (target.action === 'suspend') {
      suspendMutation.mutate({ id: target.provider.id, reason: payload }, { onSettled: () => actionDisclosure.close() })
    } else if (target.action === 'activate') {
      activateMutation.mutate(target.provider.id, { onSettled: () => actionDisclosure.close() })
    }
  }

  const confirmRemoveVerification = () => {
    const target = confirmTarget
    if (!target) return

    removeVerificationMutation.mutate(target.provider.id, { onSettled: () => confirmDisclosure.close() })
  }

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-base-content/60">#{row.original.id}</span>,
    },
    {
      accessorKey: 'business_name',
      header: 'Provider',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <ProviderAvatar name={row.original.user?.name ?? row.original.business_name} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium">{row.original.business_name || row.original.user?.name}</span>
            <span className="text-xs text-base-content/60">{row.original.user?.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'specialization',
      header: 'Specialization',
      cell: ({ row }) =>
        row.original.specialization ?? <span className="text-base-content/40">—</span>,
    },
    {
      accessorKey: 'average_rating',
      header: 'Rating',
      cell: ({ row }) => {
        const rating = row.original.average_rating
        return (
          <div className="flex items-center gap-1">
            <span className="font-medium">{rating > 0 ? Number(rating).toFixed(1) : '—'}</span>
            {rating > 0 && <span className="text-xs text-base-content/50">({row.original.total_reviews})</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'verification_status',
      header: 'Verification',
      cell: ({ row }) => <VerificationStatusBadge status={row.original.verification_status} />,
    },
    {
      accessorKey: 'is_suspended',
      header: 'Status',
      cell: ({ row }) => <ProviderStatusBadge isSuspended={row.original.is_suspended} />,
    },
    {
      accessorKey: 'created_at',
      header: 'Created date',
      cell: ({ row }) => {
        const value = formatDateTime(row.original.created_at)
        return value ? <span className="whitespace-nowrap">{value}</span> : <span className="text-base-content/40">—</span>
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const provider = row.original
        const isSuspended = provider.is_suspended

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/providers/${provider.id}`)}
              aria-label={`View ${provider.business_name || provider.user?.name}`}
            >
              <Eye className="size-4" />
            </Button>
            {isSuspended ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModerationTarget({ provider, action: 'activate' })
                  actionDisclosure.open()
                }}
                aria-label={`Activate ${provider.business_name || provider.user?.name}`}
              >
                <Power className="size-4 text-success" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModerationTarget({ provider, action: 'suspend' })
                  actionDisclosure.open()
                }}
                aria-label={`Suspend ${provider.business_name || provider.user?.name}`}
              >
                <Ban className="size-4 text-warning" />
              </Button>
            )}
            {provider.verification_status === 'verified' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setConfirmTarget({ provider, action: 'removeVerification' })
                  confirmDisclosure.open()
                }}
                aria-label={`Remove verification for ${provider.business_name || provider.user?.name}`}
              >
                <XCircle className="size-4 text-error" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Provider Management</h1>
        <p className="text-sm text-base-content/60">Manage service provider accounts — view profiles, verify, suspend or activate.</p>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by name, email or business…"
            className="w-44 shrink min-w-0 sm:w-60"
          />

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            className="select select-bordered select-sm w-40 shrink-0"
            value={verificationFilter}
            onChange={(event) => applyFilter(setVerificationFilter)(event.target.value)}
            aria-label="Filter by verification"
          >
            <option value="">All verification</option>
            <option value="unverified">Unverified</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="additional_info_required">Info Required</option>
          </select>

          <select
            className="select select-bordered select-sm w-40 shrink-0"
            value={sort}
            onChange={(event) => applyFilter(setSort)(event.target.value)}
            aria-label="Sort by"
          >
            <option value="created_at">Created date</option>
            <option value="average_rating">Rating</option>
            <option value="total_bookings">Bookings</option>
            <option value="business_name">Business name</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0 whitespace-nowrap"
            onClick={() => setDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}
          >
            {direction === 'asc' ? 'Ascending' : 'Descending'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh providers"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load providers" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={providers}
            isLoading={isLoading}
            emptyTitle="No providers found"
            emptyDescription="Try adjusting your search or filters."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
          <p className="text-sm text-base-content/60">
            {paginationMeta ? `${paginationMeta.from ?? 0}–${paginationMeta.to ?? 0} of ${paginationMeta.total}` : ''}
          </p>
          <Pagination totalItems={paginationMeta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
        </div>
      </Card>

      <ProviderActionModal
        key={moderationTarget ? `${moderationTarget.provider.id}-${moderationTarget.action}-${actionDisclosure.isOpen}` : 'closed'}
        open={actionDisclosure.isOpen}
        onClose={actionDisclosure.close}
        onConfirm={confirmModeration}
        loading={moderationTarget?.action === 'suspend' ? suspendMutation.isPending : activateMutation.isPending}
        action={moderationTarget?.action ?? 'suspend'}
        title={
          moderationTarget?.action === 'activate'
            ? 'Activate provider?'
            : 'Suspend provider?'
        }
        description={
          moderationTarget
            ? moderationTarget.action === 'activate'
              ? `This will restore ${moderationTarget.provider.business_name || moderationTarget.provider.user?.name}'s access to the platform.`
              : `${moderationTarget.provider.business_name || moderationTarget.provider.user?.name} will not be able to offer services while suspended.`
            : ''
        }
        confirmText={
          moderationTarget?.action === 'activate'
            ? 'Activate provider'
            : 'Suspend provider'
        }
        variant={
          moderationTarget?.action === 'activate'
            ? 'primary'
            : 'warning'
        }
      />

      <ConfirmDialog
        open={confirmDisclosure.isOpen}
        onCancel={confirmDisclosure.close}
        onConfirm={confirmRemoveVerification}
        loading={removeVerificationMutation.isPending}
        title="Remove verification?"
        description={
          confirmTarget
            ? `This will remove the verified status of ${confirmTarget.provider.business_name || confirmTarget.provider.user?.name}. They will need to re-apply for verification.`
            : ''
        }
        confirmText="Remove verification"
        variant="error"
      />
    </div>
  )
}
