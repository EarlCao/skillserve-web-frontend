import Badge from '../../../components/ui/Badge'

/**
 * Account status pill for service providers.
 *
 * @param {object} props
 * @param {boolean} props.isSuspended
 */
export default function ProviderStatusBadge({ isSuspended }) {
  if (isSuspended) {
    return <Badge variant="warning" className="badge-soft">Suspended</Badge>
  }

  return <Badge variant="success" className="badge-soft">Active</Badge>
}
