import { useEffect, useState } from 'react'
import { differenceInCalendarDays, format } from 'date-fns'
import { Ban, CirclePause, Eye, Pencil, Power, Trash2, UserCheck } from 'lucide-react'
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
import { useUsers, useActivateUser, useBanUser, useDeleteUser, useSuspendUser, useUnbanUser } from '../hooks/useUsers'
import UserAvatar from '../components/UserAvatar'
import UserStatusBadge from '../components/UserStatusBadge'
import VerificationBadge from '../components/VerificationBadge'
import IdentityStatusBadge from '../../identityVerifications/components/IdentityStatusBadge'
import UserFormModal from '../components/UserFormModal'
import UserActionModal from '../components/UserActionModal'
import { hasCapability } from '../../../utils/permissions'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)
const formatDate = (value) => format(new Date(value), 'MMM d, yyyy')

const STATUS_TABS = [
  { value: '', label: 'All customers' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
]

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Joined' },
  { value: 'name', label: 'Name' },
  { value: 'last_login_at', label: 'Last login' },
]

// Short countdown shown under the Banned badge, e.g. "Lifts in 5 days".
const banCountdown = (bannedUntil) => {
  const days = differenceInCalendarDays(new Date(bannedUntil), new Date())

  if (days <= 0) return 'Lifts today'

  return `Lifts in ${days} day${days === 1 ? '' : 's'}`
}

/**
 * Customer management list: server-side search (name/email/ID), status
 * and verification filters, sorting, pagination and the moderation
 * actions (suspend / activate / ban / delete).
 */
