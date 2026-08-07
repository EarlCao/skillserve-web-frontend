import Badge from '../../../components/ui/Badge'

/**
 * Activation status pill for administrator accounts.
 */
export default function StatusBadge({ status }) {
  if (status === 'active') {
    return <Badge variant="success">Active</Badge>
  }

  return <Badge variant="error">Inactive</Badge>
}
