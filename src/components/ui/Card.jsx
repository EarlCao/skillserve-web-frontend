import { cn } from '../../lib/utils'

/**
 * Generic card container with optional title, description, and footer.
 */
export default function Card({ title, description, footer, className, bodyClassName, children }) {
  return (
    <div className={cn('card bg-base-100 shadow-sm', className)}>
      <div className={cn('card-body', bodyClassName)}>
        {(title || description) && (
          <div className="mb-2">
            {title && <h2 className="card-title">{title}</h2>}
            {description && <p className="text-sm text-base-content/70">{description}</p>}
          </div>
        )}
        {children}
        {footer && <div className="card-actions mt-4 justify-end">{footer}</div>}
      </div>
    </div>
  )
}
