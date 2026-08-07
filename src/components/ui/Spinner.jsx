import { cn } from '../../lib/utils'

const SIZES = {
  xs: 'loading-xs',
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
}

/**
 * Loading spinner. No business logic.
 */
export default function Spinner({ size = 'md', className, ...props }) {
  return (
    <span
      className={cn('loading loading-spinner', SIZES[size], className)}
      role="status"
      aria-label="Loading"
      {...props}
    />
  )
}
