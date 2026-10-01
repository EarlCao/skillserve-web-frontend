import Badge from '../../../components/ui/Badge'

/**
 * Whether the account confirmed its email with the sign-up code. This is not
 * the National ID review — that is IdentityStatusBadge.
 */
export default function VerificationBadge({ verified }) {
  return verified ? (
    <Badge variant="success">Email confirmed</Badge>
  ) : (
    <Badge variant="secondary">Email not confirmed</Badge>
  )
}
