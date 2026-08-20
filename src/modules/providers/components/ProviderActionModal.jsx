import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Textarea from '../../../components/ui/Textarea'

/**
 * Modal for provider moderation actions (suspend / activate).
 * Suspend requires a reason; activate is a simple confirmation.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(reason?: string) => void} props.onConfirm
 * @param {boolean} props.loading
 * @param {'suspend' | 'activate'} props.action
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.confirmText
 * @param {'primary' | 'warning' | 'error'} props.variant
 */
export default function ProviderActionModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  action = 'suspend',
  title,
  description,
  confirmText,
  variant = 'primary',
}) {
  const [reason, setReason] = useState('')
  const needsReason = action === 'suspend'

  const handleSubmit = () => {
    if (needsReason && !reason.trim()) return
    onConfirm(needsReason ? reason.trim() : undefined)
    setReason('')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={handleSubmit}
            loading={loading}
            disabled={needsReason && !reason.trim()}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      {needsReason && (
        <div className="flex flex-col gap-2">
          <label htmlFor="action-reason" className="text-sm font-medium">
            Reason <span className="text-error">*</span>
          </label>
          <Textarea
            id="action-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason…"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-base-content/50">{reason.length}/500 characters</p>
        </div>
      )}
    </Modal>
  )
}
