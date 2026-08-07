import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { changePasswordSchema } from '../schemas/changePasswordSchema'
import { useChangePassword } from '../hooks/useChangePassword'
import PasswordInput from './PasswordInput'

/**
 * Change-password form (self-service). Clears the fields after a success so
 * a second change is easy.
 */
export default function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })

  const changePassword = useChangePassword()

  const onSubmit = (values) => {
    changePassword.mutate(values, {
      onSuccess: () => reset(),
    })
  }

  const errorMessage = changePassword.isError ? changePassword.error?.message : null

  return (
    <Card
      title="Change password"
      description="Update the password used to sign in to your account."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-error/30 bg-error/10 px-3 py-2.5 text-sm text-error"
          >
            {errorMessage}
          </div>
        )}

        <PasswordInput
          label="Current password"
          autoComplete="current-password"
          error={errors.current_password?.message}
          {...register('current_password')}
        />

        <PasswordInput
          label="New password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />

        <div className="card-actions mt-2 justify-end">
          <Button
            type="submit"
            loading={changePassword.isPending}
            disabled={changePassword.isPending}
          >
            Update password
          </Button>
        </div>
      </form>
    </Card>
  )
}
