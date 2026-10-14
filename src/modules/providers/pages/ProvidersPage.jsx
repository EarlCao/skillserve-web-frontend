import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Ban, Eye, Power, Star, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Tooltip from '../../../components/ui/Tooltip'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import PageHeader from '../../../components/common/PageHeader'
import StatusTabs from '../../../components/tables/StatusTabs'
import SortControl from '../../../components/tables/SortControl'
import RefreshButton from '../../../components/tables/RefreshButton'
import TableFooter from '../../../components/tables/TableFooter'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import { useAuth } from '../../../contexts/AuthContext'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useDisclosure } from '../../../hooks/useDisclosure'
import {
  useProviders,
  useSuspendProvider,
  useActivateProvider,
  useRemoveVerification,
} from '../hooks/useProviders'
import UserAvatar from '../../users/components/UserAvatar'
import ProviderStatusBadge from '../components/ProviderStatusBadge'
import VerificationStatusBadge from '../components/VerificationStatusBadge'
import ProviderActionModal from '../components/ProviderActionModal'
import { hasCapability } from '../../../utils/permissions'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)
const formatDate = (value) => format(new Date(value), 'MMM d, yyyy')

const VERIFICATION_TABS = [
  { value: '', label: 'All providers' },
  { value: 'pending', label: 'Pending review' },
  { value: 'verified', label: 'Verified' },
  { value: 'additional_info_required', label: 'Info required' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'unverified', label: 'Unverified' },
]

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Joined' },
  { value: 'average_rating', label: 'Rating' },
  { value: 'total_bookings', label: 'Bookings' },
  { value: 'business_name', label: 'Business name' },
]

/**
 * Provider management list: server-side search, status/verification filters,
 * sorting, pagination and the moderation actions (suspend / activate / remove verification).
 */
export default function ProvidersPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const can = (permission) => hasCapability(currentUser, permission, 'manage providers')

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
      suspendMutation.mutate({ id: target.provider.id, reason: payload }, { onSuccess: () => actionDisclosure.close() })
    } else if (target.action === 'activate') {
      activateMutation.mutate(target.provider.id, { onSuccess: () => actionDisclosure.close() })
    }
  }

  const confirmRemoveVerification = () => {
    const target = confirmTarget
    if (!target) return

    removeVerificationMutation.mutate(target.provider.id, { onSuccess: () => confirmDisclosure.close() })
  }

  const columns = [
    {
      accessorKey: 'business_name',
      header: 'Provider',
      cell: ({ row }) => {
        const provider = row.original
        const ownerName = provider.user?.name

        return (
          <div className="flex min-w-56 items-center gap-3">
            <UserAvatar name={provider.business_name || ownerName} size="sm" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{provider.business_name || ownerName}</span>
              <span className="truncate text-xs text-base-content/60">
                {provider.business_name && ownerName ? `${ownerName} · ` : ''}{provider.user?.email}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'specialization',
      header: 'Specialization',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="max-w-48 truncate">{row.original.specialization ?? <span className="text-base-content/40">Not set</span>}</span>
          <span className="font-mono text-xs text-base-content/50">ID #{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: 'average_rating',
      header: 'Rating',
      cell: ({ row }) => {
        const rating = Number(row.original.average_rating)

        return rating > 0 ? (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-base-content/50">({row.original.total_reviews})</span>
          </span>
        ) : (
          <span className="whitespace-nowrap text-sm text-base-content/40">No reviews</span>
        )
      },
    },
    {
      id: 'activity',
      header: 'Activity',
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap text-sm">
          <span>{row.original.total_bookings} {row.original.total_bookings === 1 ? 'booking' : 'bookings'}</span>
          <span className="text-xs text-base-content/50">{row.original.services_count} {row.original.services_count === 1 ? 'service' : 'services'}</span>
        </div>
      ),
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
      header: 'Joined',
      cell: ({ row }) => {
        const value = row.original.created_at

        return value ? (
          <span className="whitespace-nowrap text-sm" title={formatDateTime(value)}>{formatDate(value)}</span>
        ) : (
          <span className="text-base-content/40">—</span>
        )
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
            {can('view providers') && <Tooltip label="View profile" placement="left"><Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/providers/${provider.id}`)}
              aria-label={`View ${provider.business_name || provider.user?.name}`}
            >
              <Eye className="size-4" />
            </Button></Tooltip>}
            {isSuspended ? (
              can('activate providers') && <Tooltip label="Activate provider" placement="left"><Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModerationTarget({ provider, action: 'activate' })
                  actionDisclosure.open()
                }}
                aria-label={`Activate ${provider.business_name || provider.user?.name}`}
              >
                <Power className="size-4 text-success" />
              </Button></Tooltip>
            ) : (
              can('suspend providers') && <Tooltip label="Suspend provider" placement="left"><Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModerationTarget({ provider, action: 'suspend' })
                  actionDisclosure.open()
                }}
                aria-label={`Suspend ${provider.business_name || provider.user?.name}`}
              >
                <Ban className="size-4 text-warning" />
              </Button></Tooltip>
            )}
            {provider.verification_status === 'verified' && can('verify providers') && (
              <Tooltip label="Remove verification" placement="left"><Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setConfirmTarget({ provider, action: 'removeVerification' })
                  confirmDisclosure.open()
                }}
                aria-label={`Remove verification for ${provider.business_name || provider.user?.name}`}
              >
                <XCircle className="size-4 text-error" />
              </Button></Tooltip>
            )}
          </div>
        )
      },
    },
  ]

  const hasFilters = Boolean(search || statusFilter || verificationFilter)
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setVerificationFilter('')
    pagination.setCurrentPage(1)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Provider Management"
        description="Service providers on the platform — review profiles and verification, suspend or reactivate them."
      />

      <Card bodyClassName="p-0" className="overflow-hidden border border-base-200 shadow-none">
        <div className="border-b border-base-200 px-4">
          <StatusTabs
            label="Filter by verification"
            options={VERIFICATION_TABS}
            value={verificationFilter}
            onChange={applyFilter(setVerificationFilter)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search name, email or business"
            size="sm"
            className="w-full min-w-0 sm:w-72"
          />

          <select
            className="select select-bordered select-sm w-auto"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          {hasFilters && (
            <button type="button" className="btn btn-link btn-sm px-1 no-underline" onClick={clearFilters}>
              Clear filters
            </button>
          )}

          <div className="ml-auto flex items-center gap-1">
            <SortControl
              options={SORT_OPTIONS}
              sort={sort}
              direction={direction}
              onSortChange={applyFilter(setSort)}
              onToggleDirection={() => setDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}
            />
            <RefreshButton onClick={() => refetch()} isFetching={isFetching} label="Refresh providers" />
          </div>
        </div>

        {isError ? (
          <ErrorState title="Could not load providers" message={error?.message} onRetry={refetch} />
        ) : (
          <div className="border-t border-base-200">
            <DataTable
              variant="clean"
              columns={columns}
              data={providers}
              isLoading={isLoading}
              emptyTitle={hasFilters ? 'No providers match' : 'No providers yet'}
              emptyDescription={hasFilters ? 'Try a different search or clear the filters.' : 'Providers appear here when they register in the app.'}
            />
          </div>
        )}

        <TableFooter meta={paginationMeta} perPage={PER_PAGE} pagination={pagination} noun="providers" />
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
