import Badge from '../../../components/ui/Badge'

const STATUS_STYLES = {
  draft: { variant: 'neutral', label: 'Draft' },
  published: { variant: 'success', label: 'Published' },
  archived: { variant: 'secondary', label: 'Archived' },
}

/**
 * Badge that shows a service's publication status.
 */
export default function ServiceStatusBadge({ status }) {
  const { variant, label } = STATUS_STYLES[status] ?? { variant: 'neutral', label: status }

  return <Badge variant={variant} size="sm">{label}</Badge>
}
