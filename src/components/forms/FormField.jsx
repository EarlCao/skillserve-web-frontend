/**
 * Label + control + error/hint wrapper for form controls.
 *
 * Typical usage with react-hook-form:
 *   <FormField label="Email" error={errors.email?.message}>
 *     <Input {...register('email')} />
 *   </FormField>
 */
export default function FormField({ label, error, hint, required, children, className }) {
  return (
    <div className={`flex w-full flex-col gap-1 ${className ?? ''}`}>
      {label && (
        <span className="text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <p className="text-sm text-error">{error}</p>
      ) : hint ? (
        <p className="text-sm text-base-content/60">{hint}</p>
      ) : null}
    </div>
  )
}
