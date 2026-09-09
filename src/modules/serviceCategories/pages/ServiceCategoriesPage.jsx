import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CircleOff, Eye, FolderPlus, Pencil, Power, RefreshCw, Trash2 } from 'lucide-react'
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
  useServiceCategories,
  useUpdateServiceCategoryStatus,
  useDeleteServiceCategory,
} from '../hooks/useServiceCategories'
import CategoryStatusBadge from '../components/CategoryStatusBadge'
import CategoryFormModal from '../components/CategoryFormModal'
import CategoryDetailsModal from '../components/CategoryDetailsModal'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

/**
 * Service category management list: server-side search (name/description),
 * status filter, sorting, pagination, and the actions to view, edit,
 * enable/disable and delete categories. Subcategories are managed inside the
 * category details modal.
 */
export default function ServiceCategoriesPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState('desc')
  const pagination = usePagination({ perPage: PER_PAGE })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const statusDisclosure = useDisclosure()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const deleteDisclosure = useDisclosure()

  const statusMutation = useUpdateServiceCategoryStatus()
  const deleteMutation = useDeleteServiceCategory()

  const { data, isLoading, isFetching, isError, error, refetch } = useServiceCategories({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const categories = data?.data ?? []
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

  const confirmStatusChange = () => {
    if (!statusTarget) return

    statusMutation.mutate(
      { id: statusTarget.category.id, status: statusTarget.to },
      { onSuccess: () => statusDisclosure.close() },
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => deleteDisclosure.close() })
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => (
        <div className="flex max-w-md flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.description && (
            <span className="truncate text-xs text-base-content/60">{row.original.description}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'subcategories_count',
      header: 'Subcategories',
      cell: ({ row }) =>
        row.original.subcategories_count > 0 ? (
          <span className="font-medium">{row.original.subcategories_count}</span>
        ) : (
          <span className="text-base-content/40">—</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <CategoryStatusBadge status={row.original.status} />,
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
        const category = row.original
        const isEnabled = category.status === 'enabled'

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewing(category.id)}
              aria-label={`View ${category.name}`}
              title="Manage subcategories"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(category)
                setFormOpen(true)
              }}
              aria-label={`Edit ${category.name}`}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusTarget({ category, to: isEnabled ? 'disabled' : 'enabled' })
                statusDisclosure.open()
              }}
              aria-label={isEnabled ? `Disable ${category.name}` : `Enable ${category.name}`}
            >
              {isEnabled ? (
                <CircleOff className="size-4 text-warning" />
              ) : (
                <Power className="size-4 text-success" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDeleteTarget(category)
                deleteDisclosure.open()
              }}
              aria-label={`Delete ${category.name}`}
            >
              <Trash2 className="size-4 text-error" />
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
          <h1 className="text-2xl font-bold">Service Categories</h1>
          <p className="text-sm text-base-content/60">
            Organize available services into categories and subcategories, and control which ones are selectable.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <FolderPlus className="size-4" />
          Add category
        </Button>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by name or description…"
            className="w-44 shrink min-w-0 sm:w-64"
          />

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
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
            aria-label="Refresh service categories"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load service categories" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={categories}
            isLoading={isLoading}
            emptyTitle="No service categories found"
            emptyDescription="Try adjusting your search or filters, or add a new category."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
          <p className="text-sm text-base-content/60">
            {paginationMeta ? `${paginationMeta.from ?? 0}–${paginationMeta.to ?? 0} of ${paginationMeta.total}` : ''}
          </p>
          <Pagination totalItems={paginationMeta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
        </div>
      </Card>

      <CategoryFormModal open={formOpen} onClose={() => setFormOpen(false)} category={editing} />

      <CategoryDetailsModal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        categoryId={viewing}
      />

      <ConfirmDialog
        open={statusDisclosure.isOpen}
        onCancel={statusDisclosure.close}
        onConfirm={confirmStatusChange}
        loading={statusMutation.isPending}
        title={statusTarget?.to === 'disabled' ? 'Disable category?' : 'Enable category?'}
        description={
          statusTarget
            ? statusTarget.to === 'disabled'
              ? `"${statusTarget.category.name}" will no longer be selectable or displayed on the platform. Its subcategories are kept.`
              : `"${statusTarget.category.name}" will become selectable and displayed on the platform again.`
            : ''
        }
        confirmText={statusTarget?.to === 'disabled' ? 'Disable' : 'Enable'}
        variant={statusTarget?.to === 'disabled' ? 'error' : 'primary'}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onCancel={deleteDisclosure.close}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
        title="Delete category?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.name}". Categories that still have subcategories cannot be deleted — remove them first.`
            : ''
        }
        confirmText="Delete"
        variant="error"
      />
    </div>
  )
}
