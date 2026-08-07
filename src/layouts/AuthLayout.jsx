import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { APP_NAME } from '../constants'

/**
 * Shared authentication layout: centered card on a neutral background.
 * Login/register forms will render through the <Outlet />.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="size-7 text-primary" />
            <span>{APP_NAME}</span>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
