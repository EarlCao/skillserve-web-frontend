import Badge from '../../../components/ui/Badge'

const PRIORITY = {
  low: ['neutral', 'Low'],
  normal: ['primary', 'Normal'],
  high: ['warning', 'High'],
  urgent: ['error', 'Urgent'],
}

export default function SupportTicketPriorityBadge({ priority }) {
  const [variant, label] = PRIORITY[priority] ?? ['neutral', priority ?? 'Unknown']

  return <Badge variant={variant}>{label}</Badge>
}
