import { format } from 'date-fns'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Skeleton from '../../../components/ui/Skeleton'
import ServiceStatusBadge from './ServiceStatusBadge'
import ApprovalStatusBadge from './ApprovalStatusBadge'
import { useService } from '../hooks/useServices'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)
const formatCurrency = (value, currency = 'USD') =>
  value != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value) : '—'

/**
 * Modal that displays the full details of a service, used for review
 * and performing administrative actions.
 */
export default function ServiceDetailsModal({
  open,
  onClose,
  serviceId,
  onApprove,
  onReject,
  onHide,
  onFeature,
  onDelete,
  onEdit,
}) {
  const { data, isLoading, isError, error } = useService(serviceId)
  const service = data?.data

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Service Details"
      description="Review service information before taking action."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {service && (
            <>
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(service)}>
                  Edit
                </Button>
              )}
              {service.approval_status === 'pending' && onApprove && (
                <Button variant="success" onClick={() => onApprove(service)}>
                  Approve
                </Button>
              )}
              {service.approval_status === 'pending' && onReject && (
                <Button variant="error" onClick={() => onReject(service)}>
                  Reject
                </Button>
              )}
              {onHide && (
                <Button
                  variant={service.is_hidden ? 'success' : 'warning'}
                  onClick={() => onHide(service)}
                >
                  {service.is_hidden ? 'Unhide' : 'Hide'}
                </Button>
              )}
              {onFeature && (
                <Button
                  variant={service.is_featured ? 'outline' : 'primary'}
                  onClick={() => onFeature(service)}
                >
                  {service.is_featured ? 'Unfeature' : 'Feature'}
                </Button>
              )}
              {onDelete && (
                <Button variant="error" onClick={() => onDelete(service)}>
                  Delete
                </Button>
              )}
            </>
          )}
        </>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-base-200" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center text-error">
          <p>{error?.message ?? 'Failed to load service details.'}</p>
        </div>
      ) : service ? (
        <div className="flex flex-col gap-4">
          {/* Title and status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold">{service.title}</h4>
              <p className="text-sm text-base-content/60">
                ID: #{service.id}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <ApprovalStatusBadge status={service.approval_status} />
              <span className="text-xs text-base-content/60">
                {service.is_hidden ? 'Hidden' : 'Visible'}
                {service.is_featured ? ' • Featured' : ''}
              </span>
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <div>
              <span className="text-sm font-medium">Description</span>
              <p className="mt-1 text-sm text-base-content/80">{service.description}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-base-content/60">Category</span>
              <p className="font-medium">{service.category?.name ?? '—'}</p>
            </div>
            <div>
              <span className="text-base-content/60">Subcategory</span>
              <p className="font-medium">{service.subcategory?.name ?? '—'}</p>
            </div>
            <div>
              <span className="text-base-content/60">Price</span>
              <p className="font-medium">
                {formatCurrency(service.price, service.currency)}
                {service.price_type !== 'fixed' && (
                  <span className="text-xs text-base-content/60 ml-1">({service.price_type})</span>
                )}
              </p>
            </div>
            <div>
              <span className="text-base-content/60">Duration</span>
              <p className="font-medium">{service.duration ?? '—'}</p>
            </div>
            <div>
              <span className="text-base-content/60">Location</span>
              <p className="font-medium">{service.location ?? '—'}</p>
            </div>
            <div>
              <span className="text-base-content/60">Status</span>
              <p className="font-medium capitalize">{service.status}</p>
            </div>
          </div>

          {/* Provider */}
          {service.provider && (
            <div className="border-t border-base-200 pt-3">
              <span className="text-sm font-medium">Provider</span>
              <p className="mt-1 text-sm">
                {service.provider.business_name || service.provider.user?.name}
                {service.provider.user?.email && (
                  <span className="text-base-content/60 ml-2">({service.provider.user.email})</span>
                )}
              </p>
            </div>
          )}

          {/* Rejection reason */}
          {service.rejection_reason && (
            <div className="rounded-md bg-error/10 p-3">
              <span className="text-sm font-medium text-error">Rejection Reason</span>
              <p className="mt-1 text-sm">{service.rejection_reason}</p>
            </div>
          )}

          {/* Approval info */}
          {service.approved_by && (
            <div className="text-sm">
              <span className="text-base-content/60">Approved by: </span>
              <span className="font-medium">{service.approved_by.name}</span>
              {service.approved_at && (
                <span className="text-base-content/60 ml-2">({formatDateTime(service.approved_at)})</span>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-base-200 pt-3 text-xs text-base-content/60">
            <p>Created: {formatDateTime(service.created_at)}</p>
            {service.updated_at && service.updated_at !== service.created_at && (
              <p>Updated: {formatDateTime(service.updated_at)}</p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
