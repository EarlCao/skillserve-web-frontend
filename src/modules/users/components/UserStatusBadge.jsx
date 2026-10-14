import { format } from 'date-fns'
import Badge from '../../../components/ui/Badge'

/**
 * Account status pill for platform users. When a ban has a lift date, the
 * Banned badge carries a tooltip showing when it lifts automatically.
 *
 * @param {object} props
 * @param {string} props.status
 * @param {string} [props.bannedUntil]  ISO date-time; null = permanent ban
 */
export default function UserStatusBadge({ status, bannedUntil }) {
  if (status === 'suspended') {
    return <Badge variant="warning" className="badge-soft">Suspended</Badge>
  }

  if (status === 'banned') {
    return (
      <Badge
        variant="error"
        className="badge-soft"
        title={
          bannedUntil
            ? `Banned until ${format(new Date(bannedUntil), 'MMM d, yyyy')}`
            : 'Permanently banned'
        }
      >
        Banned
      </Badge>
    )
  }

  return <Badge variant="success" className="badge-soft">Active</Badge>
}
