import { useEffect, useState } from 'react'
import { Eye, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Tooltip from '../../../components/ui/Tooltip'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import RefreshButton from '../../../components/tables/RefreshButton'
import TableFooter from '../../../components/tables/TableFooter'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useDeleteRole, useRoles } from '../hooks/useRoles'
import RoleDetailsModal from '../components/RoleDetailsModal'
import RoleFormModal from '../components/RoleFormModal'
import PermissionsModal from '../components/PermissionsModal'
import { useAuth } from '../../../contexts/AuthContext'
import { hasCapability } from '../../../utils/permissions'

const PER_PAGE = 10
const SUPER_ADMIN = 'super-admin'

/**
 * Role management list: search, pagination, CRUD, and per-role permission
 * assignment via the permission matrix modal.
 */
export default function RolesPage() {
  const { user } = useAuth()
  const canManageRoles = hasCapability(user, 'manage administrators')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const pagination = usePagination({ perPage: PER_PAGE })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const deleteDisclosure = useDisclosure()
  const [viewing, setViewing] = useState(null)
  const [permissionsTarget, setPermissionsTarget] = useState(null)
  const permissionsDisclosure = useDisclosure()

  const { data, isLoading, isFetching, isError, error, refetch } = useRoles({
    search: debouncedSearch || undefined,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const roles = data?.data ?? []
  const paginationMeta = data?.meta?.pagination

  useEffect(() => {
    if (paginationMeta && pagination.currentPage > paginationMeta.last_page) {
      pagination.setCurrentPage(paginationMeta.last_page)
    }
  }, [paginationMeta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const deleteMutation = useDeleteRole()

  const confirmDelete = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => deleteDisclosure.close() })
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Role',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.name === SUPER_ADMIN && <Badge variant="primary" size="sm" className="badge-soft">System</Badge>}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-md text-sm text-base-content/70">
          {row.original.description ?? <span className="text-base-content/40">No description</span>}
        </span>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const count = row.original.permissions?.length ?? 0

        return count > 0 ? (
          <span className="whitespace-nowrap text-sm">
            <span className="font-medium">{count}</span>{' '}
            <span className="text-base-content/60">{count === 1 ? 'permission' : 'permissions'}</span>
          </span>
        ) : (
          <span className="text-sm text-base-content/40">No permissions</span>
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const role = row.original
        const isSystem = role.name === SUPER_ADMIN

        return (
          <div className="flex justify-end gap-1">
            {canManageRoles && <Tooltip label="View details" placement="left"><Button
              variant="ghost"
              size="sm"
              onClick={() => setViewing(role)}
              aria-label={`View ${role.name}`}
            >
              <Eye className="size-4" />
            </Button></Tooltip>}
            {canManageRoles && <Tooltip label="Edit role" placement="left"><Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(role)
                setFormOpen(true)
              }}
              aria-label={`Edit ${role.name}`}
            >
              <Pencil className="size-4" />
            </Button></Tooltip>}
            {canManageRoles && <Tooltip label="Permissions" placement="left"><Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPermissionsTarget(role)
                permissionsDisclosure.open()
              }}
              aria-label={`Manage permissions for ${role.name}`}
            >
              <ShieldCheck className="size-4" />
            </Button></Tooltip>}
            {canManageRoles && <Tooltip label={isSystem ? 'The system role cannot be deleted' : 'Delete role'} placement="left"><Button
              variant="ghost"
              size="sm"
              disabled={isSystem}
              onClick={() => {
                setDeleteTarget(role)
                deleteDisclosure.open()
              }}
              aria-label={isSystem ? 'The system role cannot be deleted' : `Delete ${role.name}`}
            >
              <Trash2 className={`size-4 ${isSystem ? 'text-base-content/30' : 'text-error'}`} />
            </Button></Tooltip>}
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card bodyClassName="p-0" className="overflow-hidden border border-base-200 shadow-none">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <SearchInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              pagination.setCurrentPage(1)
            }}
            placeholder="Search roles"
            size="sm"
            className="w-full min-w-0 sm:w-72"
          />
          <div className="ml-auto">
            <RefreshButton onClick={() => refetch()} isFetching={isFetching} label="Refresh roles" />
          </div>
        </div>

        {isError ? (
          <ErrorState title="Could not load roles" message={error?.message} onRetry={refetch} />
        ) : (
          <div className="border-t border-base-200">
            <DataTable
              variant="clean"
              columns={columns}
              data={roles}
              isLoading={isLoading}
              emptyTitle={search ? 'No roles match' : 'No roles yet'}
              emptyDescription={search ? 'Try a different search.' : 'Add a role, then choose what it may view and control.'}
            />
          </div>
        )}

        <TableFooter meta={paginationMeta} perPage={PER_PAGE} pagination={pagination} noun="roles" />
      </Card>

      <RoleFormModal open={formOpen} onClose={() => setFormOpen(false)} role={editing} />

      <RoleDetailsModal open={Boolean(viewing)} onClose={() => setViewing(null)} role={viewing} />

      <PermissionsModal
        open={permissionsDisclosure.isOpen}
        onClose={permissionsDisclosure.close}
        role={permissionsTarget}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onCancel={deleteDisclosure.close}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
        title="Delete role?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? Users with this role will lose its permissions. This cannot be undone.`
            : ''
        }
        confirmText="Delete role"
      />
    </div>
  )
}
