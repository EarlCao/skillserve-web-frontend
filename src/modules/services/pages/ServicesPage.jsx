import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  RefreshCw,
  Star,
  StarOff,
  Trash2,
  XCircle,
} from 'lucide-react'
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
import { useServiceCategories } from '../../serviceCategories/hooks/useServiceCategories'
import {
  useServices,
  useApproveService,
  useRejectService,
  useHideService,
  useFeatureService,
  useDeleteService,
} from '../hooks/useServices'
import ServiceStatusBadge from '../components/ServiceStatusBadge'
import ApprovalStatusBadge from '../components/ApprovalStatusBadge'
import ServiceFormModal from '../components/ServiceFormModal'
import ServiceDetailsModal from '../components/ServiceDetailsModal'
import Textarea from '../../../components/ui/Textarea'
import { rejectServiceSchema } from '../schemas/serviceSchema'
import { toast } from 'sonner'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)
const formatCurrency = (value, currency = 'USD') =>
  value != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value) : '—'

/**
 * Service management list: server-side search (title, provider, category),
 * status/approval filters, sorting, pagination, and the administrative
 * actions to review, approve, reject, edit, hide, feature, and delete services.
 */
export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState('desc')
  const pagination = usePagination({ perPage: PER_PAGE })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [hideTarget, setHideTarget] = useState(null)
  const [featureTarget, setFeatureTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const approveDisclosure = useDisclosure()
  const rejectDisclosure = useDisclosure()
  const hideDisclosure = useDisclosure()
  const featureDisclosure = useDisclosure()
  const deleteDisclosure = useDisclosure()

  const approveMutation = useApproveService()
  const rejectMutation = useRejectService()
  const hideMutation = useHideService()
  const featureMutation = useFeatureService()
  const deleteMutation = useDeleteService()

  // Fetch categories for filter dropdown.
  const { data: categoriesData } = useServiceCategories({ per_page: 100 })
  const categories = categoriesData?.data ?? []

  const { data, isLoading, isFetching, isError, error, refetch } = useServices({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    approval_status: approvalFilter || undefined,
    category_id: categoryFilter || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const services = data?.data ?? []
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

  const confirmApprove = () => {
    if (!approveTarget) return
    approveMutation.mutate(
      { id: approveTarget.id },
      { onSettled: () => { approveDisclosure.close(); setApproveTarget(null); setViewing(null); } },
    )
  }

  const confirmReject = () => {
    if (!rejectTarget) return
    const parsed = rejectServiceSchema.safeParse({ reason: rejectTarget.reason?.trim() ?? '' })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'A rejection reason is required.')
      return
    }
    rejectMutation.mutate(
      { id: rejectTarget.id, reason: parsed.data.reason },
      { onSuccess: () => { rejectDisclosure.close(); setRejectTarget(null); setViewing(null); } },
    )
  }

  const confirmHide = () => {
    if (!hideTarget) return
    hideMutation.mutate(
      { id: hideTarget.id, isHidden: !hideTarget.is_hidden },
      { onSettled: () => { hideDisclosure.close(); setHideTarget(null); setViewing(null); } },
    )
  }

  const confirmFeature = () => {
    if (!featureTarget) return
    featureMutation.mutate(
      { id: featureTarget.id, isFeatured: !featureTarget.is_featured },
      { onSettled: () => { featureDisclosure.close(); setFeatureTarget(null); setViewing(null); } },
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => { deleteDisclosure.close(); setDeleteTarget(null); setViewing(null); },
    })
  }

  const columns = [
    {
      accessorKey: 'title',
      header: 'Service',
      cell: ({ row }) => (
        <div className="flex max-w-md flex-col">
          <span className="font-medium">{row.original.title}</span>
          <span className="text-xs text-base-content/60">
            {row.original.provider?.business_name || row.original.provider?.user?.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name ?? <span className="text-base-content/40">—</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatCurrency(row.original.price, row.original.currency)}</span>
      ),
    },
    {
      accessorKey: 'approval_status',
      header: 'Approval',
      cell: ({ row }) => <ApprovalStatusBadge status={row.original.approval_status} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <ServiceStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'is_featured',
      header: 'Featured',
      cell: ({ row }) =>
        row.original.is_featured ? (
          <Star className="size-4 text-warning fill-warning" />
        ) : (
          <span className="text-base-content/40">—</span>
        ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => {
        const value = formatDateTime(row.original.created_at)
        return value ? <span className="whitespace-nowrap">{value}</span> : <span className="text-base-content/40">—</span>
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const service = row.original

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewing(service.id)}
              aria-label={`View ${service.title}`}
              title="View details"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(service)
                setFormOpen(true)
              }}
              aria-label={`Edit ${service.title}`}
              title="Edit service"
            >
              <Pencil className="size-4" />
            </Button>
            {service.approval_status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setApproveTarget(service)
                    approveDisclosure.open()
                  }}
                  aria-label={`Approve ${service.title}`}
                  title="Approve"
                >
                  <CheckCircle className="size-4 text-success" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRejectTarget(service)
                    rejectDisclosure.open()
                  }}
                  aria-label={`Reject ${service.title}`}
                  title="Reject"
                >
                  <XCircle className="size-4 text-error" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setHideTarget(service)
                hideDisclosure.open()
              }}
              aria-label={service.is_hidden ? `Unhide ${service.title}` : `Hide ${service.title}`}
              title={service.is_hidden ? 'Unhide' : 'Hide'}
            >
              {service.is_hidden ? (
                <Eye className="size-4 text-success" />
              ) : (
                <EyeOff className="size-4 text-warning" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFeatureTarget(service)
                featureDisclosure.open()
              }}
              aria-label={service.is_featured ? `Unfeature ${service.title}` : `Feature ${service.title}`}
              title={service.is_featured ? 'Unfeature' : 'Feature'}
            >
              {service.is_featured ? (
                <StarOff className="size-4 text-warning" />
              ) : (
                <Star className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDeleteTarget(service)
                deleteDisclosure.open()
              }}
              aria-label={`Delete ${service.title}`}
              title="Delete"
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
          <h1 className="text-2xl font-bold">Service Management</h1>
          <p className="text-sm text-base-content/60">
            Review, approve, and manage services submitted by providers.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <FileText className="size-4" />
          Add service
        </Button>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by title, provider, category…"
            className="w-44 shrink min-w-0 sm:w-64"
          />

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <select
            className="select select-bordered select-sm w-40 shrink-0"
            value={approvalFilter}
            onChange={(event) => applyFilter(setApprovalFilter)(event.target.value)}
            aria-label="Filter by approval"
          >
            <option value="">All approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="select select-bordered select-sm w-40 shrink-0"
            value={categoryFilter}
            onChange={(event) => applyFilter(setCategoryFilter)(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
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
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="average_rating">Rating</option>
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
            aria-label="Refresh services"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load services" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={services}
            isLoading={isLoading}
            emptyTitle="No services found"
            emptyDescription="Try adjusting your search or filters, or add a new service."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
          <p className="text-sm text-base-content/60">
            {paginationMeta ? `${paginationMeta.from ?? 0}–${paginationMeta.to ?? 0} of ${paginationMeta.total}` : ''}
          </p>
          <Pagination totalItems={paginationMeta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
        </div>
      </Card>

      <ServiceFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        service={editing}
        categories={categories}
      />

      <ServiceDetailsModal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        serviceId={viewing}
        onApprove={(service) => { setApproveTarget(service); approveDisclosure.open(); }}
        onReject={(service) => { setRejectTarget(service); rejectDisclosure.open(); }}
        onHide={(service) => { setHideTarget(service); hideDisclosure.open(); }}
        onFeature={(service) => { setFeatureTarget(service); featureDisclosure.open(); }}
        onDelete={(service) => { setDeleteTarget(service); deleteDisclosure.open(); }}
        onEdit={(service) => { setEditing(service); setFormOpen(true); }}
      />

      <ConfirmDialog
        open={approveDisclosure.isOpen}
        onCancel={() => { approveDisclosure.close(); setApproveTarget(null); }}
        onConfirm={confirmApprove}
        loading={approveMutation.isPending}
        title="Approve service?"
        description={
          approveTarget
            ? `This will approve "${approveTarget.title}" and make it available to clients.`
            : ''
        }
        confirmText="Approve"
        variant="primary"
      />

      <ConfirmDialog
        open={rejectDisclosure.isOpen}
        onCancel={() => { rejectDisclosure.close(); setRejectTarget(null); }}
        onConfirm={confirmReject}
        loading={rejectMutation.isPending}
        title="Reject service?"
        description={
          rejectTarget
            ? `This will reject "${rejectTarget.title}". The provider will be notified.`
            : ''
        }
        confirmText="Reject"
        variant="error"
      >
        <Textarea
          label="Rejection reason"
          required
          rows={3}
          value={rejectTarget?.reason ?? ''}
          onChange={(event) => setRejectTarget((previous) => previous ? { ...previous, reason: event.target.value } : previous)}
          placeholder="Explain why this service is being rejected…"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={hideDisclosure.isOpen}
        onCancel={() => { hideDisclosure.close(); setHideTarget(null); }}
        onConfirm={confirmHide}
        loading={hideMutation.isPending}
        title={hideTarget?.is_hidden ? 'Unhide service?' : 'Hide service?'}
        description={
          hideTarget
            ? hideTarget.is_hidden
              ? `This will make "${hideTarget.title}" visible to clients again.`
              : `This will temporarily remove "${hideTarget.title}" from public visibility.`
            : ''
        }
        confirmText={hideTarget?.is_hidden ? 'Unhide' : 'Hide'}
        variant={hideTarget?.is_hidden ? 'primary' : 'warning'}
      />

      <ConfirmDialog
        open={featureDisclosure.isOpen}
        onCancel={() => { featureDisclosure.close(); setFeatureTarget(null); }}
        onConfirm={confirmFeature}
        loading={featureMutation.isPending}
        title={featureTarget?.is_featured ? 'Unfeature service?' : 'Feature service?'}
        description={
          featureTarget
            ? featureTarget.is_featured
              ? `This will remove "${featureTarget.title}" from featured services.`
              : `This will highlight "${featureTarget.title}" to increase its visibility.`
            : ''
        }
        confirmText={featureTarget?.is_featured ? 'Unfeature' : 'Feature'}
        variant={featureTarget?.is_featured ? 'outline' : 'primary'}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onCancel={() => { deleteDisclosure.close(); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
        title="Delete service?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}". This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="error"
      />
    </div>
  )
}
