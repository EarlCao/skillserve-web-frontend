import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, matchPath, useLocation } from 'react-router-dom'
import { Archive, Award, Bell, BarChart3, CalendarCheck, CalendarDays, ClipboardList, FolderTree, FileText, Gavel, KeyRound, Layers, LayoutDashboard, LifeBuoy, LogOut, Menu, MessageSquareWarning, Moon, Settings, ShieldAlert, Star, Sun, User, UserCheck, UserCog, UsersRound } from 'lucide-react'
import { APP_NAME } from '../constants'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useLogout } from '../modules/authentication/hooks/useLogout'
import { useDisclosure } from '../hooks/useDisclosure'
import ConfirmDialog from '../components/feedback/ConfirmDialog'
import OfflineBanner from '../components/common/OfflineBanner'
import PageSkeleton from '../components/common/PageSkeleton'
import { hasAnyCapability } from '../utils/permissions'

// Active nav item uses the primary color (not daisyUI's near-black
// base-content that `menu-active` applies). When collapsed, icons center.
function navLinkClass(collapsed) {
  return ({ isActive }) => {
    const base = collapsed ? 'lg:justify-center lg:px-0' : ''

    return isActive ? `bg-primary/10 text-primary font-semibold ${base}`.trim() : base.trim() || undefined
  }
}

function NavItem({ to, end, icon: Icon, label, collapsed }) {
  return (
    <li>
      <NavLink to={to} end={end} className={navLinkClass(collapsed)} title={collapsed ? label : undefined}>
        <Icon className="size-4 shrink-0" />
        <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : undefined}`}>{label}</span>
      </NavLink>
    </li>
  )
}

/**
 * Collapsible sidebar section. Hidden when the user can access none of its
 * items; starts expanded when one of its pages is active. In the collapsed
 * icon rail (desktop) the header is hidden and the items render as plain icons.
 */
function NavGroup({ icon: Icon, label, items, collapsed }) {
  const { pathname } = useLocation()
  const visibleItems = items.filter(Boolean)
  const hasActiveItem = visibleItems.some((item) => matchPath({ path: item.to, end: false }, pathname))
  // null = follow the active route; boolean = the user toggled it explicitly.
  const [expanded, setExpanded] = useState(null)

  if (visibleItems.length === 0) return null

  const isOpen = collapsed || (expanded ?? hasActiveItem)

  return (
    <li>
      <details open={isOpen}>
        <summary
          className={`${collapsed ? 'lg:hidden' : ''} ${hasActiveItem ? 'text-primary' : ''}`.trim() || undefined}
          onClick={(event) => {
            event.preventDefault()
            setExpanded(!isOpen)
          }}
        >
          <Icon className="size-4 shrink-0" />
          <span className="whitespace-nowrap">{label}</span>
        </summary>
        <ul className={collapsed ? 'lg:ms-0 lg:ps-0 lg:before:hidden' : undefined}>
          {visibleItems.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </ul>
      </details>
    </li>
  )
}

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

  const showAdministration = canManageUsers || canManageProviders || canManageAdministrators
    || canManageServices || canManageServiceCategories || canManageBookings || canManageDisputes
    || canManageReviews || canManageReports || canManageRecognition || canManageSupport
    || canManageAnalytics || canManageNotifications || canManageData || canViewAudit || canManageSettings

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
          {/* Route pages are lazy-loaded chunks (see src/routes). */}
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
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
          {(user?.permissions?.includes('view dashboard') || user?.roles?.includes('super-admin')) && (
            <NavItem to="/admin" end icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
          )}

          {showAdministration && (
            <li className={`menu-title mt-2 ${collapsed ? 'lg:hidden' : undefined}`}>Administration</li>
          )}

          <NavGroup
            icon={UsersRound}
            label="User Management"
            collapsed={collapsed}
            items={[
              canManageUsers && { to: '/admin/users', icon: User, label: 'Customer Management' },
              canManageProviders && { to: '/admin/providers', icon: UserCheck, label: 'Provider Management' },
              canManageAdministrators && { to: '/admin/administrators', icon: UserCog, label: 'Admin Management' },
            ]}
          />
          <NavGroup
            icon={Layers}
            label="Services & Categories"
            collapsed={collapsed}
            items={[
              canManageServices && { to: '/admin/services', icon: FileText, label: 'Services' },
              canManageServiceCategories && { to: '/admin/service-categories', icon: FolderTree, label: 'Service Categories' },
            ]}
          />
          <NavGroup
            icon={CalendarDays}
            label="Bookings & Disputes"
            collapsed={collapsed}
            items={[
              canManageBookings && { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
              canManageDisputes && { to: '/admin/disputes', icon: Gavel, label: 'Dispute Management' },
            ]}
          />
          <NavGroup
            icon={MessageSquareWarning}
            label="Reviews & Moderation"
            collapsed={collapsed}
            items={[
              canManageReviews && { to: '/admin/reviews', icon: Star, label: 'Reviews and Ratings' },
              canManageReports && { to: '/admin/reports', icon: ShieldAlert, label: 'Reports and Moderation' },
              canManageRecognition && { to: '/admin/provider-recognition', icon: Award, label: 'Provider Recognition' },
            ]}
          />
          {canManageSupport && (
            <NavItem to="/admin/support" icon={LifeBuoy} label="Support Management" collapsed={collapsed} />
          )}
          {canManageAnalytics && (
            <NavItem to="/admin/analytics" icon={BarChart3} label="Reports & Analytics" collapsed={collapsed} />
          )}
          {canManageNotifications && (
            <NavItem to="/admin/notifications" icon={Bell} label="Notifications" collapsed={collapsed} />
          )}
          {canManageData && (
            <NavItem to="/admin/data-management" icon={Archive} label="Data Management" collapsed={collapsed} />
          )}
          {canViewAudit && (
            <NavItem to="/admin/audit-logs" icon={ClipboardList} label="Security & Audit" collapsed={collapsed} />
          )}
          {canManageSettings && (
            <NavItem to="/admin/settings" icon={Settings} label="System Settings" collapsed={collapsed} />
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
