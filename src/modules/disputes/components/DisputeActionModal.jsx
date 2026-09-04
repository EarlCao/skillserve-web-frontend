import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/forms/FormField'

const ACTION_META = {
  investigate: { title: 'Investigate Dispute', button: 'Investigate', variant: 'primary', required: false, label: 'Opening note' },
  note: { title: 'Add Dispute Note', button: 'Add note', variant: 'secondary', required: true, label: 'Internal note' },
  resolve: { title: 'Resolve Dispute', button: 'Resolve', variant: 'success', required: true, label: 'Final decision' },
  reject: { title: 'Reject Dispute', button: 'Reject', variant: 'error', required: false, label: 'Reason' },
  close: { title: 'Close Dispute', button: 'Close', variant: 'neutral', required: false, label: 'Closing note' },
}

export default function DisputeActionModal({ open, onClose, action, loading, onConfirm }) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const meta = ACTION_META[action] ?? ACTION_META.note

  const missing = meta.required && !value.trim()

  const submit = () => {
    setTouched(true)
    if (missing) return
    onConfirm(value.trim())
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={meta.title}
      description="Record the administrative action in the dispute history."
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={meta.variant} onClick={submit} loading={loading} disabled={loading || (touched && missing)}>
            {meta.button}
          </Button>
        </>
      )}
    >
      <FormField
        label={meta.label}
        required={meta.required}
        hint={action === 'close' ? 'Optional. The dispute must already be resolved.' : undefined}
        error={touched && missing ? 'This field is required.' : undefined}
      >
        <textarea
          className={`textarea textarea-bordered w-full ${touched && missing ? 'textarea-error' : ''}`}
          rows={4}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={`Enter ${meta.label.toLowerCase()}…`}
          autoFocus
        />
      </FormField>
    </Modal>
  )
}
