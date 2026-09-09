import { format } from 'date-fns'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import BookingStatusBadge from './BookingStatusBadge'
import PaymentStatusBadge from './PaymentStatusBadge'
import DisputeStatusBadge from './DisputeStatusBadge'
import ErrorState from '../../../components/common/ErrorState'
import { useBooking, useBookingHistory } from '../hooks/useBookings'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)
const formatCurrency = (value, currency = 'USD') =>
  value != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value) : '—'

/**
 * Modal that displays the full details of a booking, including its history
 * and available admin actions (cancel, manage dispute).
 */
export default function BookingDetailsModal({
  open,
  onClose,
  bookingId,
  onCancel,
  onManageDispute,
}) {
  const { data, isLoading, isError, error, refetch } = useBooking(bookingId)
  const { data: historyData } = useBookingHistory(bookingId)
  const booking = data?.data
  const history = historyData?.data ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Booking Details"
      description="View complete booking information and take action."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {booking && booking.status !== 'cancelled' && booking.status !== 'completed' && onCancel && (
            <Button variant="error" onClick={() => onCancel(booking)}>
              Cancel Booking
            </Button>
          )}
          {booking && booking.dispute_reason && booking.dispute_status === 'pending' && onManageDispute && (
            <>
              <Button variant="warning" onClick={() => onManageDispute(booking, 'investigate')}>
                Investigate
              </Button>
              <Button variant="success" onClick={() => onManageDispute(booking, 'resolve')}>
                Resolve
              </Button>
              <Button variant="error" onClick={() => onManageDispute(booking, 'reject')}>
                Reject
              </Button>
            </>
          )}
        </>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-base-200" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Could not load booking details" message={error?.message} onRetry={refetch} />
      ) : booking ? (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold">{booking.booking_number}</h4>
              <p className="text-sm text-base-content/60">
                ID: #{booking.id}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.payment_status} />
            </div>
          </div>

          {/* Service */}
          {booking.service && (
            <div className="rounded-md bg-base-200/50 p-3">
              <span className="text-sm font-medium">Service</span>
              <p className="mt-1 text-sm">
                {booking.service.title}
                <span className="text-base-content/60 ml-2">
                  {formatCurrency(booking.service_price, booking.service.currency)}
                </span>
              </p>
            </div>
          )}

          {/* Client & Provider */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-base-content/60">Client</span>
              <p className="font-medium">{booking.client?.name ?? '—'}</p>
              {booking.client?.email && (
                <p className="text-xs text-base-content/60">{booking.client.email}</p>
              )}
            </div>
            <div>
              <span className="text-base-content/60">Provider</span>
              <p className="font-medium">{booking.provider?.business_name ?? '—'}</p>
              {booking.provider?.user?.name && (
                <p className="text-xs text-base-content/60">{booking.provider.user.name}</p>
              )}
            </div>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-base-content/60">Total Price</span>
              <p className="font-medium">{formatCurrency(booking.total_price, booking.currency)}</p>
            </div>
            <div>
              <span className="text-base-content/60">Platform Fee</span>
              <p className="font-medium">{formatCurrency(booking.platform_fee, booking.currency)}</p>
            </div>
            <div>
              <span className="text-base-content/60">Payment Method</span>
              <p className="font-medium">{booking.payment_method ?? '—'}</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-base-content/60">Scheduled Date</span>
              <p className="font-medium">{formatDateTime(booking.scheduled_date) ?? '—'}</p>
            </div>
            <div>
              <span className="text-base-content/60">Scheduled End</span>
              <p className="font-medium">{formatDateTime(booking.scheduled_end_date) ?? '—'}</p>
            </div>
          </div>

          {/* Notes */}
          {booking.client_notes && (
            <div>
              <span className="text-sm font-medium">Client Notes</span>
              <p className="mt-1 text-sm text-base-content/80">{booking.client_notes}</p>
            </div>
          )}

          {booking.provider_notes && (
            <div>
              <span className="text-sm font-medium">Provider Notes</span>
              <p className="mt-1 text-sm text-base-content/80">{booking.provider_notes}</p>
            </div>
          )}

          {/* Cancellation */}
          {booking.cancellation_reason && (
            <div className="rounded-md bg-error/10 p-3">
              <span className="text-sm font-medium text-error">Cancellation Reason</span>
              <p className="mt-1 text-sm">{booking.cancellation_reason}</p>
              {booking.cancelled_by_user && (
                <p className="mt-1 text-xs text-base-content/60">
                  Cancelled by: {booking.cancelled_by_user.name}
                </p>
              )}
              {booking.cancelled_at && (
                <p className="text-xs text-base-content/60">
                  At: {formatDateTime(booking.cancelled_at)}
                </p>
              )}
            </div>
          )}

          {/* Dispute */}
          {booking.dispute_reason && (
            <div className="rounded-md bg-warning/10 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-warning">Dispute</span>
                <DisputeStatusBadge status={booking.dispute_status} />
              </div>
              <p className="mt-1 text-sm">{booking.dispute_reason}</p>
              {booking.disputed_at && (
                <p className="mt-1 text-xs text-base-content/60">
                  Disputed at: {formatDateTime(booking.disputed_at)}
                </p>
              )}
              {booking.dispute_resolution && (
                <div className="mt-2 rounded bg-base-200/50 p-2">
                  <span className="text-xs font-medium">Resolution</span>
                  <p className="text-sm">{booking.dispute_resolution}</p>
                </div>
              )}
            </div>
          )}

          {/* Status timeline */}
          <div className="border-t border-base-200 pt-3">
            <span className="text-sm font-medium">Status Timeline</span>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              {booking.confirmed_at && (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Confirmed — {formatDateTime(booking.confirmed_at)}</span>
                </div>
              )}
              {booking.started_at && (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-info" />
                  <span>Started — {formatDateTime(booking.started_at)}</span>
                </div>
              )}
              {booking.completed_at && (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span>Completed — {formatDateTime(booking.completed_at)}</span>
                </div>
              )}
              {booking.cancelled_at && (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-error" />
                  <span>Cancelled — {formatDateTime(booking.cancelled_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity history */}
          {history.length > 0 && (
            <div className="border-t border-base-200 pt-3">
              <span className="text-sm font-medium">Activity History</span>
              <div className="mt-2 flex flex-col gap-1">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-base-content/40" />
                    <div>
                      <span className="font-medium">{entry.event}</span>
                      {entry.actor && (
                        <span className="text-base-content/60 ml-1">by {entry.actor.name}</span>
                      )}
                      <span className="text-base-content/60 ml-1">
                        — {formatDateTime(entry.logged_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-base-200 pt-3 text-xs text-base-content/60">
            <p>Created: {formatDateTime(booking.created_at)}</p>
            {booking.updated_at && booking.updated_at !== booking.created_at && (
              <p>Updated: {formatDateTime(booking.updated_at)}</p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
