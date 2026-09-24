import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import BlankLayout from '../layouts/BlankLayout'
import { GuestOnly, RequireAuth, RequirePermission } from '../modules/authentication/routes/guards'
import LoginPage from '../modules/authentication/pages/LoginPage'
import ForgotPasswordPage from '../modules/authentication/pages/ForgotPasswordPage'
import ResetPasswordPage from '../modules/authentication/pages/ResetPasswordPage'
import {
  ChangePasswordPage,
  AdministratorManagementPage,
  UsersPage,
  UserProfilePage,
  ServiceCategoriesPage,
  ServicesPage,
  BookingsPage,
  ReviewsPage,
  ReportsPage,
  DisputesPage,
  ProvidersPage,
  ProviderProfilePage,
  NotificationsPage,
  DashboardPage,
  AnalyticsPage,
  ProviderRecognitionPage,
  AuditLogsPage,
  SettingsPage,
  DataManagementPage,
  SupportTicketsPage,
  CommissionsPage,
  IdentityVerificationsPage,
} from './lazyPages'

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
          {
            path: '/forgot-password',
            element: <ForgotPasswordPage />,
          },
          {
            path: '/reset-password',
            element: <ResetPasswordPage />,
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
            element: <RequirePermission permissions={['view dashboard']} />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
            ],
          },
          {
            path: 'change-password',
            element: <ChangePasswordPage />,
          },
          {
            // Administrator Management — requires the module permission.
            element: <RequirePermission permissions={['manage administrators', 'view administrators', 'create administrators', 'edit administrators']} />,
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
            // Dispute Management — reuses booking permissions and data.
            element: <RequirePermission permissions={['manage bookings', 'view bookings', 'manage booking disputes']} />,
            children: [
              {
                path: 'disputes',
                element: <DisputesPage />,
              },
            ],
          },
          {
            // Commission Management — configuring rates and settling what
            // providers owe.
            element: <RequirePermission permissions={['manage commissions', 'view commissions', 'settle commissions']} />,
            children: [
              {
                path: 'commissions',
                element: <CommissionsPage />,
              },
            ],
          },
          {
            // Identity Verification — reviewing National ID submissions.
            element: <RequirePermission permissions={['view identity verifications', 'verify identities', 'reject identities']} />,
            children: [
              {
                path: 'identity-verifications',
                element: <IdentityVerificationsPage />,
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
            // Reports and Moderation — requires the module permission.
            element: <RequirePermission permissions={['manage reports', 'view reports', 'investigate reports', 'resolve reports', 'manage moderation']} />,
            children: [
              {
                path: 'reports',
                element: <ReportsPage />,
              },
            ],
          },
          {
            // Notifications and Announcements — requires the module permission.
            element: <RequirePermission permissions={['view notifications', 'send announcements', 'target notifications', 'schedule announcements']} />,
            children: [
              {
                path: 'notifications',
                element: <NotificationsPage />,
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
          {
            // Provider Recognition — requires the module permission.
            element: <RequirePermission permissions={['view provider recognition', 'manage provider badges', 'assign provider badges', 'manage featured providers', 'view top rated providers']} />,
            children: [
              {
                path: 'provider-recognition',
                element: <ProviderRecognitionPage />,
              },
            ],
          },
          {
            // Reports and Analytics — requires the module permission.
            element: <RequirePermission permissions={['view analytics', 'export analytics']} />,
            children: [
              {
                path: 'analytics',
                element: <AnalyticsPage />,
              },
            ],
          },
          {
            // Security and Audit Logs — requires the module permission.
            element: <RequirePermission permissions={['view audit logs', 'view login activity', 'monitor security events']} />,
            children: [
              {
                path: 'audit-logs',
                element: <AuditLogsPage />,
              },
            ],
          },
          {
            element: <RequirePermission permissions={['manage settings']} />,
            children: [{ path: 'settings', element: <SettingsPage /> }],
          },
          {
            element: <RequirePermission permissions={['view support', 'manage support', 'assign support tickets', 'respond to support tickets', 'resolve support tickets']} />,
            children: [{ path: 'support', element: <SupportTicketsPage /> }],
          },
          {
            element: <RequirePermission permissions={['manage data', 'export system data', 'archive records', 'restore archived records', 'restore deleted records', 'manage deleted records']} />,
            children: [{ path: 'data-management', element: <DataManagementPage /> }],
          },
        ],
      },
    ],
  },
])
