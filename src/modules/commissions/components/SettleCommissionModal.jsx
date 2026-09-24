import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Textarea from '../../../components/ui/Textarea'
import { formatCurrency } from '../../../utils'

const METHODS = [
  { value: 'gcash', label: 'GCash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'offset', label: 'Offset against a payout' },
  { value: 'other', label: 'Other' },
]

/**
 * Record that a provider remitted SkillServe's share, or write the debt off.
 *
 * The amount is never entered: it is always the commission snapshotted on the
 * booking, so it is shown read-only. Waiving always requires a reason, which
 * goes to the audit log with the administrator who approved it.
 */
export default function SettleCommissionModal({ open, onClose, onConfirm, loading, commission, mode = 'settle' }) {
  const isWaive = mode === 'waive'

  // Remounted by the page's `key` whenever it opens or the target changes,
  // so these defaults are the reset.
  const [method, setMethod] = useState('gcash')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [reason, setReason] = useState('')

  const submit = (event) => {
    event.preventDefault()

    if (isWaive) {
      onConfirm({ reason: reason.trim() })
      return
    }

    onConfirm({ method, reference: reference.trim() || null, notes: notes.trim() || null })
  }

  const canSubmit = isWaive ? reason.trim().length >= 3 : Boolean(method)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isWaive ? 'Waive commission' : 'Record commission settlement'}
      description={
        commission
          ? `${commission.booking_number} · ${commission.provider?.business_name ?? 'Provider'}`
          : undefined
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="settle-commission-form"
            variant={isWaive ? 'warning' : 'primary'}
            loading={loading}
            disabled={!canSubmit}
          >
            {isWaive ? 'Waive' : 'Record settlement'}
          </Button>
        </>
      }
    >
      <form id="settle-commission-form" onSubmit={submit} className="flex flex-col gap-3">
        <div className="rounded-lg bg-base-200 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/60">Amount owed</span>
            <span className="font-semibold">{formatCurrency(commission?.commission_amount ?? 0)}</span>
          </div>
          <p className="mt-1 text-xs text-base-content/60">
            Taken from the booking, not from this form.
          </p>
        </div>

        {isWaive ? (
          <Textarea
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why is this commission being written off?"
            rows={3}
            maxLength={1000}
            required
            hint="Recorded in the audit log with your name."
          />
        ) : (
          <>
            <label className="w-full">
              <span className="mb-1 block text-sm font-medium">How it was received</span>
              <select
                className="select select-bordered w-full"
                value={method}
                onChange={(event) => setMethod(event.target.value)}
              >
                {METHODS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="Reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="e.g. a GCash reference number"
              maxLength={100}
            />

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
