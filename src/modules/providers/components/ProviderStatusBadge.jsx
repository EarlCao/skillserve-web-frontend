import Badge from '../../../components/ui/Badge'

/**
 * Account status pill for service providers. A ban (from report moderation)
 * outranks a suspension, since it is what keeps the provider signed out.
 *
 * @param {object} props
 * @param {boolean} props.isSuspended
 * @param {string} [props.accountStatus] - the account's own status ('active', 'suspended', 'banned')
 */
export default function ProviderStatusBadge({ isSuspended, accountStatus }) {
  if (accountStatus === 'banned') {
    return <Badge variant="error" className="badge-soft">Banned</Badge>
  }

  if (isSuspended) {
    return <Badge variant="warning" className="badge-soft">Suspended</Badge>
  }

  return <Badge variant="success" className="badge-soft">Active</Badge>
}
