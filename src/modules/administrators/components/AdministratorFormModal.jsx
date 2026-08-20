import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import FormField from '../../../components/forms/FormField'
import PasswordInput from '../../authentication/components/PasswordInput'
import { administratorCreateSchema, administratorUpdateSchema } from '../schemas/administratorSchema'
import { useCreateAdministrator, useUpdateAdministrator } from '../hooks/useAdministrators'

/**
 * Create / edit administrator modal.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object|null} props.administrator  the record being edited, or null to create
 * @param {string[]} [props.roles]  available role names for the select
 */
export default function AdministratorFormModal({ open, onClose, administrator, roles = [] }) {
  const isEditing = Boolean(administrator)

  // Super administrators are a fixed system role: role and status cannot be
  // changed (the backend enforces this too).
  const isSuperAdmin = (administrator?.roles ?? []).includes('super-admin')

  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(isEditing ? administratorUpdateSchema : administratorCreateSchema),
    defaultValues: isEditing
      ? {
          first_name: administrator.first_name ?? '',
          last_name: administrator.last_name ?? '',
          email: administrator.email ?? '',
          role: administrator.roles?.[0] ?? '',
          status: administrator.status ?? 'active',
        }
      : {
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          password_confirmation: '',
          role: '',
        },
  })

  // Re-seed the form whenever the target (or the modal) changes.
  useEffect(() => {
    if (!open) return

    reset(
      isEditing
        ? {
            first_name: administrator.first_name ?? '',
            last_name: administrator.last_name ?? '',
            email: administrator.email ?? '',
            role: administrator.roles?.[0] ?? '',
            status: administrator.status ?? 'active',
          }
        : {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: '',
          },
    )
  }, [open, administrator, isEditing, reset])

  const createMutation = useCreateAdministrator()
  const updateMutation = useUpdateAdministrator()
  const mutation = isEditing ? updateMutation : createMutation

  // Ask for confirmation before discarding unsaved edits.
  const requestClose = () => {
    if (isDirty && !mutation.isPending) {
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
    const options = {
      onSuccess: () => {
        // Clear the form so a subsequent open starts fresh (spec 15.2).
        if (!isEditing) {
          reset()
        }
        onClose()
      },
      onError: (error) => {
        // Map server-side field errors onto the form (422 envelope).
        if (error?.errors && typeof error.errors === 'object') {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field, { message: Array.isArray(messages) ? messages[0] : String(messages) })
          })
        }
      },
    }

    if (isEditing) {
      mutation.mutate({ id: administrator.id, ...values }, options)
    } else {
      mutation.mutate(values, options)
    }
  }

  return (
    <>
    <Modal
      open={open}
      onClose={requestClose}
      title={isEditing ? 'Edit administrator' : 'Add administrator'}
      description={
        isEditing
          ? 'Update the account details. Passwords are never changed here.'
          : 'Create a new administrator account. The account is active immediately.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={requestClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit(onSubmit)} loading={mutation.isPending}>
            {isEditing ? 'Save changes' : 'Create administrator'}
          </Button>
        </>
      }
    >
      <form id="administrator-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First name" required error={errors.first_name?.message}>
            <Controller
              control={control}
              name="first_name"
              render={({ field }) => <Input autoComplete="off" {...field} />}
            />
          </FormField>
          <FormField label="Last name" required error={errors.last_name?.message}>
            <Controller
              control={control}
              name="last_name"
              render={({ field }) => <Input autoComplete="off" {...field} />}
            />
          </FormField>
        </div>

        <FormField label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="off" {...register('email')} />
        </FormField>

        {!isEditing && (
          <>
            <FormField label="Password" required error={errors.password?.message} hint="At least 8 characters.">
              <Controller
                control={control}
                name="password"
                render={({ field }) => <PasswordInput autoComplete="new-password" {...field} />}
              />
            </FormField>
            <FormField label="Confirm password" required error={errors.password_confirmation?.message}>
              <Controller
                control={control}
                name="password_confirmation"
                render={({ field }) => <PasswordInput autoComplete="new-password" {...field} />}
              />
            </FormField>
          </>
        )}

        <FormField
          label="Role"
          required
          error={errors.role?.message}
          hint={isSuperAdmin ? 'Super administrator role is fixed and cannot be changed.' : undefined}
        >
          <select className="select select-bordered w-full" {...register('role')} disabled={isSuperAdmin}>
            <option value="">Select a role…</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </FormField>

        {isEditing && (
          <FormField
            label="Status"
            required
            error={errors.status?.message}
            hint={isSuperAdmin ? 'Super administrator status is fixed and cannot be changed.' : undefined}
          >
            <select className="select select-bordered w-full" {...register('status')} disabled={isSuperAdmin}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        )}
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
