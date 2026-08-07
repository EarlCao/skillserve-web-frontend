import Modal from '../ui/Modal'
import Button from '../ui/Button'

/**
 * Confirmation dialog for destructive or important actions.
 *
 * @param {boolean} open
 * @param {() => void} onCancel
 * @param {() => void} onConfirm
 * @param {boolean} [loading]
 * @param {string} [confirmText]
 * @param {'error' | 'primary'} [variant]
 */
export default function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  loading = false,
  title = 'Are you sure?',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'error',
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    />
  )
}
