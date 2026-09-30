import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Percent } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import { useAuth } from '../../../contexts/AuthContext'
import { formatCurrency } from '../../../utils'
import { hasCapability } from '../../../utils/permissions'
import {
  useApplyCommissionPreset,
  useCommissionPresets,
  useUpdateCommissionTier,
} from '../../commissions/hooks/useCommissions'

const formatPercent = (value) => `${Number(value ?? 0).toFixed(2).replace(/\.?0+$/, '')}%`

const rangeLabel = (band) => (band.max_amount == null
  ? `${formatCurrency(band.min_amount)} and above`
  : `${formatCurrency(band.min_amount)} – ${formatCurrency(band.max_amount)}`)

function Stat({ label, value, tone = '' }) {
  return (
    <div className="rounded-box bg-base-200/60 px-3 py-2">
      <p className="text-xs text-base-content/60">{label}</p>
      <p className={`text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  )
}

/**
 * One active band. Administrators who manage commissions can change its
 * percentage in place; the server re-checks the range and the permission.
 */
function RateRow({ tier, canManage }) {
  const [percentage, setPercentage] = useState(String(Number(tier.percentage)))
  const updateTier = useUpdateCommissionTier()
  const value = Number(percentage)
  const isValid = percentage !== '' && value >= 0 && value <= 100
  const isChanged = isValid && value !== Number(tier.percentage)
  const label = rangeLabel(tier)

  const save = (event) => {
    event.preventDefault()
    if (isChanged) updateTier.mutate({ id: tier.id, payload: { percentage: value } })
  }

  return (
    <form onSubmit={save} className="flex items-center justify-between gap-3 border-b border-base-200 py-2 last:border-0">
      <span className="text-sm text-base-content/70">{label}</span>
      {canManage ? (
        <span className="flex items-center gap-2">
          <label className="input input-bordered input-sm flex w-24 items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="w-full"
              value={percentage}
              onChange={(event) => setPercentage(event.target.value)}
              aria-label={`Commission percentage for ${label}`}
              aria-invalid={!isValid}
            />
            <Percent className="size-3 shrink-0 text-base-content/50" aria-hidden="true" />
          </label>
          <Button type="submit" size="xs" variant={isChanged ? 'primary' : 'ghost'} disabled={!isChanged} loading={updateTier.isPending}>
            Save
          </Button>
        </span>
      ) : (
        <span className="badge badge-primary badge-sm">{formatPercent(tier.percentage)}</span>
      )}
    </form>
  )
}

function PresetConfirmModal({ preset, activeCount, onClose }) {
  const applyPreset = useApplyCommissionPreset()

  const apply = () => applyPreset.mutate(preset.key, { onSuccess: onClose })

  return (
    <Modal
      open={Boolean(preset)}
      onClose={onClose}
      title={preset ? `Apply the ${preset.name} rates?` : ''}
      description={activeCount > 0
        ? `This retires the ${activeCount} active tier${activeCount === 1 ? '' : 's'} and charges new bookings as follows. Bookings already made keep their own rate.`
        : 'New bookings will be charged as follows. Bookings already made keep their own rate.'}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={applyPreset.isPending}>Cancel</Button>
          <Button onClick={apply} loading={applyPreset.isPending}>Apply rates</Button>
        </>
      )}
    >
      {preset && (
        <ul className="flex flex-col">
          {preset.tiers.map((band) => (
            <li key={band.min_amount} className="flex justify-between border-b border-base-200 py-2 text-sm last:border-0">
              <span>{rangeLabel(band)}</span>
              <span className="font-semibold">{formatPercent(band.percentage)}</span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

/**
 * The dashboard's commission block: what SkillServe has collected, in pesos
 * and as a share of the bookings it was collected on, and the rates new
 * bookings are charged. Only rendered when the API includes the summary,
 * which it does for administrators who may read commissions.
 */
export default function CommissionCard({ summary }) {
  const { user } = useAuth()
  const canManage = hasCapability(user, 'manage commissions')
  const presets = useCommissionPresets({ enabled: canManage })
  const [selectedPreset, setSelectedPreset] = useState(null)
  const usesTiers = summary.rate_source === 'tiers'

  return (
    <Card
      title="Commission"
      description="What SkillServe has collected, and the rates new bookings are charged."
      footer={<Link to="/admin/commissions" className="btn btn-ghost btn-sm">Open Commission Management</Link>}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm text-base-content/60">Collected</p>
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(summary.collected)}</p>
            <p className="mt-1 text-sm text-base-content/60">
              <span className="font-semibold text-primary">{formatPercent(summary.collected_rate)}</span>
              {' '}of {formatCurrency(summary.collected_booking_value)} in settled bookings
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Outstanding" value={formatCurrency(summary.outstanding)} tone="text-warning" />
            <Stat label="Waived" value={formatCurrency(summary.waived)} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium">Current rates</p>
            {usesTiers ? (
              <div className="flex flex-col">
                {summary.tiers.map((tier) => (
                  <RateRow key={`${tier.id}-${tier.percentage}`} tier={tier} canManage={canManage} />
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-base-content/60">
                No tiers are active, so every booking is charged the flat
                {' '}<span className="font-semibold">{formatPercent(summary.fallback_rate)}</span> from System Settings.
              </p>
            )}
          </div>

          {canManage && (
            <div>
              <p className="mb-2 text-sm font-medium">Presets</p>
              <div className="flex flex-wrap gap-2">
                {presets.isLoading && <span className="loading loading-dots loading-sm" aria-label="Loading presets" />}
                {presets.isError && <span className="text-sm text-error">Presets could not be loaded.</span>}
                {(presets.data?.data ?? []).map((preset) => (
                  <Button key={preset.key} size="sm" variant="outline" title={preset.description} onClick={() => setSelectedPreset(preset)}>
                    {preset.name}
                  </Button>
                ))}
                <Link to="/admin/commissions" className="btn btn-outline btn-sm">Custom…</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <PresetConfirmModal
        preset={selectedPreset}
        activeCount={summary.tiers.length}
        onClose={() => setSelectedPreset(null)}
      />
    </Card>
  )
}
