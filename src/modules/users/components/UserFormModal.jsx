import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import FormField from '../../../components/forms/FormField'
import { userUpdateSchema } from '../schemas/userSchema'
import { useUpdateUser } from '../hooks/useUsers'

const toDefaults = (user) => ({
  first_name: user?.first_name ?? '',
  last_name: user?.last_name ?? '',
  email: user?.email ?? '',
  phone: user?.phone ?? '',
  address: user?.address ?? '',
  birthday: user?.birthday ?? '',
  user_type: user?.user_type ?? 'customer',
})

/**
 * Edit-user modal. Status and roles are changed through dedicated actions —
 * this form only touches the editable profile fields.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object|null} props.user  the record being edited
 */
export default function UserFormModal({ open, onClose, user }) {
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: toDefaults(user),
  })

  // Re-seed the form whenever the target (or the modal) changes.
  useEffect(() => {
    if (open) {
      reset(toDefaults(user))
    }
  }, [open, user, reset])

  const updateMutation = useUpdateUser()

  const requestClose = () => {
    if (isDirty && !updateMutation.isPending) {
      setConfirmDiscardOpen(true)

      return
    }

    onClose()
  }

  const confirmDiscard = () => {
    setConfirmDiscardOpen(false)
    onClose()
  }

  const onSubmit = (values) => {
    updateMutation.mutate(
      { id: user.id, ...values },
      {
        onSuccess: () => onClose(),
        onError: (error) => {
          // Map server-side field errors onto the form (422 envelope).
          if (error?.errors && typeof error.errors === 'object') {
            Object.entries(error.errors).forEach(([field, messages]) => {
              setError(field, { message: Array.isArray(messages) ? messages[0] : String(messages) })
            })
          }
        },
      },
    )
  }

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        title="Edit user"
        description="Update the account's profile information. Status and roles are changed through dedicated actions."
        footer={
          <>
            <Button variant="ghost" onClick={requestClose} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="user-form" loading={updateMutation.isPending}>
              Save changes
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First name" required error={errors.first_name?.message}>
              <Input autoComplete="off" {...register('first_name')} />
            </FormField>
            <FormField label="Last name" required error={errors.last_name?.message}>
              <Input autoComplete="off" {...register('last_name')} />
            </FormField>
          </div>

          <FormField label="Email" required error={errors.email?.message}>
            <Input type="email" autoComplete="off" {...register('email')} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Phone" error={errors.phone?.message}>
              <Input autoComplete="off" placeholder="+1 555 0100" {...register('phone')} />
            </FormField>
            <FormField label="Birthday" error={errors.birthday?.message}>
              <Input type="date" {...register('birthday')} />
            </FormField>
          </div>

          <FormField label="Address" error={errors.address?.message}>
            <textarea
              className={`textarea textarea-bordered w-full ${errors.address ? 'textarea-error' : ''}`}
              rows={2}
              placeholder="Street, city, postal code…"
              {...register('address')}
            />
          </FormField>

          <FormField label="User type" required error={errors.user_type?.message} hint="Only the customer type is available for now.">
            <select className="select select-bordered w-full" {...register('user_type')}>
              <option value="customer">Customer</option>
            </select>
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDiscardOpen}
        onCancel={() => setConfirmDiscardOpen(false)}
        onConfirm={confirmDiscard}
        title="Discard unsaved changes?"
        description="You have unsaved changes. They will be lost if you close this form."
        confirmText="Discard"
        variant="error"
      />
    </>
  )
}
