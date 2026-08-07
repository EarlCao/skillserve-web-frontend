import { forwardRef, useId } from 'react'
import { cn } from '../../lib/utils'

/**
 * Generic text input with label, hint, and error support.
 */
const Input = forwardRef(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn('input input-bordered w-full', error && 'input-error', className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-sm text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-sm text-base-content/60">{hint}</p>
      ) : null}
    </div>
  )
})

export default Input
