import { AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'

/**
 * Error state with an optional retry action. No business logic.
 */
export default function ErrorState({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try again', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      <div className="rounded-full bg-error/10 p-4">
        <AlertTriangle className="size-8 text-error" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && <p className="max-w-md text-sm text-base-content/60">{message}</p>}
      {onRetry && (
        <div className="mt-2">
          <Button variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
