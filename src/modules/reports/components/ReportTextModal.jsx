import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/forms/FormField'

/**
 * Generic single-textarea modal used for report lifecycle inputs: an optional
 * opening note (investigate), an investigation note (required), a resolution
 * note (required), or a rejection reason (required).
 *
 * Callers remount this modal per target (via a changing `key`), so the text
 * always starts fresh and no effect-driven reset is needed.
 */
export default function ReportTextModal({
  open,
  onClose,
  title,
  description,
  label = 'Note',
  placeholder = 'Enter your note…',
  required = true,
  confirmText = 'Confirm',
  variant = 'primary',
  loading = false,
  onConfirm,
}) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)

  const missing = required && !value.trim()

  const submit = () => {
    setTouched(true)

    if (missing) {
      return
    }

    onConfirm(value.trim())
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
            onClick={submit}
            loading={loading}
            disabled={loading || (touched && missing)}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <FormField
        label={label}
        required={required}
        error={touched && missing ? 'This field is required.' : undefined}
      >
        <textarea
          className={`textarea textarea-bordered w-full ${touched && missing ? 'textarea-error' : ''}`}
          rows={4}
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
      </FormField>
    </Modal>
  )
}