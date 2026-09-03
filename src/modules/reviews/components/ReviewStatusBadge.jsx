import Badge from '../../../components/ui/Badge'

const STATUS_STYLES = {
  active: { variant: 'success', label: 'Active' },
  hidden: { variant: 'warning', label: 'Hidden' },
  removed: { variant: 'error', label: 'Removed' },
}

/**
 * Badge that shows a review's moderation status.
 */
export default function ReviewStatusBadge({ status }) {
  const { variant, label } = STATUS_STYLES[status] ?? { variant: 'neutral', label: status }

  return <Badge variant={variant} size="sm">{label}</Badge>
}
