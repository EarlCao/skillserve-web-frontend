import { format } from 'date-fns'
import { FileText, History, MessageSquare, Scale } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import ErrorState from '../../../components/common/ErrorState'
import Button from '../../../components/ui/Button'
import DisputeStatusBadge from '../../bookings/components/DisputeStatusBadge'
import BookingStatusBadge from '../../bookings/components/BookingStatusBadge'
import PaymentStatusBadge from '../../bookings/components/PaymentStatusBadge'
import { useDispute, useDisputeHistory } from '../hooks/useDisputes'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

export default function DisputeDetailsModal({ open, onClose, bookingId, onAction, canManage }) {
  const { data, isLoading, isError, error, refetch } = useDispute(bookingId)
  const { data: historyData } = useDisputeHistory(bookingId)
  const booking = data?.data
  const history = historyData?.data ?? []
  const status = booking?.dispute_status
  const isOpen = ['pending', 'investigated'].includes(status)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Dispute Details"
      description="Review the booking, statements, evidence, and administrative history."
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {booking && canManage && isOpen && (
            <>
              {status === 'pending' && <Button variant="primary" onClick={() => onAction('investigate')}>Investigate</Button>}
              <Button variant="secondary" onClick={() => onAction('note')}>Add note</Button>
              <Button variant="success" onClick={() => onAction('resolve')}>Resolve</Button>
              <Button variant="error" onClick={() => onAction('reject')}>Reject</Button>
            </>
          )}
          {booking && canManage && status === 'resolved' && <Button variant="neutral" onClick={() => onAction('close')}>Close dispute</Button>}
        </>
      )}
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 w-full animate-pulse rounded bg-base-200" />)}</div>
      ) : isError ? (
        <ErrorState title="Could not load dispute details" message={error?.message} onRetry={refetch} />
      ) : booking ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold">{booking.booking_number}</h4>
              <p className="text-sm text-base-content/60">{booking.service?.title ?? '—'}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <DisputeStatusBadge status={booking.dispute_status} />
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.payment_status} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-md bg-base-200/50 p-3 text-sm">
            <div><span className="text-base-content/60">Client</span><p className="font-medium">{booking.client?.name}</p><p className="text-xs text-base-content/60">{booking.client?.email}</p></div>
            <div><span className="text-base-content/60">Provider</span><p className="font-medium">{booking.provider?.business_name}</p><p className="text-xs text-base-content/60">{booking.provider?.user?.name}</p></div>
          </div>

          <div className="rounded-md bg-warning/10 p-3">
            <div className="flex items-center gap-2"><Scale className="size-4 text-warning" /><span className="font-medium">Dispute reason</span></div>
            <p className="mt-1 text-sm">{booking.dispute_reason}</p>
            <p className="mt-1 text-xs text-base-content/60">Submitted {formatDateTime(booking.disputed_at)}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {booking.client_notes && <div className="rounded border border-base-200 p-3"><span className="text-sm font-medium">Client statement</span><p className="mt-1 text-sm">{booking.client_notes}</p></div>}
            {booking.provider_notes && <div className="rounded border border-base-200 p-3"><span className="text-sm font-medium">Provider statement</span><p className="mt-1 text-sm">{booking.provider_notes}</p></div>}
          </div>

          {booking.dispute_evidence?.length > 0 && (
            <div><span className="flex items-center gap-2 text-sm font-medium"><FileText className="size-4" />Evidence</span><div className="mt-2 flex flex-col gap-2">{booking.dispute_evidence.map((item, index) => <div key={index} className="rounded border border-base-200 p-2 text-sm"><p>{item.label ?? item.name ?? 'Evidence item'}</p>{item.content && <p className="mt-1 text-xs text-base-content/70">{item.content}</p>}{item.url && <a className="link link-primary mt-1 inline-block text-xs" href={item.url} target="_blank" rel="noreferrer">Open evidence</a>}</div>)}</div></div>
          )}

          {booking.dispute_notes?.length > 0 && (
            <div><span className="flex items-center gap-2 text-sm font-medium"><MessageSquare className="size-4" />Internal notes</span><div className="mt-2 flex flex-col gap-2">{booking.dispute_notes.map((item, index) => <div key={index} className="rounded border border-base-200 p-2 text-sm"><p>{item.note}</p><p className="mt-1 text-xs text-base-content/60">Admin #{item.created_by} · {formatDateTime(item.created_at)}</p></div>)}</div></div>
          )}

          {booking.dispute_resolution && <div className="rounded-md bg-success/10 p-3"><span className="font-medium text-success">Decision</span><p className="mt-1 text-sm">{booking.dispute_resolution}</p></div>}

          {history.length > 0 && <div><span className="flex items-center gap-2 text-sm font-medium"><History className="size-4" />Dispute history</span><div className="mt-2 flex flex-col gap-2">{history.map((entry) => <div key={entry.id} className="text-xs"><span className="font-medium">{entry.event}</span>{entry.actor && <span className="ml-1 text-base-content/60">by {entry.actor.name}</span>}<span className="ml-1 text-base-content/60">· {formatDateTime(entry.logged_at)}</span></div>)}</div></div>}
        </div>
      ) : null}
    </Modal>
  )
}
