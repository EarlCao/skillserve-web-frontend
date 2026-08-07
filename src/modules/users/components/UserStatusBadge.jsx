import Badge from '../../../components/ui/Badge'

/**
 * Account status pill for platform users.
 */
export default function UserStatusBadge({ status }) {
  if (status === 'suspended') {
    return <Badge variant="warning">Suspended</Badge>
  }

  if (status === 'banned') {
    return <Badge variant="error">Banned</Badge>
  }

  return <Badge variant="success">Active</Badge>
}
