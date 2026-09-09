import { Children, cloneElement, isValidElement, useId } from 'react'

/**
 * Label + control + error/hint wrapper for form controls.
 *
 * Typical usage with react-hook-form:
 *   <FormField label="Email" error={errors.email?.message}>
 *     <Input {...register('email')} />
 *   </FormField>
 */
export default function FormField({ label, error, hint, required, children, className, id }) {
  const autoId = useId()
  const child = Children.only(children)
  const controlId = id ?? child?.props?.id ?? autoId
  const feedbackId = error || hint ? `${controlId}-description` : undefined
  const control = isValidElement(child)
    ? cloneElement(child, {
        id: child.props.id ?? controlId,
        'aria-invalid': child.props['aria-invalid'] ?? Boolean(error),
        'aria-describedby': [child.props['aria-describedby'], feedbackId].filter(Boolean).join(' ') || undefined,
      })
    : children

  return (
    <div className={`flex w-full flex-col gap-1 ${className ?? ''}`}>
      {label && (
        <label htmlFor={controlId} className="text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      {control}
      {error ? (
        <p id={feedbackId} className="text-sm text-error">{error}</p>
      ) : hint ? (
        <p id={feedbackId} className="text-sm text-base-content/60">{hint}</p>
      ) : null}
    </div>
  )
}
