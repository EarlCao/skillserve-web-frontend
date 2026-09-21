import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import AuthCard from '../components/AuthCard'
import { forgotPasswordSchema } from '../schemas/passwordResetSchema'
import { useForgotPassword } from '../hooks/usePasswordReset'

/**
 * Request a password reset link. Rendered inside AuthLayout under GuestOnly.
 */
export default function ForgotPasswordPage() {
  const forgot = useForgotPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  const backToLogin = (
    <Link to="/login" className="link link-hover text-sm">
      Back to sign in
    </Link>
  )

  if (forgot.isSuccess) {
    return (
      <AuthCard title="Check your email" footer={<div className="text-center">{backToLogin}</div>}>
        <p role="status" className="text-center text-sm text-base-content/70">
          If that address belongs to an administrator account, a reset link is on its way. It expires in
          60 minutes.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your admin email and we will send you a link to set a new password."
      footer={<div className="text-center">{backToLogin}</div>}
    >
      <form onSubmit={handleSubmit((values) => forgot.mutate(values.email))} noValidate className="flex flex-col gap-4">
        {forgot.isError && (
          <div role="alert" className="rounded-lg border border-error/30 bg-error/10 px-3 py-2.5 text-sm text-error">
            {forgot.error?.message ?? 'Unable to send the link. Please try again.'}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" size="lg" className="mt-2 w-full" loading={forgot.isPending}>
          Send reset link
        </Button>
      </form>
    </AuthCard>
  )
}
