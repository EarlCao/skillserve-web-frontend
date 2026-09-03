import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Eye, EyeOff, RefreshCw, Star, Trash2, AlertTriangle } from 'lucide-react'
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
  useReviews,
  useHideReview,
  useRemoveReview,
} from '../hooks/useReviews'
import ReviewStatusBadge from '../components/ReviewStatusBadge'
import ReviewDetailsModal from '../components/ReviewDetailsModal'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

/**
 * Reviews and Ratings management list: server-side search (comment, reviewer,
 * provider, service), rating/status/reported filters, sorting, pagination,
 * and the administrative actions to view, hide, restore, and remove reviews.
 */
export default function ReviewsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [ratingFilter, setRatingFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [reportedFilter, setReportedFilter] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState('desc')
  const pagination = usePagination({ perPage: PER_PAGE })

  const [viewing, setViewing] = useState(null)
  const [hideTarget, setHideTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const hideDisclosure = useDisclosure()
  const deleteDisclosure = useDisclosure()

  const hideMutation = useHideReview()
  const deleteMutation = useRemoveReview()

  const { data, isLoading, isFetching, isError, error, refetch } = useReviews({
    search: debouncedSearch || undefined,
    rating: ratingFilter || undefined,
    status: statusFilter || undefined,
    is_reported: reportedFilter || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const reviews = data?.data ?? []
  const paginationMeta = data?.meta?.pagination

  const applyFilter = (setter) => (value) => {
    setter(value)
    pagination.setCurrentPage(1)
  }

  useEffect(() => {
    if (paginationMeta && pagination.currentPage > paginationMeta.last_page) {
      pagination.setCurrentPage(paginationMeta.last_page)
    }
  }, [paginationMeta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const confirmHide = () => {
    if (!hideTarget) return
    const isCurrentlyHidden = hideTarget.status === 'hidden'
    hideMutation.mutate(
      { id: hideTarget.id, isHidden: !isCurrentlyHidden },
      { onSettled: () => { hideDisclosure.close(); setHideTarget(null); setViewing(null); } },
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
      accessorKey: 'reviewer',
      header: 'Reviewer',
      cell: ({ row }) => (
        <div className="flex max-w-[200px] flex-col">
          <span className="font-medium">{row.original.reviewer?.name}</span>
          <span className="text-xs text-base-content/60">{row.original.reviewer?.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'service',
      header: 'Service',
      cell: ({ row }) => (
        <div className="flex max-w-[200px] flex-col">
          <span className="font-medium">{row.original.service?.title}</span>
          <span className="text-xs text-base-content/60">{row.original.provider?.business_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-3.5 ${i < row.original.rating ? 'text-warning fill-warning' : 'text-base-content/20'}`}
            />
          ))}
          <span className="ml-1 text-xs text-base-content/60">{row.original.rating}</span>
        </div>
      ),
    },
    {
      accessorKey: 'comment',
      header: 'Comment',
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate text-sm text-base-content/80" title={row.original.comment}>
          {row.original.comment ?? <span className="text-base-content/40">—</span>}
        </span>
      ),
    },
    {
      accessorKey: 'is_reported',
      header: 'Reported',
      cell: ({ row }) =>
        row.original.is_reported ? (
          <AlertTriangle className="size-4 text-warning" />
        ) : (
          <span className="text-base-content/40">—</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <ReviewStatusBadge status={row.original.status} />,
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
        const review = row.original

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewing(review.id)}
              aria-label={`View review #${review.id}`}
              title="View details"
            >
              <Eye className="size-4" />
            </Button>
            {review.status !== 'removed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHideTarget(review)
                  hideDisclosure.open()
                }}
                aria-label={review.status === 'hidden' ? `Restore review #${review.id}` : `Hide review #${review.id}`}
                title={review.status === 'hidden' ? 'Restore' : 'Hide'}
              >
                {review.status === 'hidden' ? (
                  <Eye className="size-4 text-success" />
                ) : (
                  <EyeOff className="size-4 text-warning" />
                )}
              </Button>
            )}
            {review.status !== 'removed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeleteTarget(review)
                  deleteDisclosure.open()
                }}
                aria-label={`Remove review #${review.id}`}
                title="Remove"
              >
                <Trash2 className="size-4 text-error" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Reviews and Ratings</h1>
        <p className="text-sm text-base-content/60">
          View, moderate, and manage reviews and ratings submitted by clients.
        </p>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by reviewer, provider, service…"
            className="w-44 shrink min-w-0 sm:w-64"
          />

          <select
            className="select select-bordered select-sm w-28 shrink-0"
            value={ratingFilter}
            onChange={(event) => applyFilter(setRatingFilter)(event.target.value)}
            aria-label="Filter by rating"
          >
            <option value="">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="removed">Removed</option>
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={reportedFilter}
            onChange={(event) => applyFilter(setReportedFilter)(event.target.value)}
            aria-label="Filter by reported"
          >
            <option value="">All reviews</option>
            <option value="1">Reported</option>
            <option value="0">Not reported</option>
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={sort}
            onChange={(event) => applyFilter(setSort)(event.target.value)}
            aria-label="Sort by"
          >
            <option value="created_at">Created date</option>
            <option value="rating">Rating</option>
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
            aria-label="Refresh reviews"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load reviews" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={reviews}
            isLoading={isLoading}
            emptyTitle="No reviews found"
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

      <ReviewDetailsModal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        reviewId={viewing}
        onHide={(review) => { setHideTarget(review); hideDisclosure.open(); }}
        onRemove={(review) => { setDeleteTarget(review); deleteDisclosure.open(); }}
      />

      <ConfirmDialog
        open={hideDisclosure.isOpen}
        onCancel={() => { hideDisclosure.close(); setHideTarget(null); }}
        onConfirm={confirmHide}
        loading={hideMutation.isPending}
        title={hideTarget?.status === 'hidden' ? 'Restore review?' : 'Hide review?'}
        description={
          hideTarget
            ? hideTarget.status === 'hidden'
              ? 'This will make the review visible to the public again.'
              : 'This will temporarily remove the review from public visibility.'
            : ''
        }
        confirmText={hideTarget?.status === 'hidden' ? 'Restore' : 'Hide'}
        variant={hideTarget?.status === 'hidden' ? 'primary' : 'warning'}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onCancel={() => { deleteDisclosure.close(); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
        title="Remove review?"
        description={
          deleteTarget
            ? 'This will permanently remove the review. This action cannot be undone.'
            : ''
        }
        confirmText="Remove"
        variant="error"
      />
    </div>
  )
}
