import Badge from '../../../components/ui/Badge'

/**
 * Verification status pill for service providers.
 *
 * @param {object} props
 * @param {string} props.status - The verification status
 */
export default function VerificationStatusBadge({ status }) {
  const config = {
    verified: { variant: 'success', label: 'Verified' },
    pending: { variant: 'warning', label: 'Pending' },
    rejected: { variant: 'error', label: 'Rejected' },
    additional_info_required: { variant: 'accent', label: 'Info Required' },
    unverified: { variant: 'secondary', label: 'Unverified' },
  }

  const { variant, label } = config[status] ?? config.unverified

  return <Badge variant={variant}>{label}</Badge>
}
