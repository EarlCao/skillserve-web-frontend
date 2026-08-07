import { format } from 'date-fns'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'

const SUPER_ADMIN = 'super-admin'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

/**
 * Read-only role details modal — shows role info and its full permission set.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object|null} props.role
 */
export default function RoleDetailsModal({ open, onClose, role }) {
  const isSystem = role?.name === SUPER_ADMIN

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={role?.name}
      description={
        role && (
          <span className="flex items-center gap-2">
            <span>Role #{role.id}</span>
            {isSystem && <Badge variant="primary" size="sm">System</Badge>}
          </span>
        )
      }
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      {role && (
        <dl className="divide-y divide-base-200">
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-sm text-base-content/60">Description</dt>
            <dd className="text-right text-sm font-medium">
              {role.description ?? <span className="text-base-content/40">—</span>}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-sm text-base-content/60">Guard</dt>
            <dd className="text-sm font-medium">{role.guard_name}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-sm text-base-content/60">Created date</dt>
            <dd className="text-sm font-medium">
              {formatDateTime(role.created_at) ?? <span className="text-base-content/40">—</span>}
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 py-2.5">
            <dt className="text-sm text-base-content/60">Permissions ({role.permissions?.length ?? 0})</dt>
            <dd>
              {role.permissions?.length ? (
                <div className="flex flex-wrap justify-end gap-1">
                  {role.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" size="sm">
                      {permission}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-right text-sm text-base-content/40">No permissions assigned.</p>
              )}
            </dd>
          </div>
        </dl>
      )}
    </Modal>
  )
}
