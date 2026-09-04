import Badge from '../../../components/ui/Badge'

const STATUS_STYLES = {
  pending: { variant: 'neutral', label: 'Pending' },
  investigating: { variant: 'primary', label: 'Investigating' },
  resolved: { variant: 'success', label: 'Resolved' },
  rejected: { variant: 'error', label: 'Rejected' },
}

/**
 * Badge that shows a report's lifecycle status.
 */
export default function ReportStatusBadge({ status }) {
  const { variant, label } = STATUS_STYLES[status] ?? { variant: 'neutral', label: status }

  return <Badge variant={variant} size="sm">{label}</Badge>
}