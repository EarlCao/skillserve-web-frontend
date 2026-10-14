import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../../lib/utils'
import { useMarkAlertRead } from '../hooks/useInbox'
import { alertKind } from '../utils/alertKinds'

/**
 * One alert: opening it marks it read and goes to the page that handles it.
 * `compact` is the bell's dropdown row; otherwise the Inbox page row.
 */
export default function AlertItem({ alert, compact = false, onOpen }) {
  const navigate = useNavigate()
  const markRead = useMarkAlertRead()
  const { label, icon: Icon } = alertKind(alert.kind)
  const unread = !alert.read_at
  const when = alert.created_at ? formatDistanceToNow(new Date(alert.created_at), { addSuffix: true }) : ''

  const open = () => {
    if (unread) markRead.mutate(alert.id)
    onOpen?.()
    if (alert.link) navigate(alert.link)
  }

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        'flex w-full items-start gap-3 rounded-box text-start transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary',
        compact ? 'p-2' : 'p-3',
        unread && 'bg-primary/5',
      )}
    >
      <span className={cn('mt-0.5 rounded-full p-2', unread ? 'bg-primary/10 text-primary' : 'bg-base-200 text-base-content/60')}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={cn('truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>{alert.title}</span>
          {unread && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
        </span>
        <span className={cn('block text-sm text-base-content/70', compact ? 'line-clamp-2' : 'line-clamp-3')}>{alert.message}</span>
        <span className="mt-1 block text-xs text-base-content/50">
          {label} · {when}
        </span>
      </span>
    </button>
  )
}
