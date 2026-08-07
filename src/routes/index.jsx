import { createBrowserRouter, Navigate } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import BlankLayout from '../layouts/BlankLayout'
import { GuestOnly, RequireAuth, RequirePermission } from '../modules/authentication/routes/guards'
import ChangePasswordPage from '../modules/authentication/pages/ChangePasswordPage'
import LoginPage from '../modules/authentication/pages/LoginPage'
import AdministratorsPage from '../modules/administrators/pages/AdministratorsPage'
import RolesPage from '../modules/administrators/pages/RolesPage'
import PermissionsPage from '../modules/administrators/pages/PermissionsPage'

/**
 * Application routing.
 *
 * - `/login` is guest-only (authenticated users are redirected to /admin).
 * - The admin area is protected by RequireAuth; feature routes are added to
 *   AdminLayout's children in later phases, optionally wrapped in
 *   RequireRole / RequirePermission.
 */
export const router = createBrowserRouter([
  {
    element: <BlankLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
    ],
  },
  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: (
              <EmptyState
                title="Dashboard"
                description="Admin module routes (administrators, providers, services, bookings) arrive in Phase 2+."
              />
            ),
          },
          {
            path: 'change-password',
            element: <ChangePasswordPage />,
          },
          {
            // Administrator Management — requires the module permission.
            element: <RequirePermission permissions={['manage administrators']} />,
            children: [
              {
                path: 'administrators',
                element: <AdministratorsPage />,
              },
              {
                path: 'roles',
                element: <RolesPage />,
              },
              {
                path: 'permissions',
                element: <PermissionsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
])
