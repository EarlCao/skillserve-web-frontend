import { cn } from '../../lib/utils'

/**
 * Loading placeholder block. No business logic.
 */
export default function Skeleton({ className, ...props }) {
  return <div className={cn('skeleton', className)} {...props} />
}
