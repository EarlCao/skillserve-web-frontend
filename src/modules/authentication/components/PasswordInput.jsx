import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../../lib/utils'

/**
 * Password input with a show/hide toggle. Accessible: the toggle has an
 * aria-label and is reachable via keyboard (tabIndex -1 keeps focus on the
 * field, but Enter/Space still activate it).
 */
const PasswordInput = forwardRef(function PasswordInput(
  { label, error, hint, className, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="w-full">
      {label && <span className="mb-1 block text-sm font-medium">{label}</span>}
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('input input-bordered w-full pr-11', error && 'input-error', className)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/50 transition-colors hover:text-base-content"
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-sm text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-sm text-base-content/60">{hint}</p>
      ) : null}
    </div>
  )
})

export default PasswordInput
