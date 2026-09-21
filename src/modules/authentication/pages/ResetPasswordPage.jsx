import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import AuthCard from '../components/AuthCard'
import PasswordInput from '../components/PasswordInput'
import { resetPasswordSchema } from '../schemas/passwordResetSchema'
import { useResetPassword } from '../hooks/usePasswordReset'

/**
 * Set a new password from the emailed link (`?token=…&email=…`).
 * Rendered inside AuthLayout under GuestOnly.
 */
export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''
  const navigate = useNavigate()
  const reset = useResetPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  })

  const requestNewLink = (
    <Link to="/forgot-password" className="link link-hover text-sm">
      Request a new link
    </Link>
  )

  if (!token || !email) {
    return (
      <AuthCard title="Invalid reset link" footer={<div className="text-center">{requestNewLink}</div>}>
        <p className="text-center text-sm text-base-content/70">
          This link is incomplete. Open the link from the email again, or request a new one.
        </p>
      </AuthCard>
    )
  }

  const onSubmit = (values) => {
    reset.mutate(
      { token, email, ...values },
      {
        onSuccess: () => {
          toast.success('Password reset. Sign in with your new password.')
          navigate('/login', { replace: true })
        },
      },
    )
  }

  return (
    <AuthCard
      title="Set a new password"
      description={`For ${email}. You will be signed out of every other session.`}
      footer={<div className="text-center">{requestNewLink}</div>}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {reset.isError && (
          <div role="alert" className="rounded-lg border border-error/30 bg-error/10 px-3 py-2.5 text-sm text-error">
            {reset.error?.message ?? 'Unable to reset the password. Please try again.'}
          </div>
        )}
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
        <Button type="submit" size="lg" className="mt-2 w-full" loading={reset.isPending}>
          Reset password
        </Button>
      </form>
    </AuthCard>
  )
}
