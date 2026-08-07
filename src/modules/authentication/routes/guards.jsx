import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import FullScreenLoader from '../../../components/common/FullScreenLoader'
import ErrorState from '../../../components/common/ErrorState'

/**
 * Route guards — reusable by every future module.
 *
 * Usage in a route definition:
 *   <Route element={<RequirePermission permissions={['manage bookings']} />}>
 *     <Route path="/bookings" element={<BookingsPage />} />
 *   </Route>
 */

function AccessDenied() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-base-100 p-4">
      <ErrorState
        title="Access denied"
        message="You do not have permission to view this page. Contact an administrator if you believe this is a mistake."
      />
    </div>
  )
}

/** Keeps unauthenticated visitors out of protected routes. */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

/** Keeps authenticated users out of guest-only routes (e.g. /login). */
export function GuestOnly() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />

  if (isAuthenticated) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

/** Restricts a route to users holding at least one of the given roles. */
export function RequireRole({ roles }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const userRoles = user?.roles ?? []
  const allowed = roles?.some((role) => userRoles.includes(role))

  return allowed ? <Outlet /> : <AccessDenied />
}

/** Restricts a route to users holding at least one of the given permissions. */
export function RequirePermission({ permissions }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const userPermissions = user?.permissions ?? []
  const allowed = permissions?.some((permission) => userPermissions.includes(permission))

  return allowed ? <Outlet /> : <AccessDenied />
}
