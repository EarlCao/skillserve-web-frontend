import { createBrowserRouter, Navigate } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import BlankLayout from '../layouts/BlankLayout'
import { GuestOnly, RequireAuth, RequirePermission } from '../modules/authentication/routes/guards'
import ChangePasswordPage from '../modules/authentication/pages/ChangePasswordPage'
import LoginPage from '../modules/authentication/pages/LoginPage'
import AdministratorManagementPage from '../modules/administrators/pages/AdministratorManagementPage'
import UsersPage from '../modules/users/pages/UsersPage'
import UserProfilePage from '../modules/users/pages/UserProfilePage'
import ServiceCategoriesPage from '../modules/serviceCategories/pages/ServiceCategoriesPage'

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
                description="Welcome! Use the sidebar to manage administrators, and providers, services and bookings modules will arrive in later phases."
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
                element: <AdministratorManagementPage />,
              },
              // Pre-consolidation URLs redirect to the matching tab.
              {
                path: 'roles',
                element: <Navigate to="/admin/administrators?tab=roles" replace />,
              },
              {
                path: 'permissions',
                element: <Navigate to="/admin/administrators?tab=permissions" replace />,
              },
            ],
          },
          {
            // User Management — requires the module permission.
            element: <RequirePermission permissions={['manage users']} />,
            children: [
              {
                path: 'users',
                element: <UsersPage />,
              },
              {
                path: 'users/:userId',
                element: <UserProfilePage />,
              },
            ],
          },
          {
            // Service Category Management — requires the module permission.
            element: <RequirePermission permissions={['manage service categories']} />,
            children: [
              {
                path: 'service-categories',
                element: <ServiceCategoriesPage />,
              },
            ],
          },
        ],
      },
    ],
  },
])
