import { cn } from '../../lib/utils'

const VARIANTS = {
  neutral: 'badge-neutral',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  outline: 'badge-outline',
}

const SIZES = {
  xs: 'badge-xs',
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg',
}

/**
 * Small status/label pill. No business logic.
 */
export default function Badge({ variant = 'neutral', size = 'md', className, children, ...props }) {
  return (
    <span className={cn('badge', VARIANTS[variant], SIZES[size], className)} {...props}>
      {children}
    </span>
  )
}
