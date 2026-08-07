import ChangePasswordForm from '../components/ChangePasswordForm'

/**
 * Self-service password page, rendered inside AdminLayout (protected).
 */
export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-xl">
      <ChangePasswordForm />
    </div>
  )
}
