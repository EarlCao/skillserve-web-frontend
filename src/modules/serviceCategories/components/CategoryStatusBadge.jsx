import Badge from '../../../components/ui/Badge'

/**
 * Enabled/disabled pill for service categories and subcategories.
 *
 * @param {object} props
 * @param {string} props.status  'enabled' | 'disabled'
 */
export default function CategoryStatusBadge({ status }) {
  return status === 'enabled' ? (
    <Badge variant="success">Enabled</Badge>
  ) : (
    <Badge variant="neutral">Disabled</Badge>
  )
}
