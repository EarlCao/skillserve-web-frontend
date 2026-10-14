import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import Skeleton from '../../../components/ui/Skeleton'
import { useInboxAlerts, useInboxUnreadCount, useMarkAllAlertsRead } from '../hooks/useInbox'
import AlertItem from './AlertItem'

const PREVIEW = { per_page: 6 }

/** Closes the daisyUI focus dropdown after a choice. */
function closeDropdown() {
  document.activeElement?.blur()
}

/** Top-bar bell: the unread count and the latest alerts. */
export default function InboxBell() {
  const unread = useInboxUnreadCount()
  const { data, isLoading, isError, refetch } = useInboxAlerts(PREVIEW)
  const markAll = useMarkAllAlertsRead()
  const alerts = data?.data ?? []

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-circle btn-ghost"
        aria-label={unread > 0 ? `Inbox, ${unread} unread` : 'Inbox'}
      >
        <span className="indicator">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="badge indicator-item badge-error badge-xs h-4 min-w-4 px-1 text-[10px]">{unread > 99 ? '99+' : unread}</span>
          )}
        </span>
      </button>
      <div
        tabIndex={0}
        className="dropdown-content z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-box border border-base-300 bg-base-100 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
          <span className="font-semibold">Inbox</span>
          {unread > 0 && (
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[0, 1, 2].map((key) => <Skeleton key={key} className="h-14 w-full" />)}
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-sm text-base-content/60">
              Could not load alerts.{' '}
              <button type="button" className="link link-primary" onClick={() => refetch()}>Try again</button>
            </div>
          ) : alerts.length === 0 ? (
            <p className="p-6 text-center text-sm text-base-content/60">Nothing needs your attention right now.</p>
          ) : (
            alerts.map((alert) => <AlertItem key={alert.id} alert={alert} compact onOpen={closeDropdown} />)
          )}
        </div>
        <div className="border-t border-base-300 p-2">
          <Link to="/admin/inbox" className="btn btn-ghost btn-sm btn-block" onClick={closeDropdown}>
            View all
          </Link>
        </div>
      </div>
    </div>
  )
}
