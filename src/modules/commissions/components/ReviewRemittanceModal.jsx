import { useState } from 'react'
import { ImageIcon, TriangleAlert } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Textarea from '../../../components/ui/Textarea'
import { formatCurrency, formatDateTime } from '../../../utils'
import { useOpenRemittanceProof } from '../hooks/useCommissions'
import CommissionStatusBadge from './CommissionStatusBadge'

/**
 * Confirm or reject a provider's GCash commission payment.
 *
 * The reviewer looks for the reference number in SkillServe's GCash history,
 * checks the amount and the sender, then confirms — which settles every
 * booking listed — or rejects with a reason the provider is shown.
 */
export default function ReviewRemittanceModal({ open, onClose, onConfirm, loading, remittance, mode = 'confirm' }) {
  const isReject = mode === 'reject'
  const openProof = useOpenRemittanceProof()

  // Remounted by the page's `key` whenever it opens or the target changes,
  // so these defaults are the reset.
  const [notes, setNotes] = useState('')
  const [reason, setReason] = useState('')

  const submit = (event) => {
    event.preventDefault()
    onConfirm(isReject ? { reason: reason.trim() } : { notes: notes.trim() || null })
  }

  const short = remittance && Number(remittance.amount_sent) < Number(remittance.amount_due)
  // Settled by hand, waived or voided since the provider paid: confirming
  // skips them, so the provider may have paid for them twice.
  const alreadyClosed = (remittance?.bookings ?? []).filter((booking) => booking.commission_status !== 'outstanding')
  const canSubmit = isReject ? reason.trim().length >= 3 : true

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isReject ? 'Reject GCash payment' : 'Confirm GCash payment'}
      description={remittance ? `${remittance.provider?.business_name ?? 'Provider'} · submitted ${formatDateTime(remittance.submitted_at)}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="review-remittance-form"
            variant={isReject ? 'error' : 'primary'}
            loading={loading}
            disabled={!canSubmit}
          >
            {isReject ? 'Reject payment' : 'Confirm & settle'}
          </Button>
        </>
      }
    >
      <form id="review-remittance-form" onSubmit={submit} className="flex flex-col gap-3">
        <div className="rounded-lg bg-base-200 p-3 text-sm">
          <p className="text-base-content/60">{remittance?.method === 'qrph' ? 'SkillServe reference (QR Ph)' : 'GCash reference number'}</p>
          <p className="font-mono text-lg font-semibold tracking-wide">{remittance?.reference}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p className="text-base-content/60">Amount sent</p>
              <p className={`font-semibold ${short ? 'text-error' : ''}`}>{formatCurrency(remittance?.amount_sent ?? 0)}</p>
            </div>
            <div>
              <p className="text-base-content/60">Amount owed</p>
              <p className="font-semibold">{formatCurrency(remittance?.amount_due ?? 0)}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-base-content/60">Expected sender (provider&apos;s GCash)</p>
            <p>
              {remittance?.provider?.gcash_number
                ? `${remittance.provider.gcash_name ?? ''} · ${remittance.provider.gcash_number}`
                : 'The provider has not saved their GCash details.'}
            </p>
          </div>
          {remittance?.has_proof && (
            <button
              type="button"
              className="link link-primary mt-2 inline-flex items-center gap-1 text-xs"
              onClick={() => openProof.mutate(remittance.id)}
              disabled={openProof.isPending}
            >
              <ImageIcon className="size-3" /> {openProof.isPending ? 'Opening…' : 'Open receipt screenshot'}
            </button>
          )}
        </div>

        {remittance?.bookings?.length > 0 && (
          <div className="text-sm">
            <p className="mb-1 font-medium">{isReject ? 'Covers' : 'Confirming settles'}</p>
            <ul className="flex flex-col gap-1">
              {remittance.bookings.map((booking) => (
                <li key={booking.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    <span className="font-mono text-xs">{booking.booking_number}</span>
                    <span className="text-base-content/60"> · {booking.service ?? '—'}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {formatCurrency(booking.commission_amount)}
                    <CommissionStatusBadge status={booking.commission_status} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {remittance?.method === 'qrph' && remittance.failure_reason && (
          <div role="alert" className="alert alert-error text-sm">
            <TriangleAlert className="size-5" />
            <span>
              {remittance.failure_reason}
              {remittance.external_payment_id ? ` PayMongo payment: ${remittance.external_payment_id}.` : ''}
            </span>
          </div>
        )}

        {remittance?.status === 'pending' && remittance.other_claims_count > 0 && (
          <div role="alert" className="alert alert-warning text-sm">
            <TriangleAlert className="size-5" />
            <span>
              Another provider has also submitted this reference number. Confirm only the claim whose sender
              matches the GCash history; a reference can be confirmed once.
            </span>
          </div>
        )}

        {remittance?.status === 'pending' && alreadyClosed.length > 0 && (
          <div role="alert" className="alert alert-warning text-sm">
            <TriangleAlert className="size-5" />
            <span>
              {alreadyClosed.length === 1 ? 'One of these bookings is' : `${alreadyClosed.length} of these bookings are`}{' '}
              no longer outstanding, so confirming will not settle {alreadyClosed.length === 1 ? 'it' : 'them'}. If the
              provider paid for {alreadyClosed.length === 1 ? 'it' : 'them'} anyway, arrange a refund of the difference.
            </span>
          </div>
        )}

        {isReject ? (
          <Textarea
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Reference number not found in our GCash history."
            rows={3}
            maxLength={1000}
            required
            hint="The provider is shown this and can submit the payment again."
          />
        ) : (
          <>
            <p className="text-xs text-base-content/60">
              Only confirm once you have found this reference and amount in SkillServe&apos;s GCash history.
            </p>
            <Textarea
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              maxLength={1000}
            />
          </>
        )}
      </form>
    </Modal>
  )
}
