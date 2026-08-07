import { useEffect, useState } from 'react'
import { Eye, Pencil, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
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
import { useDeleteRole, useRoles } from '../hooks/useRoles'
import RoleDetailsModal from '../components/RoleDetailsModal'
import RoleFormModal from '../components/RoleFormModal'
import PermissionsModal from '../components/PermissionsModal'

const PER_PAGE = 10
const SUPER_ADMIN = 'super-admin'

/**
 * Role management list: search, pagination, CRUD, and per-role permission
 * assignment via the permission matrix modal.
 */
export default function RolesPage() {
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

    deleteMutation.mutate(deleteTarget.id, { onSettled: () => deleteDisclosure.close() })
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Role',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.name === SUPER_ADMIN && <Badge variant="primary" size="sm">System</Badge>}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description ?? <span className="text-base-content/40">—</span>,
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const count = row.original.permissions?.length ?? 0

        return count > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.original.permissions.slice(0, 3).map((permission) => (
              <Badge key={permission} variant="outline" size="sm">
                {permission}
              </Badge>
            ))}
            {count > 3 && <Badge variant="neutral" size="sm">+{count - 3} more</Badge>}
          </div>
        ) : (
          <span className="text-base-content/40">No permissions</span>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewing(role)}
              aria-label={`View ${role.name}`}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(role)
                setFormOpen(true)
              }}
              aria-label={`Edit ${role.name}`}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPermissionsTarget(role)
                permissionsDisclosure.open()
              }}
              aria-label={`Manage permissions for ${role.name}`}
            >
              <ShieldCheck className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isSystem}
              onClick={() => {
                setDeleteTarget(role)
                deleteDisclosure.open()
              }}
              aria-label={isSystem ? 'The system role cannot be deleted' : `Delete ${role.name}`}
              title={isSystem ? 'The system role cannot be deleted' : 'Delete role'}
            >
              <Trash2 className={`size-4 ${isSystem ? 'text-base-content/30' : 'text-error'}`} />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              pagination.setCurrentPage(1)
            }}
            placeholder="Search roles…"
            className="w-full sm:w-64"
          />

          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh roles">
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load roles" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={roles}
            isLoading={isLoading}
            emptyTitle="No roles found"
            emptyDescription="Try adjusting your search."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
          <p className="text-sm text-base-content/60">
            {paginationMeta ? `${paginationMeta.from ?? 0}–${paginationMeta.to ?? 0} of ${paginationMeta.total}` : ''}
          </p>
          <Pagination totalItems={paginationMeta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
        </div>
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
