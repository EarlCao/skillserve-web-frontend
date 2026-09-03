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
import ServicesPage from '../modules/services/pages/ServicesPage'
import BookingsPage from '../modules/bookings/pages/BookingsPage'
import ReviewsPage from '../modules/reviews/pages/ReviewsPage'
import ProvidersPage from '../modules/providers/pages/ProvidersPage'
import ProviderProfilePage from '../modules/providers/pages/ProviderProfilePage'

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
                description="Welcome! Use the sidebar to manage administrators, users, providers, services, and bookings."
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
            element: <RequirePermission permissions={['manage users', 'view users', 'edit users', 'delete users', 'suspend users', 'activate users', 'ban users']} />,
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
            element: <RequirePermission permissions={['manage service categories', 'view service categories', 'create service categories', 'edit service categories', 'delete service categories']} />,
            children: [
              {
                path: 'service-categories',
                element: <ServiceCategoriesPage />,
              },
            ],
          },
          {
            // Service Management — requires the module permission.
            element: <RequirePermission permissions={['manage services', 'view services', 'create services', 'edit services', 'delete services', 'approve services', 'reject services', 'feature services']} />,
            children: [
              {
                path: 'services',
                element: <ServicesPage />,
              },
            ],
          },
          {
            // Booking Management — requires the module permission.
            element: <RequirePermission permissions={['manage bookings', 'view bookings', 'cancel bookings', 'manage booking disputes']} />,
            children: [
              {
                path: 'bookings',
                element: <BookingsPage />,
              },
            ],
          },
          {
            // Reviews and Ratings Management — requires the module permission.
            element: <RequirePermission permissions={['manage reviews', 'view reviews', 'edit reviews', 'delete reviews']} />,
            children: [
              {
                path: 'reviews',
                element: <ReviewsPage />,
              },
            ],
          },
          {
            // Provider Management — requires the module permission.
            element: <RequirePermission permissions={['manage providers', 'view providers', 'edit providers', 'delete providers', 'suspend providers', 'activate providers', 'verify providers', 'reject providers']} />,
            children: [
              {
                path: 'providers',
                element: <ProvidersPage />,
              },
              {
                path: 'providers/:providerId',
                element: <ProviderProfilePage />,
              },
            ],
          },
        ],
      },
    ],
  },
])
