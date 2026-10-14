import { useState } from 'react'
import { format } from 'date-fns'
import Button from '../../../components/ui/Button'
import Textarea from '../../../components/ui/Textarea'
import Badge from '../../../components/ui/Badge'
import { PrivatePhotoThumbnail } from '../../../components/common/PrivatePhotos'
import { formatCurrency } from '../../../utils'
import { useResolveRefund } from '../hooks/useBookings'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy h:mm a') : '—')

const STATUS = {
  due: { variant: 'warning', label: 'Waiting for the provider' },
  sent: { variant: 'info', label: 'Returned — waiting for the customer' },
  confirmed: { variant: 'success', label: 'Confirmed by the customer' },
  not_received: { variant: 'error', label: 'Customer says not received' },
  resolved: { variant: 'neutral', label: 'Resolved by SkillServe' },
}

/**
 * What the provider owes back on a cancelled booking, with the provider's
 * proof and the customer's answer. An administrator with payment rights
 * settles a case the two cannot: returned (recorded as refunded) or not
 * returned (the provider stays blocked — then suspend or ban them).
 */
export default function RefundCaseSection({ booking, canResolve }) {
  const refund = booking.refund
  const [note, setNote] = useState('')
  const resolve = useResolveRefund()

  if (!refund) return null

  const status = refund.is_overdue
    ? { variant: 'error', label: 'Overdue — provider blocked' }
    : STATUS[refund.status] ?? { variant: 'neutral', label: refund.status }
  const settleable = canResolve && refund.status !== 'confirmed'
  const submit = (resolution) => resolve.mutate({ id: booking.id, resolution, note: note.trim() }, { onSuccess: () => setNote('') })

  return (
    <div className="rounded-md border border-base-300 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">Payment to return to the customer</span>
        <Badge variant={status.variant} size="sm">{status.label}</Badge>
      </div>
      <p className="mt-1">
        {formatCurrency(refund.amount)} · due {formatDateTime(refund.due_by)}
        {refund.reference && ` · ref ${refund.reference}`}
      </p>
      {refund.proof_download_path && (
        <div className="mt-2 flex items-center gap-3">
          <PrivatePhotoThumbnail path={refund.proof_download_path} />
          <span className="text-xs text-base-content/60">Provider&apos;s proof · sent {formatDateTime(refund.sent_at)}</span>
        </div>
      )}
      {refund.customer_note && (
        <p className="mt-2 rounded bg-error/10 p-2 text-xs">
          <span className="font-medium">Customer: </span>{refund.customer_note}
        </p>
      )}
      {refund.resolution && (
        <p className="mt-2 text-xs text-base-content/70">
          Resolved as <span className="font-medium">{refund.resolution === 'returned' ? 'returned' : 'not returned'}</span>
          {refund.resolved_at && ` on ${formatDateTime(refund.resolved_at)}`}{refund.resolution_note && ` — ${refund.resolution_note}`}
        </p>
      )}
      {settleable && (
        <div className="mt-3 flex flex-col gap-2 border-t border-base-200 pt-3">
          <Textarea
            label="Decision note (sent to both)"
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What you checked, e.g. the GCash records both sides sent…"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="error" size="sm" onClick={() => submit('not_returned')} disabled={note.trim().length < 3} loading={resolve.isPending}>
              Not returned — keep provider blocked
            </Button>
            <Button variant="success" size="sm" onClick={() => submit('returned')} disabled={note.trim().length < 3} loading={resolve.isPending}>
              Returned — record it
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
