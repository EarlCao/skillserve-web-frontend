import { Inbox } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Empty/placeholder state with an optional action button.
 */
export default function EmptyState({ title = 'Nothing here yet', description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      <div className="rounded-full bg-base-200 p-4">
        <Inbox className="size-8 text-base-content/40" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-md text-sm text-base-content/60">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
