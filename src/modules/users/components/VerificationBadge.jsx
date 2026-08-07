import Badge from '../../../components/ui/Badge'

/**
 * Email-verification status pill for platform users.
 */
export default function VerificationBadge({ verified }) {
  return verified ? (
    <Badge variant="success">Verified</Badge>
  ) : (
    <Badge variant="secondary">Unverified</Badge>
  )
}
