import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Eye, KeyRound, Pencil, Power } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Tooltip from '../../../components/ui/Tooltip'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import SortControl from '../../../components/tables/SortControl'
import RefreshButton from '../../../components/tables/RefreshButton'
import TableFooter from '../../../components/tables/TableFooter'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import { useAuth } from '../../../contexts/AuthContext'
import { hasCapability } from '../../../utils/permissions'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useAdministrators, useUpdateAdministratorStatus } from '../hooks/useAdministrators'
import { useRoles } from '../hooks/useRoles'
import AdministratorDetailsModal from '../components/AdministratorDetailsModal'
import AdministratorFormModal from '../components/AdministratorFormModal'
import UserAvatar from '../../users/components/UserAvatar'
import ResetPasswordModal from '../components/ResetPasswordModal'
import StatusBadge from '../components/StatusBadge'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)
const formatDate = (value) => format(new Date(value), 'MMM d, yyyy')

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Added' },
  { value: 'name', label: 'Name' },
]

/**
 * Administrator management list: server-side search, status/role filters,
 * sorting, pagination, and inline activate/deactivate.
 */
export default function AdministratorsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState('desc')
  const pagination = usePagination({ perPage: PER_PAGE })

  const { user } = useAuth()
  const can = (permission) => hasCapability(user, permission, 'manage administrators')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const statusDisclosure = useDisclosure()
  const [passwordTarget, setPasswordTarget] = useState(null)
  const passwordDisclosure = useDisclosure()

  const rolesQuery = useRoles({ per_page: 100, sort: 'name', direction: 'asc' })
  const roleNames = rolesQuery.data?.data?.map((role) => role.name) ?? []

  const { data, isLoading, isFetching, isError, error, refetch } = useAdministrators({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    role: roleFilter || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const administrators = data?.data ?? []
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

  const statusMutation = useUpdateAdministratorStatus()

  const confirmStatusChange = () => {
    if (!statusTarget) return

    statusMutation.mutate(
      { id: statusTarget.administrator.id, status: statusTarget.to },
      { onSuccess: () => statusDisclosure.close() },
    )
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Administrator',
      cell: ({ row }) => (
        <div className="flex min-w-56 items-center gap-3">
          <UserAvatar name={row.original.name} src={row.original.profile_photo_url} size="sm" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">
              {row.original.name}
              {row.original.id === user?.id && <span className="ml-1.5 text-xs font-normal text-base-content/50">(you)</span>}
            </span>
            <span className="truncate text-xs text-base-content/60">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Role',
      cell: ({ row }) =>
        row.original.roles?.length ? (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.map((role) => (
              <Badge key={role} variant={role === 'super-admin' ? 'primary' : 'outline'} size="sm" className={role === 'super-admin' ? 'badge-soft' : 'border-base-300 text-base-content/70'}>
                {role}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-base-content/40">—</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'last_login_at',
      header: 'Last sign-in',
      cell: ({ row }) => {
        const value = row.original.last_login_at

        return value ? (
          <span className="whitespace-nowrap text-sm" title={formatDateTime(value)}>{formatDate(value)}</span>
        ) : (
          <span className="text-sm text-base-content/40">Never</span>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Added',
      cell: ({ row }) => {
        const value = row.original.created_at

        return (
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-sm" title={formatDateTime(value) ?? undefined}>{value ? formatDate(value) : '—'}</span>
            {row.original.created_by?.name && (
              <span className="text-xs text-base-content/50">by {row.original.created_by.name}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const administrator = row.original
        const isInactive = administrator.status === 'inactive'

        const isSelf = administrator.id === user?.id
        const isSuperAdmin = (administrator.roles ?? []).includes('super-admin')
        const isLocked = isSuperAdmin
        const canDeactivate = !isLocked && !(isSelf && !isInactive)

        // A super administrator's password is exclusively self-managed — even
        // another super administrator cannot change it. Regular admins use the
        // self-service change-password page for their own account.
        const canResetPassword = isSuperAdmin ? isSelf : !isSelf
        const passwordTitle =
          isSuperAdmin && !isSelf
            ? 'Only the super administrator themselves can change this password'
            : isSelf && !isSuperAdmin
              ? 'Use the self-service Change password page for your own account'
              : undefined

        const statusTitle = isSuperAdmin
          ? 'Super administrator accounts are fixed and cannot be deactivated'
          : isSelf
            ? 'You cannot deactivate your own account'
            : undefined

        return (
          <div className="flex justify-end gap-1">
            {can('view administrators') && <Tooltip label="View details" placement="left"><Button
              variant="ghost"
              size="sm"
              onClick={() => setViewing(administrator)}
              aria-label={`View ${administrator.name}`}
            >
              <Eye className="size-4" />
            </Button></Tooltip>}
            {can('edit administrators') && <Tooltip label="Edit details" placement="left"><Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(administrator)
                setFormOpen(true)
              }}
              aria-label={`Edit ${administrator.name}`}
            >
              <Pencil className="size-4" />
            </Button></Tooltip>}
            {can('edit administrators') && <Tooltip label={passwordTitle ?? 'Reset password'} placement="left"><Button
              variant="ghost"
              size="sm"
              disabled={!canResetPassword}
              onClick={() => {
                setPasswordTarget(administrator)
                passwordDisclosure.open()
              }}
              aria-label={`Reset ${administrator.name}'s password`}
            >
              <KeyRound className={`size-4 ${canResetPassword ? 'text-primary' : 'text-base-content/30'}`} />
            </Button></Tooltip>}
            {can('edit administrators') && <Tooltip label={statusTitle ?? (isInactive ? 'Activate account' : 'Deactivate account')} placement="left"><Button
              variant="ghost"
              size="sm"
              disabled={!canDeactivate}
              onClick={() => {
                setStatusTarget({ administrator, to: isInactive ? 'active' : 'inactive' })
                statusDisclosure.open()
              }}
              aria-label={
                isLocked
                  ? `Super administrator accounts are fixed and cannot be deactivated`
                  : isSelf
                    ? `You cannot deactivate your own account`
                    : isInactive
                      ? `Activate ${administrator.name}`
                      : `Deactivate ${administrator.name}`
              }
            >
              <Power
                className={`size-4 ${isLocked ? 'text-base-content/30' : isInactive ? 'text-success' : 'text-warning'}`}
              />
            </Button></Tooltip>}
          </div>
        )
      },
    },
  ]

  const hasFilters = Boolean(search || statusFilter || roleFilter)
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setRoleFilter('')
    pagination.setCurrentPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card bodyClassName="p-0" className="overflow-hidden border border-base-200 shadow-none">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search name or email"
            size="sm"
            className="w-full min-w-0 sm:w-72"
          />

          <select
            className="select select-bordered select-sm w-auto"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'any'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm w-auto"
            value={roleFilter}
            onChange={(event) => applyFilter(setRoleFilter)(event.target.value)}
            aria-label="Filter by role"
          >
            <option value="">Any role</option>
            {roleNames.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
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
            <RefreshButton onClick={() => refetch()} isFetching={isFetching} label="Refresh administrators" />
          </div>
        </div>

        {isError ? (
          <ErrorState title="Could not load administrators" message={error?.message} onRetry={refetch} />
        ) : (
          <div className="border-t border-base-200">
            <DataTable
              variant="clean"
              columns={columns}
              data={administrators}
              isLoading={isLoading}
              emptyTitle={hasFilters ? 'No administrators match' : 'No administrators yet'}
              emptyDescription={hasFilters ? 'Try a different search or clear the filters.' : 'Add an administrator to give someone access to the admin web.'}
            />
          </div>
        )}

        <TableFooter meta={paginationMeta} perPage={PER_PAGE} pagination={pagination} noun="administrators" />
      </Card>

      <AdministratorFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        administrator={editing}
      />

      <AdministratorDetailsModal open={Boolean(viewing)} onClose={() => setViewing(null)} administrator={viewing} />

      <ConfirmDialog
        open={statusDisclosure.isOpen}
        onCancel={statusDisclosure.close}
        onConfirm={confirmStatusChange}
        loading={statusMutation.isPending}
        title={statusTarget?.to === 'inactive' ? 'Deactivate administrator?' : 'Activate administrator?'}
        description={
          statusTarget
            ? `This will ${statusTarget.to === 'inactive' ? 'immediately block' : 'restore'} ${statusTarget.administrator.name}'s access to the admin system.`
            : ''
        }
        confirmText={statusTarget?.to === 'inactive' ? 'Deactivate' : 'Activate'}
        variant={statusTarget?.to === 'inactive' ? 'error' : 'primary'}
      />

      <ResetPasswordModal
        open={passwordDisclosure.isOpen}
        onClose={passwordDisclosure.close}
        administrator={passwordTarget}
      />
    </div>
  )
}
