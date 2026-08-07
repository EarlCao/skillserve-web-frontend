import AuthCard from '../components/AuthCard'
import LoginForm from '../components/LoginForm'

/**
 * Login page — rendered inside AuthLayout under the GuestOnly guard.
 */
export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue to the admin panel."
    >
      <LoginForm />
    </AuthCard>
  )
}
