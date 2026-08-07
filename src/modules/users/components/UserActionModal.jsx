import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/forms/FormField'

/**
 * Modal for moderation actions that require a reason (suspend / ban).
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.confirmText
 * @param {'error' | 'warning' | 'primary'} [props.variant]
 * @param {boolean} [props.loading]
 * @param {(reason: string) => void} props.onConfirm
 */
export default function UserActionModal({
  open,
  onClose,
  title,
  description,
  confirmText,
  variant = 'error',
  loading = false,
  onConfirm,
}) {
  // Callers remount this modal per target (via a changing `key`), so the
  // reason always starts fresh and no effect-driven reset is needed.
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  const missingReason = !reason.trim()

  const submit = () => {
    setTouched(true)

    if (missingReason) {
      return
    }

    onConfirm(reason.trim())
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
          <Button variant={variant} onClick={submit} loading={loading} disabled={loading || (touched && missingReason)}>
            {confirmText}
          </Button>
        </>
      }
    >
      <FormField
        label="Reason"
        required
        error={touched && missingReason ? 'Please provide a reason.' : undefined}
        hint="Recorded in the audit log."
      >
        <textarea
          className={`textarea textarea-bordered w-full ${touched && missingReason ? 'textarea-error' : ''}`}
          rows={3}
          placeholder="Why is this action being taken?"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          autoFocus
        />
      </FormField>
    </Modal>
  )
}
