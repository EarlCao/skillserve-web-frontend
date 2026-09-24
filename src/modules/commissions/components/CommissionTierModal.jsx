import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'

/**
 * Create or edit a commission band.
 *
 * Both bounds are inclusive, and leaving the maximum empty makes the band
 * open-ended — the form says so, because getting it wrong silently changes
 * what every booking in that range is charged.
 *
 * Overlap with another active band is a cross-row rule decided by the server,
 * so a clash arrives as a 422 naming the band it collides with rather than
 * being guessed at here.
 */
export default function CommissionTierModal({ open, onClose, onSubmit, loading, tier }) {
  const isEdit = Boolean(tier)

  // The page gives this modal a `key` that changes when it opens or the
  // target changes, so it remounts with fresh state — no reset effect needed.
  const [form, setForm] = useState(() =>
    tier
      ? {
          name: tier.name ?? '',
          min_amount: tier.min_amount ?? '',
          max_amount: tier.max_amount ?? '',
          percentage: tier.percentage ?? '',
          is_active: Boolean(tier.is_active),
        }
      : { name: '', min_amount: '', max_amount: '', percentage: '', is_active: true },
  )
  const [error, setError] = useState(null)

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = (event) => {
    event.preventDefault()
    setError(null)

    const min = Number(form.min_amount)
    const max = form.max_amount === '' ? null : Number(form.max_amount)

    if (max !== null && max < min) {
      setError('The maximum amount must be greater than or equal to the minimum amount.')
      return
    }

    onSubmit({
      name: form.name.trim(),
      min_amount: min,
      max_amount: max,
      percentage: Number(form.percentage),
      is_active: form.is_active,
    })
  }

  // Shows the split on the band's own lower bound, so the effect of the rate
  // is visible before it is saved. Indicative only — the binding figure is
  // snapshotted onto each booking when it is made.
  const amount = Number(form.min_amount)
  const rate = Number(form.percentage)
  const preview =
    Number.isFinite(amount) && Number.isFinite(rate) && amount > 0 && form.percentage !== ''
      ? (() => {
          const commission = Math.round(amount * rate) / 100
          return `A ₱${amount.toFixed(2)} job in this band earns the provider ₱${(amount - commission).toFixed(2)} after a ₱${commission.toFixed(2)} commission.`
        })()
      : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit commission tier' : 'New commission tier'}
      description="Both amounts are inclusive. Leave the maximum empty for the top band."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="commission-tier-form" loading={loading}>
            {isEdit ? 'Save changes' : 'Create tier'}
          </Button>
        </>
      }
    >
      <form id="commission-tier-form" onSubmit={submit} className="flex flex-col gap-3">
        <Input label="Name" value={form.name} onChange={update('name')} placeholder="Standard" required maxLength={120} />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Minimum amount (₱)"
            type="number"
            step="0.01"
            min="0"
            value={form.min_amount}
            onChange={update('min_amount')}
            required
          />
          <Input
            label="Maximum amount (₱)"
            type="number"
            step="0.01"
            min="0"
            value={form.max_amount}
            onChange={update('max_amount')}
            placeholder="Empty = no limit"
            hint="Inclusive. Leave empty for the top band."
          />
        </div>

        <Input
          label="Commission (%)"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={form.percentage}
          onChange={update('percentage')}
          required
        />

        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" className="toggle toggle-sm" checked={form.is_active} onChange={update('is_active')} />
          <span className="text-sm">Active</span>
        </label>

        {preview && <p className="text-sm text-base-content/60">{preview}</p>}

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
