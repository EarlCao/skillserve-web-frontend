import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Moon, Sun } from 'lucide-react'
import { APP_NAME } from '../constants'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Shared admin layout: responsive drawer sidebar + topbar + content outlet.
 *
 * Sidebar navigation will be filled by feature modules in later phases.
 */
export default function AdminLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      {/* Content */}
      <div className="drawer-content flex min-h-svh flex-col">
        <header className="navbar sticky top-0 z-30 border-b border-base-300 bg-base-100">
          <div className="flex-none lg:hidden">
            <label htmlFor="app-drawer" aria-label="Open menu" className="btn btn-square btn-ghost">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
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
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label htmlFor="app-drawer" aria-label="Close menu" className="drawer-overlay" />
        <aside className="menu min-h-full w-64 gap-2 border-r border-base-300 bg-base-100 p-4">
          <div className="mb-4 flex items-center gap-2 px-2 text-xl font-bold">
            <LayoutDashboard className="size-6 text-primary" />
            <span>{APP_NAME}</span>
          </div>
          {/* Feature navigation is added here in later phases. */}
          <li className="menu-title">Main</li>
          <li>
            <span className="opacity-60">(Modules will appear here)</span>
          </li>
        </aside>
      </div>
    </div>
  )
}
