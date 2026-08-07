import { createBrowserRouter } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import BlankLayout from '../layouts/BlankLayout'

/**
 * Application routing structure — Phase 0.
 *
 * Only the shared layouts are registered. Feature routes (auth, dashboard,
 * users, bookings, ...) will be added to each layout's `children` in later
 * phases.
 */
export const router = createBrowserRouter([
  {
    element: <BlankLayout />,
    children: [
      {
        index: true,
        element: (
          <EmptyState
            title="SkillServe"
            description="The shared foundation is ready. Feature modules start in Phase 1."
          />
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <EmptyState title="Dashboard" description="Admin module routes will live here." />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <EmptyState title="Authentication" description="Login and register pages will live here." />,
      },
    ],
  },
])
