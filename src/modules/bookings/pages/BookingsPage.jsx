import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Eye, XCircle, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import Modal from '../../../components/ui/Modal'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useDisclosure } from '../../../hooks/useDisclosure'
import {
  useBookings,
  useCancelBooking,
  useManageDispute,
} from '../hooks/useBookings'
import BookingStatusBadge from '../components/BookingStatusBadge'
import PaymentStatusBadge from '../components/PaymentStatusBadge'
import BookingDetailsModal from '../components/BookingDetailsModal'

const PER_PAGE = 10

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)
const formatCurrency = (value, currency = 'USD') =>
  value != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value) : '—'

/**
 * Booking management list: server-side search (booking ID, client, provider, service),
 * status/payment/dispute filters, date range, sorting, pagination, and the
 * administrative actions to view, cancel, and manage booking disputes.
 */
export default function BookingsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [disputeFilter, setDisputeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState('desc')
  const pagination = usePagination({ perPage: PER_PAGE })

  const [viewing, setViewing] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [disputeTarget, setDisputeTarget] = useState(null)

  const cancelDisclosure = useDisclosure()
  const disputeActionDisclosure = useDisclosure()

  const cancelMutation = useCancelBooking()
  const disputeMutation = useManageDispute()

  const { data, isLoading, isFetching, isError, error, refetch } = useBookings({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    payment_status: paymentFilter || undefined,
    dispute_status: disputeFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const bookings = data?.data ?? []
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

  const confirmCancel = () => {
    if (!cancelTarget) return
    cancelMutation.mutate(
      { id: cancelTarget.id, reason: cancelTarget.reason },
      { onSettled: () => { cancelDisclosure.close(); setCancelTarget(null); setViewing(null); } },
    )
  }

  const confirmDisputeAction = () => {
    if (!disputeTarget) return
    disputeMutation.mutate(
      { id: disputeTarget.id, action: disputeTarget.action, resolution: disputeTarget.resolution },
      { onSettled: () => { disputeActionDisclosure.close(); setDisputeTarget(null); setViewing(null); } },
    )
  }

  const handleCancelFromDetails = (booking) => {
    setCancelTarget({ ...booking, reason: '' })
    cancelDisclosure.open()
  }

  const handleDisputeFromDetails = (booking, action) => {
    setDisputeTarget({ ...booking, action, resolution: '' })
    disputeActionDisclosure.open()
  }

  const columns = [
    {
      accessorKey: 'booking_number',
      header: 'Booking',
      cell: ({ row }) => (
        <div className="flex max-w-md flex-col">
          <span className="font-medium">{row.original.booking_number}</span>
          <span className="text-xs text-base-content/60">
            {row.original.service?.title ?? '—'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'client',
      header: 'Client',
      cell: ({ row }) => row.original.client?.name ?? <span className="text-base-content/40">—</span>,
    },
    {
      accessorKey: 'provider',
      header: 'Provider',
      cell: ({ row }) => row.original.provider?.business_name ?? <span className="text-base-content/40">—</span>,
    },
    {
      accessorKey: 'total_price',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatCurrency(row.original.total_price, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_status',
      header: 'Payment',
      cell: ({ row }) => <PaymentStatusBadge status={row.original.payment_status} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'scheduled_date',
      header: 'Scheduled',
      cell: ({ row }) => {
        const value = formatDateTime(row.original.scheduled_date)
        return value ? <span className="whitespace-nowrap">{value}</span> : <span className="text-base-content/40">—</span>
      },
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
        const booking = row.original

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewing(booking.id)}
              aria-label={`View ${booking.booking_number}`}
              title="View details"
            >
              <Eye className="size-4" />
            </Button>
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCancelTarget({ ...booking, reason: '' })
                  cancelDisclosure.open()
                }}
                aria-label={`Cancel ${booking.booking_number}`}
                title="Cancel booking"
              >
                <XCircle className="size-4 text-error" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Booking Management</h1>
          <p className="text-sm text-base-content/60">
            View, monitor, and manage client bookings and their corresponding providers.
          </p>
        </div>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by booking ID, client, provider…"
            className="w-44 shrink min-w-0 sm:w-64"
          />

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={paymentFilter}
            onChange={(event) => applyFilter(setPaymentFilter)(event.target.value)}
            aria-label="Filter by payment"
          >
            <option value="">All payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially Refunded</option>
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={disputeFilter}
            onChange={(event) => applyFilter(setDisputeFilter)(event.target.value)}
            aria-label="Filter by dispute"
          >
            <option value="">All disputes</option>
            <option value="pending">Pending</option>
            <option value="investigated">Investigated</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            type="date"
            className="input input-bordered input-sm w-36 shrink-0"
            value={dateFrom}
            onChange={(event) => applyFilter(setDateFrom)(event.target.value)}
            aria-label="Date from"
          />

          <input
            type="date"
            className="input input-bordered input-sm w-36 shrink-0"
            value={dateTo}
            onChange={(event) => applyFilter(setDateTo)(event.target.value)}
            aria-label="Date to"
          />

          <select
            className="select select-bordered select-sm w-36 shrink-0"
            value={sort}
            onChange={(event) => applyFilter(setSort)(event.target.value)}
            aria-label="Sort by"
          >
            <option value="created_at">Created date</option>
            <option value="booking_number">Booking number</option>
            <option value="total_price">Amount</option>
            <option value="scheduled_date">Scheduled date</option>
            <option value="status">Status</option>
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
            aria-label="Refresh bookings"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load bookings" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={bookings}
            isLoading={isLoading}
            emptyTitle="No bookings found"
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

      <BookingDetailsModal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        bookingId={viewing}
        onCancel={handleCancelFromDetails}
        onManageDispute={handleDisputeFromDetails}
      />

      <ConfirmDialog
        open={cancelDisclosure.isOpen}
        onCancel={() => { cancelDisclosure.close(); setCancelTarget(null); }}
        onConfirm={confirmCancel}
        loading={cancelMutation.isPending}
        title="Cancel booking?"
        description={
          cancelTarget
            ? `This will cancel booking "${cancelTarget.booking_number}". This action cannot be undone.`
            : ''
        }
        confirmText="Cancel Booking"
        variant="error"
      >
        <div className="mt-2">
          <label className="label" htmlFor="cancel-reason">
            <span className="label-text">Reason (optional)</span>
          </label>
          <textarea
            id="cancel-reason"
            className="textarea textarea-bordered textarea-sm w-full"
            placeholder="Enter cancellation reason…"
            rows={3}
            value={cancelTarget?.reason ?? ''}
            onChange={(event) => setCancelTarget((prev) => prev ? { ...prev, reason: event.target.value } : prev)}
          />
        </div>
      </ConfirmDialog>

      <Modal
        open={disputeActionDisclosure.isOpen}
        onClose={() => { disputeActionDisclosure.close(); setDisputeTarget(null); }}
        title="Manage Dispute"
        description={`Action: ${disputeTarget?.action ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => { disputeActionDisclosure.close(); setDisputeTarget(null); }}>
              Cancel
            </Button>
            <Button
              variant={disputeTarget?.action === 'resolve' ? 'success' : disputeTarget?.action === 'reject' ? 'error' : 'primary'}
              onClick={confirmDisputeAction}
              loading={disputeMutation.isPending}
            >
              Confirm
            </Button>
          </>
        }
      >
        {disputeTarget?.action === 'resolve' && (
          <div className="flex flex-col gap-2">
            <label className="label" htmlFor="resolution">
              <span className="label-text">Resolution</span>
            </label>
            <textarea
              id="resolution"
              className="textarea textarea-bordered textarea-sm w-full"
              placeholder="Describe the resolution…"
              rows={4}
              value={disputeTarget?.resolution ?? ''}
              onChange={(event) => setDisputeTarget((prev) => prev ? { ...prev, resolution: event.target.value } : prev)}
            />
          </div>
        )}
        {disputeTarget?.action === 'reject' && (
          <p className="text-sm text-base-content/70">
            This will mark the dispute as rejected. The dispute was found to be invalid.
          </p>
        )}
        {disputeTarget?.action === 'investigate' && (
          <p className="text-sm text-base-content/70">
            This will mark the dispute as under investigation.
          </p>
        )}
      </Modal>
    </div>
  )
}
