import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Archive, Award, Bell, BarChart3, CalendarDays, ClipboardList, FolderTree, FileText, Gavel, KeyRound, LayoutDashboard, LifeBuoy, LogOut, Menu, Moon, Settings, ShieldAlert, Star, Sun, UserCheck, Users, UsersRound } from 'lucide-react'
import { APP_NAME } from '../constants'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useLogout } from '../modules/authentication/hooks/useLogout'
import { useDisclosure } from '../hooks/useDisclosure'
import ConfirmDialog from '../components/feedback/ConfirmDialog'
import OfflineBanner from '../components/common/OfflineBanner'
import { hasAnyCapability } from '../utils/permissions'

/**
 * Shared admin layout: responsive drawer sidebar + topbar + content outlet.
 *
 * - Mobile (< lg): the sidebar is an overlay drawer opened by the topbar
 *   hamburger.
 * - Desktop (>= lg): the sidebar is always visible and can be collapsed to an
 *   icon rail by the topbar hamburger.
 */
export default function AdminLayout() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const logoutMutation = useLogout()
  const logoutDisclosure = useDisclosure()
  const [collapsed, setCollapsed] = useState(false)

  const initials = (user?.name ?? 'A')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const canManageAdministrators = hasAnyCapability(user, ['manage administrators', 'view administrators', 'create administrators', 'edit administrators'])
  const canManageUsers = hasAnyCapability(user, ['manage users', 'view users', 'edit users', 'delete users', 'suspend users', 'activate users', 'ban users'])
  const canManageServiceCategories = hasAnyCapability(user, ['manage service categories', 'view service categories', 'create service categories', 'edit service categories', 'delete service categories'])
  const canManageProviders = hasAnyCapability(user, ['manage providers', 'view providers', 'edit providers', 'delete providers', 'suspend providers', 'activate providers', 'verify providers', 'reject providers'])
  const canManageServices = hasAnyCapability(user, ['manage services', 'view services', 'create services', 'edit services', 'delete services', 'approve services', 'reject services', 'feature services'])
  const canManageBookings = hasAnyCapability(user, ['manage bookings', 'view bookings', 'cancel bookings', 'manage booking disputes'])
  const canManageDisputes = hasAnyCapability(user, ['manage bookings', 'view bookings', 'manage booking disputes'])
  const canManageReviews = hasAnyCapability(user, ['manage reviews', 'view reviews', 'edit reviews', 'delete reviews'])
  const canManageReports = hasAnyCapability(user, ['manage reports', 'view reports', 'investigate reports', 'resolve reports', 'manage moderation'])
  const canManageNotifications = hasAnyCapability(user, ['view notifications', 'send announcements', 'target notifications', 'schedule announcements'])
  const canManageAnalytics = hasAnyCapability(user, ['view analytics', 'export analytics'])
  const canManageRecognition = hasAnyCapability(user, ['view provider recognition', 'manage provider badges', 'assign provider badges', 'manage featured providers', 'view top rated providers'])
  const canViewAudit = hasAnyCapability(user, ['view audit logs', 'view login activity', 'monitor security events'])
  const canManageSettings = hasAnyCapability(user, ['manage settings'])
  const canManageData = hasAnyCapability(user, ['manage data', 'export system data', 'archive records', 'restore archived records', 'restore deleted records', 'manage deleted records'])
  const canManageSupport = hasAnyCapability(user, ['view support', 'manage support', 'assign support tickets', 'respond to support tickets', 'resolve support tickets'])

  // Active nav item uses the primary color (not daisyUI's near-black
  // base-content that `menu-active` applies). When collapsed, icons center.
  const navLinkClass = ({ isActive }) => {
    const base = collapsed ? 'lg:justify-center lg:px-0' : ''

    return isActive ? `bg-primary/10 text-primary font-semibold ${base}`.trim() : base.trim() || undefined
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      {/* Content */}
      <div className="drawer-content flex min-h-svh flex-col">
        <OfflineBanner />
        <header className="navbar sticky top-0 z-30 border-b border-base-300 bg-base-100">
          {/* Mobile: open the overlay drawer. */}
          <div className="flex-none lg:hidden">
            <label htmlFor="app-drawer" aria-label="Open menu" className="btn btn-square btn-ghost">
              <Menu className="size-6" />
            </label>
          </div>

          {/* Desktop: collapse / expand the sidebar. */}
          <div className="hidden flex-none lg:block">
            <button
              type="button"
              className="btn btn-square btn-ghost"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              aria-controls="admin-sidebar"
            >
              <Menu className="size-6" />
            </button>
          </div>

          <div className="flex-1">
            <h1 className="text-lg font-semibold">{APP_NAME} Admin</h1>
          </div>

          <button
            type="button"
            className="btn btn-circle btn-ghost"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <div className="dropdown dropdown-end ml-1">
            <button type="button" tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="w-10 rounded-full bg-primary text-primary-content">
                <span className="text-sm font-semibold">{initials}</span>
              </div>
            </button>
            <ul
              tabIndex={0}
              className="menu dropdown-content z-50 mt-2 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
            >
              <li className="menu-title">
                <div className="flex flex-col">
                  <span className="truncate font-semibold text-base-content">{user?.name}</span>
                  <span className="truncate text-xs font-normal text-base-content/60">{user?.email}</span>
                </div>
              </li>
              <li>
                <Link to="/admin/change-password">
                  <KeyRound className="size-4" />
                  Change password
                </Link>
              </li>
              <li>
                <button type="button" onClick={logoutDisclosure.open} className="text-error">
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label htmlFor="app-drawer" aria-label="Close menu" className="drawer-overlay" />
        <aside
          id="admin-sidebar"
          className={`menu min-h-full w-64 gap-2 border-r border-base-300 bg-base-100 p-4 transition-[width] duration-300 ${
            collapsed ? 'lg:w-20' : 'lg:w-64'
          }`}
        >
          <div
            className={`mb-4 flex items-center gap-2 text-xl font-bold ${
              collapsed ? 'lg:justify-center lg:px-0' : 'px-2'
            }`}
          >
            <LayoutDashboard className="size-6 shrink-0 text-primary" />
            <span className={collapsed ? 'lg:hidden' : undefined}>{APP_NAME}</span>
          </div>

          <li className={`menu-title ${collapsed ? 'lg:hidden' : undefined}`}>Main</li>
          <li>
            {(user?.permissions?.includes('view dashboard') || user?.roles?.includes('super-admin')) && (
            <NavLink to="/admin" end className={navLinkClass} title={collapsed ? 'Dashboard' : undefined}>
              <LayoutDashboard className="size-4 shrink-0" />
              <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Dashboard</span>
            </NavLink>
            )}
          </li>
          {(canManageAdministrators || canManageServiceCategories || canManageBookings || canManageReports || canManageNotifications || canManageAnalytics || canManageRecognition || canViewAudit || canManageSettings || canManageData || canManageSupport) && (
            <>
              <li className={`menu-title mt-2 ${collapsed ? 'lg:hidden' : undefined}`}>Administration</li>
              {canManageAdministrators && (
                <li>
                  <NavLink
                    to="/admin/administrators"
                    className={navLinkClass}
                    title={collapsed ? 'Administrator management' : undefined}
                  >
                    <Users className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>
                      Administrator Management
                    </span>
                  </NavLink>
                </li>
              )}
              {canManageServiceCategories && (
                <li>
                  <NavLink
                    to="/admin/service-categories"
                    className={navLinkClass}
                    title={collapsed ? 'Service categories' : undefined}
                  >
                    <FolderTree className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>
                      Service Categories
                    </span>
                  </NavLink>
                </li>
              )}
              {canManageServices && (
                <li>
                  <NavLink
                    to="/admin/services"
                    className={navLinkClass}
                    title={collapsed ? 'Service management' : undefined}
                  >
                    <FileText className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>
                      Services
                    </span>
                  </NavLink>
                </li>
              )}
              {canManageBookings && (
                <li>
                  <NavLink
                    to="/admin/bookings"
                    className={navLinkClass}
                    title={collapsed ? 'Booking management' : undefined}
                  >
                    <CalendarDays className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>
                      Bookings
                    </span>
                  </NavLink>
                </li>
              )}
              {canManageDisputes && (
                <li>
                  <NavLink to="/admin/disputes" className={navLinkClass} title={collapsed ? 'Dispute management' : undefined}>
                    <Gavel className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Dispute Management</span>
                  </NavLink>
                </li>
              )}
              {canManageReviews && (
                <li>
                  <NavLink
                    to="/admin/reviews"
                    className={navLinkClass}
                    title={collapsed ? 'Reviews and ratings' : undefined}
                  >
                    <Star className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>
                      Reviews and Ratings
                    </span>
                  </NavLink>
                </li>
              )}
              {canManageReports && (
                <li>
                  <NavLink
                    to="/admin/reports"
                    className={navLinkClass}
                    title={collapsed ? 'Reports and moderation' : undefined}
                  >
                    <ShieldAlert className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>
                      Reports and Moderation
                    </span>
                  </NavLink>
                </li>
              )}
              {canManageNotifications && (
                <li>
                  <NavLink to="/admin/notifications" className={navLinkClass} title={collapsed ? 'Notifications and announcements' : undefined}>
                    <Bell className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Notifications</span>
                  </NavLink>
                </li>
              )}
              {canManageAnalytics && (
                <li>
                  <NavLink to="/admin/analytics" className={navLinkClass} title={collapsed ? 'Reports and analytics' : undefined}>
                    <BarChart3 className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Reports & Analytics</span>
                  </NavLink>
                </li>
              )}
              {canManageRecognition && (
                <li>
                  <NavLink to="/admin/provider-recognition" className={navLinkClass} title={collapsed ? 'Provider recognition' : undefined}>
                    <Award className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Provider Recognition</span>
                  </NavLink>
                </li>
              )}
              {canViewAudit && (
                <li>
                  <NavLink to="/admin/audit-logs" className={navLinkClass} title={collapsed ? 'Security and audit logs' : undefined}>
                    <ClipboardList className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Security & Audit</span>
                  </NavLink>
                </li>
              )}
              {canManageSettings && (
                <li>
                  <NavLink to="/admin/settings" className={navLinkClass} title={collapsed ? 'System settings' : undefined}>
                    <Settings className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>System Settings</span>
                  </NavLink>
                </li>
              )}
              {canManageData && (
                <li><NavLink to="/admin/data-management" className={navLinkClass} title={collapsed ? 'Data management' : undefined}><Archive className="size-4 shrink-0" /><span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Data Management</span></NavLink></li>
              )}
              {canManageSupport && (
                <li>
                  <NavLink to="/admin/support" className={navLinkClass} title={collapsed ? 'Support management' : undefined}>
                    <LifeBuoy className="size-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Support Management</span>
                  </NavLink>
                </li>
              )}
            </>
          )}
          {canManageUsers && (
            <li>
              <NavLink
                to="/admin/users"
                className={navLinkClass}
                title={collapsed ? 'User management' : undefined}
              >
                <UsersRound className="size-4 shrink-0" />
                <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>User Management</span>
              </NavLink>
            </li>
          )}
          {canManageProviders && (
            <li>
              <NavLink
                to="/admin/providers"
                className={navLinkClass}
                title={collapsed ? 'Provider management' : undefined}
              >
                <UserCheck className="size-4 shrink-0" />
                <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Provider Management</span>
              </NavLink>
            </li>
          )}

          {/* Sign out — pinned to the bottom of the sidebar. */}
          <li className="mt-auto">
            <button
              type="button"
              onClick={logoutDisclosure.open}
              className="text-error"
              title={collapsed ? 'Sign out' : undefined}
              aria-label={collapsed ? 'Sign out' : undefined}
            >
              <LogOut className="size-4 shrink-0" />
              <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>Sign out</span>
            </button>
          </li>
        </aside>
      </div>

      <ConfirmDialog
        open={logoutDisclosure.isOpen}
        onCancel={logoutDisclosure.close}
        onConfirm={() =>
          logoutMutation.mutate(undefined, {
            onSuccess: () => logoutDisclosure.close(),
          })
        }
        loading={logoutMutation.isPending}
        title="Sign out?"
        description="Are you sure you want to sign out? You will need to log in again to continue."
        confirmText="Sign out"
        variant="error"
      />
    </div>
  )
}
