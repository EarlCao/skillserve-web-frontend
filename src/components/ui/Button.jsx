import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  neutral: 'btn-neutral',
  success: 'btn-success',
  warning: 'btn-warning',
  error: 'btn-error',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  link: 'btn-link',
}

const SIZES = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

/**
 * Generic button. No business logic.
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn('btn', VARIANTS[variant], SIZES[size], loading && 'btn-disabled', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="loading loading-spinner loading-xs" aria-hidden="true" />}
      {children}
    </button>
  )
})

export default Button
