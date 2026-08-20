import Badge from '../../../components/ui/Badge'

const STATUS_STYLES = {
  pending: { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'error', label: 'Rejected' },
}

/**
 * Badge that shows a service's approval status.
 */
export default function ApprovalStatusBadge({ status }) {
  const { variant, label } = STATUS_STYLES[status] ?? { variant: 'neutral', label: status }

  return <Badge variant={variant} size="sm">{label}</Badge>
}
