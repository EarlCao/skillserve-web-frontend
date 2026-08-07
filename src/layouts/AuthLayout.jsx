import { Outlet } from 'react-router-dom'

/**
 * Shared authentication layout: centered shell on a neutral background.
 * Auth pages (login, ...) render their own branded AuthCard via <Outlet />.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
