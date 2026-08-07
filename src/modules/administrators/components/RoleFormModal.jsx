import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/forms/FormField'
import { roleSchema } from '../schemas/roleSchema'
import { useCreateRole, useUpdateRole } from '../hooks/useRoles'

/**
 * Create / edit role modal.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object|null} props.role  the record being edited, or null to create
 */
export default function RoleFormModal({ open, onClose, role }) {
  const isEditing = Boolean(role)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (!open) return

    reset({
      name: role?.name ?? '',
      description: role?.description ?? '',
    })
  }, [open, role, reset])

  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const mutation = isEditing ? updateMutation : createMutation

  const onSubmit = (values) => {
    const options = {
      onSuccess: () => onClose(),
      onError: (error) => {
        if (error?.errors && typeof error.errors === 'object') {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field, { message: Array.isArray(messages) ? messages[0] : String(messages) })
          })
        }
      },
    }

    if (isEditing) {
      mutation.mutate({ id: role.id, ...values }, options)
    } else {
      mutation.mutate(values, options)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit role' : 'Add role'}
      description="Role names use lowercase letters, numbers and hyphens (e.g. reports-manager)."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="role-form" loading={mutation.isPending}>
            {isEditing ? 'Save changes' : 'Create role'}
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField label="Role name" required error={errors.name?.message}>
          <Input autoComplete="off" placeholder="reports-manager" {...register('name')} />
        </FormField>

        <FormField label="Description" error={errors.description?.message} hint="Optional — what this role is for.">
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="Manages operational reports."
            {...register('description')}
          />
        </FormField>
      </form>
    </Modal>
  )
}
