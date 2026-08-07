import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
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

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
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

  const onSubmit = (values) => {
    const options = {
      onSuccess: () => onClose(),
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
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit administrator' : 'Add administrator'}
      description={
        isEditing
          ? 'Update the account details. Passwords are never changed here.'
          : 'Create a new administrator account. The account is active immediately.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="administrator-form" loading={mutation.isPending}>
            {isEditing ? 'Save changes' : 'Create administrator'}
          </Button>
        </>
      }
    >
      <form id="administrator-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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

        {!isEditing && (
          <>
            <FormField label="Password" required error={errors.password?.message} hint="At least 8 characters.">
              <PasswordInput autoComplete="new-password" {...register('password')} />
            </FormField>
            <FormField label="Confirm password" required error={errors.password_confirmation?.message}>
              <PasswordInput autoComplete="new-password" {...register('password_confirmation')} />
            </FormField>
          </>
        )}

        <FormField label="Role" required error={errors.role?.message}>
          <select className="select select-bordered w-full" {...register('role')}>
            <option value="">Select a role…</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </FormField>

        {isEditing && (
          <FormField label="Status" required error={errors.status?.message}>
            <select className="select select-bordered w-full" {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        )}
      </form>
    </Modal>
  )
}
