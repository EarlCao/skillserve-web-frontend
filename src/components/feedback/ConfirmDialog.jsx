import { useId, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Textarea from '../ui/Textarea'

const MIN_REASON = 3
const MAX_REASON = 1000

/**
 * Confirmation dialog for destructive or important actions.
 *
 * Pass `reason` to ask the administrator why: the text goes to the person the
 * action affects. `required` reasons (actions against someone — delete, hide,
 * remove) block the confirm button until written; optional ones are a note
 * (actions in someone's favour — reactivate, restore).
 *
 * @param {boolean} open
 * @param {() => void} onCancel
 * @param {(reason?: string | null) => void} onConfirm - receives the trimmed reason (null when an optional one is left empty)
 * @param {boolean} [loading]
 * @param {string} [confirmText]
 * @param {'error' | 'primary' | 'warning'} [variant]
 * @param {{ label?: string, required?: boolean, placeholder?: string, hint?: string }} [reason]
 */
export default function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  loading = false,
  title = 'Are you sure?',
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'error',
  reason,
}) {
  const fieldId = useId()
  const [text, setText] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  // Start every opening with an empty reason, without an effect.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setText('')
  }

  const trimmed = text.trim()
  const missing = Boolean(reason?.required) && trimmed.length < MIN_REASON

  const confirm = () => {
    if (!reason) {
      onConfirm()
      return
    }
    if (missing) return
    onConfirm(trimmed || null)
  }

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
          <Button variant={variant} onClick={confirm} loading={loading} disabled={missing}>
            {confirmText}
          </Button>
        </>
      }
    >
      {children}
      {reason && (
        <div className="flex flex-col gap-2">
          <label htmlFor={fieldId} className="text-sm font-medium">
            {reason.label ?? (reason.required ? 'Reason' : 'Note (optional)')}
            {reason.required && <span className="text-error"> *</span>}
          </label>
          <Textarea
            id={fieldId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={reason.placeholder ?? (reason.required ? 'Explain why…' : 'Add a note…')}
            rows={3}
            maxLength={MAX_REASON}
            aria-describedby={`${fieldId}-hint`}
            aria-required={reason.required || undefined}
          />
          <p id={`${fieldId}-hint`} className="text-xs text-base-content/60">
            {reason.hint ?? 'The person affected is told what you write.'}{' '}
            <span className="text-base-content/40">
              {text.length}/{MAX_REASON}
            </span>
          </p>
        </div>
      )}
    </Modal>
  )
}
