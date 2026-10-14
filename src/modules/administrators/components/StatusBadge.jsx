import Badge from '../../../components/ui/Badge'

/**
 * Activation status pill for administrator accounts.
 */
export default function StatusBadge({ status }) {
  if (status === 'active') {
    return <Badge variant="success" className="badge-soft">Active</Badge>
  }

  return <Badge variant="outline" className="border-base-300 text-base-content/70">Inactive</Badge>
}
