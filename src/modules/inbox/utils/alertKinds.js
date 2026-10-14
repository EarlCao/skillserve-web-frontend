import { BadgeCheck, CircleAlert, Gavel, IdCard, Layers, LifeBuoy, Percent, ShieldAlert } from 'lucide-react'

/** How each kind of alert (AdminAlertNotification::KINDS) is shown. */
export const ALERT_KINDS = {
  provider_verification: { label: 'Provider verification', icon: BadgeCheck },
  identity_verification: { label: 'National ID', icon: IdCard },
  service_review: { label: 'Service approval', icon: Layers },
  report: { label: 'Report', icon: ShieldAlert },
  dispute: { label: 'Dispute', icon: Gavel },
  support_ticket: { label: 'Customer support', icon: LifeBuoy },
  commission_payment: { label: 'Commission payment', icon: Percent },
}

export function alertKind(kind) {
  return ALERT_KINDS[kind] ?? { label: 'Alert', icon: CircleAlert }
}
