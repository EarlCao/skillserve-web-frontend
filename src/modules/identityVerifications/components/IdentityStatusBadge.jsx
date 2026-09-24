import Badge from '../../../components/ui/Badge'

const VARIANTS = {
  unverified: { variant: 'neutral', label: 'Unverified' },
  pending: { variant: 'warning', label: 'Pending review' },
  verified: { variant: 'success', label: 'Verified' },
  rejected: { variant: 'error', label: 'Rejected' },
}

export default function IdentityStatusBadge({ status }) {
  const { variant, label } = VARIANTS[status] ?? { variant: 'neutral', label: status ?? '—' }

  return <Badge variant={variant}>{label}</Badge>
}