export default function UsersPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const can = (permission) => hasCapability(currentUser, permission, 'manage users')

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState('desc')
  const pagination = usePagination({ perPage: PER_PAGE })

  const [editing, setEditing] = useState(null)
  const [moderationTarget, setModerationTarget] = useState(null) // { user, action }
  const [confirmTarget, setConfirmTarget] = useState(null) // { user, action }
  const actionDisclosure = useDisclosure()
  const confirmDisclosure = useDisclosure()

  const suspendMutation = useSuspendUser()
  const activateMutation = useActivateUser()
  const banMutation = useBanUser()
  const unbanMutation = useUnbanUser()
  const deleteMutation = useDeleteUser()

  const { data, isLoading, isFetching, isError, error, refetch } = useUsers({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    verification: verificationFilter || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const users = data?.data ?? []
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

  const moderationMutation =
    moderationTarget?.action === 'ban'
      ? banMutation
      : moderationTarget?.action === 'unban'
        ? unbanMutation
        : suspendMutation

  const confirmModeration = (payload) => {
    const target = moderationTarget
    if (!target) return

    if (target.action === 'ban') {
      banMutation.mutate({ id: target.user.id, ...payload }, { onSuccess: () => actionDisclosure.close() })
    } else if (target.action === 'unban') {
      unbanMutation.mutate({ id: target.user.id, reason: payload || undefined }, { onSuccess: () => actionDisclosure.close() })
    } else {
      suspendMutation.mutate({ id: target.user.id, reason: payload }, { onSuccess: () => actionDisclosure.close() })
    }
  }

  const confirmSimpleAction = () => {
    const target = confirmTarget
    if (!target) return

    if (target.action === 'activate') {
      activateMutation.mutate(target.user.id, { onSuccess: () => confirmDisclosure.close() })
    } else {
      deleteMutation.mutate(target.user.id, { onSuccess: () => confirmDisclosure.close() })
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="flex min-w-56 items-center gap-3">
          <UserAvatar name={row.original.name} src={row.original.profile_photo_url} size="sm" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{row.original.name}</span>
            <span className="truncate text-xs text-base-content/60">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="whitespace-nowrap">{row.original.phone ?? <span className="text-base-content/40">No phone</span>}</span>
          <span className="font-mono text-xs text-base-content/50">ID #{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { status, banned_until: bannedUntil } = row.original

        return (
          <div className="flex flex-col items-start gap-1">
            <UserStatusBadge status={status} bannedUntil={bannedUntil} />
            {status === 'banned' && (
              <span className="text-xs text-base-content/50">
                {bannedUntil ? banCountdown(bannedUntil) : 'Permanent'}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'verification',
      header: 'Verification',
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <VerificationBadge verified={row.original.verification === 'verified'} size="sm" />
          <span className="flex items-center gap-1.5">
            <span className="text-xs text-base-content/50">ID</span>
            <IdentityStatusBadge status={row.original.identity_status} size="sm" />
          </span>
        </div>
      ),
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
        const user = row.original
        const isBanned = user.status === 'banned'
        const isSuspended = user.status === 'suspended'

        return (
          <div className="flex justify-end gap-1">
            {can('view users') && <Tooltip label="View profile" placement="left"><Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/users/${user.id}`)}
              aria-label={`View ${user.name}`}
            >
              <Eye className="size-4" />
            </Button></Tooltip>}
            {can('edit users') && <Tooltip label="Edit details" placement="left"><Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(user)}
              aria-label={`Edit ${user.name}`}
            >
              <Pencil className="size-4" />
            </Button></Tooltip>}
            {!isBanned &&
              (isSuspended ? (
                can('activate users') && <Tooltip label="Activate account" placement="left"><Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmTarget({ user, action: 'activate' })
                    confirmDisclosure.open()
                  }}
                  aria-label={`Activate ${user.name}`}
                >
                  <Power className="size-4 text-success" />
                </Button></Tooltip>
              ) : (
                can('suspend users') && <Tooltip label="Suspend account" placement="left"><Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModerationTarget({ user, action: 'suspend' })
                    actionDisclosure.open()
                  }}
                  aria-label={`Suspend ${user.name}`}
                >
                  <CirclePause className="size-4 text-warning" />
                </Button></Tooltip>
              ))}
            {!isBanned && can('ban users') && (
              <Tooltip label="Ban account" placement="left"><Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModerationTarget({ user, action: 'ban' })
                  actionDisclosure.open()
                }}
                aria-label={`Ban ${user.name}`}
              >
                <Ban className="size-4 text-error" />
              </Button></Tooltip>
            )}
            {isBanned && can('ban users') && (
              <Tooltip label="Unban account" placement="left"><Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModerationTarget({ user, action: 'unban' })
                  actionDisclosure.open()
                }}
                aria-label={`Unban ${user.name}`}
              >
                <UserCheck className="size-4 text-success" />
              </Button></Tooltip>
            )}
            {can('delete users') && <Tooltip label="Delete account" placement="left"><Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfirmTarget({ user, action: 'delete' })
                confirmDisclosure.open()
              }}
              aria-label={`Delete ${user.name}`}
            >
              <Trash2 className="size-4 text-error" />
            </Button></Tooltip>}
          </div>
        )
      },
    },
  ]

  const isActivateConfirm = confirmTarget?.action === 'activate'

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
        title="Customer Management"
        description="Customer accounts on the platform — review, edit, suspend, ban or remove them."
      />

      <Card bodyClassName="p-0" className="overflow-hidden border border-base-200 shadow-none">
        <div className="border-b border-base-200 px-4">
          <StatusTabs
            label="Filter by status"
            options={STATUS_TABS}
            value={statusFilter}
            onChange={applyFilter(setStatusFilter)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search name, email or ID"
            size="sm"
            className="w-full min-w-0 sm:w-72"
          />

          <select
            className="select select-bordered select-sm w-auto"
            value={verificationFilter}
            onChange={(event) => applyFilter(setVerificationFilter)(event.target.value)}
            aria-label="Filter by email confirmation"
          >
            <option value="">Any email status</option>
            <option value="verified">Email confirmed</option>
            <option value="unverified">Email not confirmed</option>
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
            <RefreshButton onClick={() => refetch()} isFetching={isFetching} label="Refresh customers" />
          </div>
        </div>

        {isError ? (
          <ErrorState title="Could not load customers" message={error?.message} onRetry={refetch} />
        ) : (
          <div className="border-t border-base-200">
            <DataTable
              variant="clean"
              columns={columns}
              data={users}
              isLoading={isLoading}
              emptyTitle={hasFilters ? 'No customers match' : 'No customers yet'}
              emptyDescription={hasFilters ? 'Try a different search or clear the filters.' : 'Customers appear here when they sign up in the app.'}
            />
          </div>
        )}

        <TableFooter meta={paginationMeta} perPage={PER_PAGE} pagination={pagination} noun="customers" />
      </Card>

      <UserFormModal open={Boolean(editing)} onClose={() => setEditing(null)} user={editing} />          <UserActionModal
            key={moderationTarget ? `${moderationTarget.user.id}-${moderationTarget.action}-${actionDisclosure.isOpen}` : 'closed'}
            open={actionDisclosure.isOpen}
            onClose={actionDisclosure.close}
            onConfirm={confirmModeration}
            loading={moderationMutation.isPending}
            action={moderationTarget?.action ?? 'suspend'}
            title={
              moderationTarget?.action === 'ban'
                ? 'Ban user?'
                : moderationTarget?.action === 'unban'
                  ? 'Unban user?'
                  : 'Suspend user?'
            }
            description={
              moderationTarget
                ? moderationTarget.action === 'ban'
                  ? `${moderationTarget.user.name} will not be able to sign in for the chosen duration.`
                  : moderationTarget.action === 'unban'
                    ? `This will restore ${moderationTarget.user.name}'s access to the platform immediately.`
                    : `${moderationTarget.user.name} will not be able to sign in while suspended.`
                : ''
            }
            confirmText={
              moderationTarget?.action === 'ban'
                ? 'Ban user'
                : moderationTarget?.action === 'unban'
                  ? 'Unban user'
                  : 'Suspend user'
            }
            variant={
              moderationTarget?.action === 'ban'
                ? 'error'
                : moderationTarget?.action === 'unban'
                  ? 'primary'
                  : 'warning'
            }
          />

      <ConfirmDialog
        open={confirmDisclosure.isOpen}
        onCancel={confirmDisclosure.close}
        onConfirm={confirmSimpleAction}
        loading={isActivateConfirm ? activateMutation.isPending : deleteMutation.isPending}
        title={isActivateConfirm ? 'Activate user?' : 'Delete user?'}
        description={
          confirmTarget
            ? isActivateConfirm
              ? `This will restore ${confirmTarget.user.name}'s access to the platform.`
              : `This will permanently delete ${confirmTarget.user.name}'s account. The action cannot be undone.`
            : ''
        }
        confirmText={isActivateConfirm ? 'Activate' : 'Delete'}
        variant={isActivateConfirm ? 'primary' : 'error'}
      />
    </div>
  )
}
