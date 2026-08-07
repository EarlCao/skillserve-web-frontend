import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Power, UserPlus } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useAdministrators, useUpdateAdministratorStatus } from '../hooks/useAdministrators'
import { useRoles } from '../hooks/useRoles'
import AdministratorFormModal from '../components/AdministratorFormModal'
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

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const statusDisclosure = useDisclosure()

  const rolesQuery = useRoles({ per_page: 100, sort: 'name', direction: 'asc' })
  const roleNames = rolesQuery.data?.data?.map((role) => role.name) ?? []

  const { data, isLoading, isError, error, refetch } = useAdministrators({
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
    pagination.goToPage(1)
  }

  // Step back when the current page no longer exists (e.g. last row removed).
  useEffect(() => {
    if (paginationMeta && pagination.currentPage > paginationMeta.last_page) {
      pagination.goToPage(paginationMeta.last_page)
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
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const administrator = row.original
        const isInactive = administrator.status === 'inactive'

        return (
          <div className="flex justify-end gap-1">
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
              onClick={() => {
                setStatusTarget({ administrator, to: isInactive ? 'active' : 'inactive' })
                statusDisclosure.open()
              }}
              aria-label={isInactive ? `Activate ${administrator.name}` : `Deactivate ${administrator.name}`}
            >
              <Power className={`size-4 ${isInactive ? 'text-success' : 'text-warning'}`} />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Administrators</h1>
          <p className="text-sm text-base-content/60">Manage administrator accounts, activation status and roles.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <UserPlus className="size-4" />
          Add administrator
        </Button>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by name or email…"
            className="w-full sm:w-64"
          />

          <select
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="select select-bordered select-sm"
            value={roleFilter}
            onChange={(event) => applyFilter(setRoleFilter)(event.target.value)}
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            {roleNames.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm"
            value={sort}
            onChange={(event) => applyFilter(setSort)(event.target.value)}
            aria-label="Sort by"
          >
            <option value="created_at">Sort: Created date</option>
            <option value="name">Sort: Name</option>
          </select>

          <Button variant="outline" size="sm" onClick={() => setDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}>
            {direction === 'asc' ? 'Ascending' : 'Descending'}
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
    </div>
  )
}
