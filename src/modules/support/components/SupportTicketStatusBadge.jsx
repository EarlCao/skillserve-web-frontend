import Badge from '../../../components/ui/Badge'

const STATUS = {
  open: ['primary', 'Open'],
  in_progress: ['warning', 'In progress'],
  resolved: ['success', 'Resolved'],
}

export default function SupportTicketStatusBadge({ status }) {
  const [variant, label] = STATUS[status] ?? ['neutral', status ?? 'Unknown']

  return <Badge variant={variant}>{label}</Badge>
}
