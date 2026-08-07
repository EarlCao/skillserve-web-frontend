import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Eye, KeyRound, Pencil, Power, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import { useAuth } from '../../../contexts/AuthContext'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useAdministrators, useUpdateAdministratorStatus } from '../hooks/useAdministrators'
import { useRoles } from '../hooks/useRoles'
import AdministratorDetailsModal from '../components/AdministratorDetailsModal'
import AdministratorFormModal from '../components/AdministratorFormModal'
import ResetPasswordModal from '../components/ResetPasswordModal'
import StatusBadge from '../components/StatusBadge'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

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
      { onSettled: () => statusDisclosure.close() },
    )
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-base-content/60">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) =>
        row.original.roles?.length ? (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.map((role) => (
              <Badge key={role} variant="secondary">
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
      header: 'Last login',
      cell: ({ row }) => {
        const value = formatDateTime(row.original.last_login_at)

        return value ? <span className="whitespace-nowrap">{value}</span> : <span className="text-base-content/40">Never</span>
      },
    },
    {
      accessorKey: 'created_by',
      header: 'Created by',
      cell: ({ row }) => row.original.created_by?.name ?? <span className="text-base-content/40">—</span>,
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewing(administrator)}
              aria-label={`View ${administrator.name}`}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(administrator)
                setFormOpen(true)
              }}
              aria-label={`Edit ${administrator.name}`}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!canResetPassword}
              title={passwordTitle}
              onClick={() => {
                setPasswordTarget(administrator)
                passwordDisclosure.open()
              }}
              aria-label={`Reset ${administrator.name}'s password`}
            >
              <KeyRound className={`size-4 ${canResetPassword ? 'text-primary' : 'text-base-content/30'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!canDeactivate}
              title={statusTitle}
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
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by name or email…"
            className="w-40 shrink min-w-0 sm:w-56"
          />

          <select
            className="select select-bordered select-sm w-28 shrink-0"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={roleFilter}
            onChange={(event) => applyFilter(setRoleFilter)(event.target.value)}
            aria-label="Filter by role"
            title={roleFilter || 'All roles'}
          >
            <option value="">All roles</option>
            {roleNames.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm w-40 shrink-0"
            value={sort}
            onChange={(event) => applyFilter(setSort)(event.target.value)}
            aria-label="Sort by"
          >
            <option value="created_at">Created date</option>
            <option value="name">Name</option>
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
            aria-label="Refresh administrators"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load administrators" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={administrators}
            isLoading={isLoading}
            emptyTitle="No administrators found"
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

      <AdministratorFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        administrator={editing}
        roles={roleNames}
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
