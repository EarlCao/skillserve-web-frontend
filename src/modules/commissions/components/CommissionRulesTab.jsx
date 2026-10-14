import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Skeleton from '../../../components/ui/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { useCommissionSettings, useUpdateCommissionSettings } from '../hooks/useCommissions'

const FIELDS = [
  {
    name: 'commission_rate',
    label: 'Fallback commission rate (%)',
    hint: 'Charged on a booking whose amount matches no tier. Tiers decide the rate otherwise.',
    step: '0.01',
    min: 0,
    max: 100,
  },
  {
    name: 'commission_block_min_amount',
    label: 'Block providers once unpaid commission reaches (₱)',
    hint: 'A provider who owes less keeps taking new bookings; 0 blocks on any unpaid commission. Finishing agreed jobs is never blocked.',
    step: '0.01',
    min: 0,
    max: 1000000,
  },
  {
    name: 'commission_block_after_days',
    label: 'Also block when a commission stays unpaid for (days)',
    hint: 'Blocks even a small debt once the oldest unpaid commission is this many days old; 0 turns this off. Whichever limit is reached first applies.',
    step: '1',
    min: 0,
    max: 365,
  },
]

/**
 * The commission rules that used to live in System Settings → Marketplace:
 * the fallback rate, and when unremitted commission stops a provider taking
 * new work.
 */
export default function CommissionRulesTab({ canManage }) {
  const { data, isLoading, isError, error, refetch } = useCommissionSettings()

  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col gap-4">{FIELDS.map((field) => <Skeleton key={field.name} className="h-16 w-full" />)}</div>
      </Card>
    )
  }
  if (isError) return <ErrorState title="Could not load the commission settings" message={error?.message} onRetry={refetch} />

  // Remounts with fresh values whenever the saved settings change.
  return <RulesForm key={JSON.stringify(data?.data)} initial={data?.data ?? {}} canManage={canManage} />
}

function RulesForm({ initial, canManage }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(FIELDS.map((field) => [field.name, String(initial[field.name] ?? '')])),
  )
  const save = useUpdateCommissionSettings()
  const changed = FIELDS.some((field) => values[field.name] !== String(initial[field.name] ?? ''))

  const submit = (event) => {
    event.preventDefault()
    save.mutate(Object.fromEntries(FIELDS.map((field) => [field.name, Number(values[field.name])])))
  }

  return (
    <Card>
      <form onSubmit={submit} className="flex max-w-xl flex-col gap-5">
        <fieldset disabled={!canManage || save.isPending} className="flex flex-col gap-5">
          {FIELDS.map((field) => (
            <Input
              key={field.name}
              type="number"
              label={field.label}
              hint={field.hint}
              step={field.step}
              min={field.min}
              max={field.max}
              required
              value={values[field.name]}
              onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
            />
          ))}
        </fieldset>
        {canManage ? (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={!changed || save.isPending} onClick={() => setValues(Object.fromEntries(FIELDS.map((field) => [field.name, String(initial[field.name] ?? '')])))}>
              Discard
            </Button>
            <Button type="submit" loading={save.isPending} disabled={!changed}>Save rules</Button>
          </div>
        ) : (
          <p className="text-sm text-base-content/60">You can view these rules; changing them needs the manage commissions permission.</p>
        )}
      </form>
    </Card>
  )
}
