import Badge from '../../../components/ui/Badge'

/**
 * What stage a booking's commission is at. `outstanding` is the one that
 * actually restricts the provider, so it reads as a warning rather than as
 * neutral information.
 */
const VARIANTS = {
  pending: { variant: 'outline', label: 'Pending' },
  outstanding: { variant: 'warning', label: 'Outstanding' },
  settled: { variant: 'success', label: 'Settled' },
  waived: { variant: 'info', label: 'Waived' },
  voided: { variant: 'neutral', label: 'Voided' },
}

export default function CommissionStatusBadge({ status }) {
  const { variant, label } = VARIANTS[status] ?? { variant: 'neutral', label: status ?? '—' }

  return <Badge variant={variant}>{label}</Badge>
}
