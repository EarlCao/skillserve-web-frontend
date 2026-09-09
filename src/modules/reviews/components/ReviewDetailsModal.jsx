import { format } from 'date-fns'
import { Star } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import ReviewStatusBadge from './ReviewStatusBadge'
import { useReview } from '../hooks/useReviews'
import ErrorState from '../../../components/common/ErrorState'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

/**
 * Modal that displays the full details of a review for admin inspection
 * and moderation actions.
 */
export default function ReviewDetailsModal({
  open,
  onClose,
  reviewId,
  onHide,
  onRemove,
}) {
  const { data, isLoading, isError, error, refetch } = useReview(reviewId)
  const review = data?.data

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review Details"
      description="Inspect review information before taking action."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {review && (
            <>
              {onHide && review.status !== 'removed' && (
                <Button
                  variant={review.status === 'hidden' ? 'success' : 'warning'}
                  onClick={() => onHide(review)}
                >
                  {review.status === 'hidden' ? 'Restore' : 'Hide'}
                </Button>
              )}
              {onRemove && review.status !== 'removed' && (
                <Button variant="error" onClick={() => onRemove(review)}>
                  Remove
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
        <ErrorState title="Could not load review details" message={error?.message} onRetry={refetch} />
      ) : review ? (
        <div className="flex flex-col gap-4">
          {/* Rating and status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < review.rating ? 'text-warning fill-warning' : 'text-base-content/20'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{review.rating}/5</span>
            </div>
            <ReviewStatusBadge status={review.status} />
          </div>

          {/* Comment */}
          {review.comment && (
            <div>
              <span className="text-sm font-medium">Comment</span>
              <p className="mt-1 text-sm text-base-content/80">{review.comment}</p>
            </div>
          )}

          {/* Reviewer */}
          {review.reviewer && (
            <div className="text-sm">
              <span className="font-medium">Reviewer</span>
              <p className="mt-1">
                {review.reviewer.name}
                {review.reviewer.email && (
                  <span className="text-base-content/60 ml-2">({review.reviewer.email})</span>
                )}
              </p>
            </div>
          )}

          {/* Provider */}
          {review.provider && (
            <div className="text-sm">
              <span className="font-medium">Provider</span>
              <p className="mt-1">
                {review.provider.business_name || review.provider.user?.name}
                {review.provider.user?.email && (
                  <span className="text-base-content/60 ml-2">({review.provider.user.email})</span>
                )}
              </p>
            </div>
          )}

          {/* Service */}
          {review.service && (
            <div className="text-sm">
              <span className="font-medium">Service</span>
              <p className="mt-1">{review.service.title}</p>
            </div>
          )}

          {/* Booking */}
          {review.booking && (
            <div className="text-sm">
              <span className="font-medium">Booking</span>
              <p className="mt-1">{review.booking.booking_number}</p>
            </div>
          )}

          {/* Report info */}
          {review.is_reported && (
            <div className="rounded-md bg-warning/10 p-3">
              <span className="text-sm font-medium text-warning">Reported</span>
              {review.report_reason && (
                <p className="mt-1 text-sm">{review.report_reason}</p>
              )}
            </div>
          )}

          {/* Moderation info */}
          {review.hidden_by && (
            <div className="text-sm">
              <span className="text-base-content/60">Hidden by: </span>
              <span className="font-medium">{review.hidden_by.name}</span>
              {review.hidden_at && (
                <span className="text-base-content/60 ml-2">({formatDateTime(review.hidden_at)})</span>
              )}
            </div>
          )}

          {review.removed_by && (
            <div className="text-sm">
              <span className="text-base-content/60">Removed by: </span>
              <span className="font-medium">{review.removed_by.name}</span>
              {review.removed_at && (
                <span className="text-base-content/60 ml-2">({formatDateTime(review.removed_at)})</span>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-base-200 pt-3 text-xs text-base-content/60">
            <p>Created: {formatDateTime(review.created_at)}</p>
            {review.updated_at && review.updated_at !== review.created_at && (
              <p>Updated: {formatDateTime(review.updated_at)}</p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
