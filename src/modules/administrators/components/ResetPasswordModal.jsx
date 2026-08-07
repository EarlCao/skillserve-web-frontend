import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/forms/FormField'
import PasswordInput from '../../authentication/components/PasswordInput'
import { useResetAdministratorPassword } from '../hooks/useAdministrators'

/**
 * Mirrors ResetAdministratorPasswordRequest (password min:8 + confirmed).
 */
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'New password must be at least 8 characters.'),
    password_confirmation: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
  })

/**
 * Admin-initiated password reset. All of the target's existing sessions are
 * revoked once the new password is saved.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object|null} props.administrator
 */
export default function ResetPasswordModal({ open, onClose, administrator }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  })

  const mutation = useResetAdministratorPassword()

  // Fresh fields every time the modal opens.
  useEffect(() => {
    if (open) {
      reset({ password: '', password_confirmation: '' })
    }
  }, [open, reset])

  const onSubmit = (values) => {
    mutation.mutate(
      { id: administrator.id, ...values },
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
    <Modal
      open={open}
      onClose={onClose}
      title="Reset password"
      description={
        administrator
          ? `Set a new password for ${administrator.name}. All their existing sessions will be ended.`
          : undefined
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="reset-password-form" loading={mutation.isPending}>
            Reset password
          </Button>
        </>
      }
    >
      <form
        id="reset-password-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField label="New password" required error={errors.password?.message} hint="At least 8 characters.">
          <PasswordInput autoComplete="new-password" {...register('password')} />
        </FormField>
        <FormField label="Confirm new password" required error={errors.password_confirmation?.message}>
          <PasswordInput autoComplete="new-password" {...register('password_confirmation')} />
        </FormField>
      </form>
    </Modal>
  )
}
