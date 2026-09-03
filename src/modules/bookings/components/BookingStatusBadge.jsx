import Badge from '../../../components/ui/Badge'

const STATUS_STYLES = {
  pending: { variant: 'warning', label: 'Pending' },
  confirmed: { variant: 'primary', label: 'Confirmed' },
  active: { variant: 'info', label: 'Active' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'error', label: 'Cancelled' },
  disputed: { variant: 'accent', label: 'Disputed' },
}

/**
 * Badge that shows a booking's current status.
 */
export default function BookingStatusBadge({ status }) {
  const { variant, label } = STATUS_STYLES[status] ?? { variant: 'neutral', label: status }

  return <Badge variant={variant} size="sm">{label}</Badge>
}
