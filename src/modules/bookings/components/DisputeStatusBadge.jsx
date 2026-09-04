import Badge from '../../../components/ui/Badge'

const DISPUTE_STYLES = {
  pending: { variant: 'warning', label: 'Pending' },
  investigated: { variant: 'primary', label: 'Investigated' },
  resolved: { variant: 'success', label: 'Resolved' },
  rejected: { variant: 'error', label: 'Rejected' },
  closed: { variant: 'neutral', label: 'Closed' },
}

/**
 * Badge that shows a booking's dispute status.
 */
export default function DisputeStatusBadge({ status }) {
  const { variant, label } = DISPUTE_STYLES[status] ?? { variant: 'neutral', label: status }

  return <Badge variant={variant} size="sm">{label}</Badge>
}
