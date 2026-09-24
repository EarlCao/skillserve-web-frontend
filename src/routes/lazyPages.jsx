import { lazy } from 'react'

/**
 * Admin pages load on demand so each module ships as its own chunk;
 * AdminLayout suspends on them with a page skeleton. The login page is not
 * here: it stays in the entry bundle for first paint.
 */
export const ChangePasswordPage = lazy(() => import('../modules/authentication/pages/ChangePasswordPage'))
export const AdministratorManagementPage = lazy(() => import('../modules/administrators/pages/AdministratorManagementPage'))
export const UsersPage = lazy(() => import('../modules/users/pages/UsersPage'))
export const UserProfilePage = lazy(() => import('../modules/users/pages/UserProfilePage'))
export const ServiceCategoriesPage = lazy(() => import('../modules/serviceCategories/pages/ServiceCategoriesPage'))
export const ServicesPage = lazy(() => import('../modules/services/pages/ServicesPage'))
export const BookingsPage = lazy(() => import('../modules/bookings/pages/BookingsPage'))
export const ReviewsPage = lazy(() => import('../modules/reviews/pages/ReviewsPage'))
export const ReportsPage = lazy(() => import('../modules/reports/pages/ReportsPage'))
export const DisputesPage = lazy(() => import('../modules/disputes/pages/DisputesPage'))
export const ProvidersPage = lazy(() => import('../modules/providers/pages/ProvidersPage'))
export const ProviderProfilePage = lazy(() => import('../modules/providers/pages/ProviderProfilePage'))
export const NotificationsPage = lazy(() => import('../modules/notifications/pages/NotificationsPage'))
export const DashboardPage = lazy(() => import('../modules/dashboard/pages/DashboardPage'))
export const AnalyticsPage = lazy(() => import('../modules/analytics/pages/AnalyticsPage'))
export const ProviderRecognitionPage = lazy(() => import('../modules/providerRecognition/pages/ProviderRecognitionPage'))
export const AuditLogsPage = lazy(() => import('../modules/audit/pages/AuditLogsPage'))
export const SettingsPage = lazy(() => import('../modules/settings/pages/SettingsPage'))
export const DataManagementPage = lazy(() => import('../modules/dataManagement/pages/DataManagementPage'))
export const SupportTicketsPage = lazy(() => import('../modules/support/pages/SupportTicketsPage'))
export const CommissionsPage = lazy(() => import('../modules/commissions/pages/CommissionsPage'))
export const IdentityVerificationsPage = lazy(() => import('../modules/identityVerifications/pages/IdentityVerificationsPage'))
