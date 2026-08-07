import { useEffect, useState } from 'react'
import { differenceInCalendarDays, format } from 'date-fns'
import { Ban, Eye, Pencil, Power, RefreshCw, Trash2, UserCheck } from 'lucide-react'
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
import { useUsers, useActivateUser, useBanUser, useDeleteUser, useSuspendUser, useUnbanUser } from '../hooks/useUsers'
import UserAvatar from '../components/UserAvatar'
import UserStatusBadge from '../components/UserStatusBadge'
import VerificationBadge from '../components/VerificationBadge'
import UserFormModal from '../components/UserFormModal'
import UserActionModal from '../components/UserActionModal'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

// Short countdown shown under the Banned badge, e.g. "Lifts in 5 days".
const banCountdown = (bannedUntil) => {
  const days = differenceInCalendarDays(new Date(bannedUntil), new Date())

  if (days <= 0) return 'Lifts today'

  return `Lifts in ${days} day${days === 1 ? '' : 's'}`
}

/**
 * User management list: server-side search (name/email/ID), user-type,
 * status and verification filters, sorting, pagination and the moderation
 * actions (suspend / activate / ban / delete).
 */
export default function UsersPage() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [userTypeFilter, setUserTypeFilter] = useState('')
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
    user_type: userTypeFilter || undefined,
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
      banMutation.mutate({ id: target.user.id, ...payload }, { onSettled: () => actionDisclosure.close() })
    } else if (target.action === 'unban') {
      unbanMutation.mutate({ id: target.user.id, reason: payload || undefined }, { onSettled: () => actionDisclosure.close() })
    } else {
      suspendMutation.mutate({ id: target.user.id, reason: payload }, { onSettled: () => actionDisclosure.close() })
    }
  }

  const confirmSimpleAction = () => {
    const target = confirmTarget
    if (!target) return

    if (target.action === 'activate') {
      activateMutation.mutate(target.user.id, { onSettled: () => confirmDisclosure.close() })
    } else {
      deleteMutation.mutate(target.user.id, { onSettled: () => confirmDisclosure.close() })
    }
  }

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-base-content/60">#{row.original.id}</span>,
    },
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.original.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-base-content/60">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) =>
        row.original.phone ?? <span className="text-base-content/40">—</span>,
    },
    {
      accessorKey: 'user_type',
      header: 'User type',
      cell: ({ row }) => <span className="capitalize">{row.original.user_type}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { status, banned_until: bannedUntil } = row.original

        return (
          <div className="flex flex-col items-start gap-0.5">
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
      accessorKey: 'verification',
      header: 'Verification',
      cell: ({ row }) => <VerificationBadge verified={row.original.verification === 'verified'} />,
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
        const user = row.original
        const isBanned = user.status === 'banned'
        const isSuspended = user.status === 'suspended'

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/users/${user.id}`)}
              aria-label={`View ${user.name}`}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(user)}
              aria-label={`Edit ${user.name}`}
            >
              <Pencil className="size-4" />
            </Button>
            {!isBanned &&
              (isSuspended ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmTarget({ user, action: 'activate' })
                    confirmDisclosure.open()
                  }}
                  aria-label={`Activate ${user.name}`}
                >
                  <Power className="size-4 text-success" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModerationTarget({ user, action: 'suspend' })
                    actionDisclosure.open()
                  }}
                  aria-label={`Suspend ${user.name}`}
                >
                  <Power className="size-4 text-warning" />
                </Button>
              ))}
            {!isBanned && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModerationTarget({ user, action: 'ban' })
                  actionDisclosure.open()
                }}
                aria-label={`Ban ${user.name}`}
              >
                <Ban className="size-4 text-error" />
              </Button>
            )}
            {isBanned && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModerationTarget({ user, action: 'unban' })
                  actionDisclosure.open()
                }}
                aria-label={`Unban ${user.name}`}
                title="Unban"
              >
                <UserCheck className="size-4 text-success" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfirmTarget({ user, action: 'delete' })
                confirmDisclosure.open()
              }}
              aria-label={`Delete ${user.name}`}
            >
              <Trash2 className="size-4 text-error" />
            </Button>
          </div>
        )
      },
    },
  ]

  const isActivateConfirm = confirmTarget?.action === 'activate'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-base-content/60">Manage platform user accounts — view, edit, suspend, ban or delete.</p>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by name, email or ID…"
            className="w-44 shrink min-w-0 sm:w-60"
          />

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={userTypeFilter}
            onChange={(event) => applyFilter(setUserTypeFilter)(event.target.value)}
            aria-label="Filter by user type"
          >
            <option value="">All types</option>
            <option value="customer">Customer</option>
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={verificationFilter}
            onChange={(event) => applyFilter(setVerificationFilter)(event.target.value)}
            aria-label="Filter by verification"
          >
            <option value="">All verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          <select
            className="select select-bordered select-sm w-40 shrink-0"
            value={sort}
            onChange={(event) => applyFilter(setSort)(event.target.value)}
            aria-label="Sort by"
          >
            <option value="created_at">Created date</option>
            <option value="name">Name</option>
            <option value="last_login_at">Last login</option>
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
            aria-label="Refresh users"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load users" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            emptyTitle="No users found"
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
