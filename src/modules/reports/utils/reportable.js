export const REPORT_TYPE_LABELS = {
  user: 'User',
  service: 'Service',
  review: 'Review',
  message: 'Message',
}

/**
 * Primary label for the reported item (used in the table and details modal).
 */
export function reportableLabel(report) {
  const target = report?.reportable
  if (!target) return null

  switch (report.type) {
    case 'user':
      return target.name
    case 'service':
      return target.title
    case 'review':
      return target.comment || 'Review'
    case 'message':
      return target.content || 'Message'
    default:
      return null
  }
}

/**
 * Secondary line for the reported item (email / provider / author).
 */
export function reportableSubtitle(report) {
  const target = report?.reportable
  if (!target) return null

  switch (report.type) {
    case 'user':
      return target.email
    case 'service':
      return target.provider?.business_name || target.provider?.user?.name || null
    case 'review':
      return target.reviewer?.name || null
    case 'message':
      return target.sender?.name || null
    default:
      return null
  }
}