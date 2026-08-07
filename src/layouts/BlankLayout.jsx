import { Outlet } from 'react-router-dom'

/**
 * Minimal layout with no chrome — for landing pages or full-screen routes.
 */
export default function BlankLayout() {
  return (
    <main className="min-h-svh">
      <Outlet />
    </main>
  )
}
