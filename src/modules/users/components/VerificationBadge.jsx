import Badge from '../../../components/ui/Badge'

/**
 * Whether the account confirmed its email with the sign-up code. This is not
 * the National ID review — that is IdentityStatusBadge.
 */
export default function VerificationBadge({ verified, size = 'md' }) {
  return verified ? (
    <Badge variant="success" size={size} className="badge-soft whitespace-nowrap">Email confirmed</Badge>
  ) : (
    <Badge variant="outline" size={size} className="border-base-300 text-base-content/70 whitespace-nowrap">Email not confirmed</Badge>
  )
}
