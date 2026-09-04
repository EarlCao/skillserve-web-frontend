import Badge from '../../../components/ui/Badge'
import { REPORT_TYPE_LABELS } from '../utils/reportable'

const TYPE_STYLES = {
  user: { variant: 'primary', label: 'User' },
  service: { variant: 'secondary', label: 'Service' },
  review: { variant: 'accent', label: 'Review' },
  message: { variant: 'warning', label: 'Message' },
}

/**
 * Badge that shows what kind of item a report targets.
 */
export default function ReportTypeBadge({ type }) {
  const { variant, label } = TYPE_STYLES[type] ?? { variant: 'neutral', label: REPORT_TYPE_LABELS[type] ?? type }

  return <Badge variant={variant} size="sm">{label}</Badge>
}