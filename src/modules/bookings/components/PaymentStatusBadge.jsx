import Badge from '../../../components/ui/Badge'

const PAYMENT_STYLES = {
  unpaid: { variant: 'neutral', label: 'Unpaid' },
  paid: { variant: 'success', label: 'Paid' },
  refunded: { variant: 'warning', label: 'Refunded' },
  partially_refunded: { variant: 'info', label: 'Partially Refunded' },
}

/**
 * Badge that shows a booking's payment status.
 */
export default function PaymentStatusBadge({ status }) {
  const { variant, label } = PAYMENT_STYLES[status] ?? { variant: 'neutral', label: status }

  return <Badge variant={variant} size="sm">{label}</Badge>
}
