import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { loginSchema } from '../schemas/loginSchema'
import { useLogin } from '../hooks/useLogin'
import PasswordInput from './PasswordInput'

/**
 * Login form. Validates client-side with zod, submits through the React
 * Query login mutation, and surfaces server errors consistently.
 */
export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const loginMutation = useLogin()

  const onSubmit = (values) => {
    loginMutation.mutate(values)
  }

  const errorMessage = loginMutation.isError ? loginMutation.error?.message : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-error/30 bg-error/10 px-3 py-2.5 text-sm text-error"
        >
          {errorMessage}
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

      <PasswordInput
        label="Password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full"
        loading={loginMutation.isPending}
        disabled={loginMutation.isPending}
      >
        Sign in
      </Button>
    </form>
  )
}
