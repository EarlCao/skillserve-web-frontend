import { format } from 'date-fns'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import StatusBadge from './StatusBadge'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

/**
 * Read-only administrator details modal — the "View" action in the list.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object|null} props.administrator
 */
export default function AdministratorDetailsModal({ open, onClose, administrator }) {
  const rows = administrator
    ? [
    {
      label: 'First name',
      value: administrator.first_name,
    },
    {
      label: 'Last name',
      value: administrator.last_name,
    },
    {
      label: 'Email',
      value: administrator.email,
    },
    {
      label: 'Roles',
      value: administrator.roles?.length ? (
        <span className="flex flex-wrap gap-1">
          {administrator.roles.map((role) => (
            <Badge key={role} variant="secondary" size="sm">
              {role}
            </Badge>
          ))}
        </span>
      ) : (
        <span className="text-base-content/40">—</span>
      ),
    },
    {
      label: 'Status',
      value: <StatusBadge status={administrator.status} />,
    },
    {
      label: 'Last login',
      value: formatDateTime(administrator.last_login_at) ?? <span className="text-base-content/40">Never</span>,
    },
    {
      label: 'Created date',
      value: formatDateTime(administrator.created_at) ?? <span className="text-base-content/40">—</span>,
    },
    {
      label: 'Created by',
      value: administrator.created_by?.name ?? <span className="text-base-content/40">—</span>,
    },
    ]
    : []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={administrator?.name}
      description={administrator ? `Administrator #${administrator.id}` : undefined}
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <dl className="divide-y divide-base-200">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-sm text-base-content/60">{row.label}</dt>
            <dd className="text-right text-sm font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  )
}
