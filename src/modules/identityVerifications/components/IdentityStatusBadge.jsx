import Badge from '../../../components/ui/Badge'

const VARIANTS = {
  unverified: { variant: 'outline', label: 'Unverified' },
  pending: { variant: 'warning', label: 'Pending review' },
  verified: { variant: 'success', label: 'Verified' },
  rejected: { variant: 'error', label: 'Rejected' },
}

export default function IdentityStatusBadge({ status, size = 'md' }) {
  const { variant, label } = VARIANTS[status] ?? { variant: 'outline', label: status ?? '—' }

  // Neutral states are outlined: a grey soft badge all but vanishes in dark mode.
  const tone = variant === 'outline' ? 'border-base-300 text-base-content/70' : 'badge-soft'

  return <Badge variant={variant} size={size} className={`${tone} whitespace-nowrap`}>{label}</Badge>
}
