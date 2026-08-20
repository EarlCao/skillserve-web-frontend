import { forwardRef, useId } from 'react'
import { cn } from '../../lib/utils'

/**
 * Generic textarea with label, hint, and error support.
 */
const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const textareaId = id ?? autoId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="mb-1 block text-sm font-medium">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn('textarea textarea-bordered w-full', error && 'textarea-error', className)}
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

export default Textarea
