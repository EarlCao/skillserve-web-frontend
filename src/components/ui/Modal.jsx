import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * Controlled modal built on the native <dialog> element.
 *
 * @param {boolean} open
 * @param {() => void} onClose  called on Escape / backdrop click / onClose event
 */
export default function Modal({ open, onClose, title, description, children, footer, className, boxClassName }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={cn('modal', className)}
      onClose={onClose}
      onClick={(event) => {
        // Close when clicking the backdrop (the dialog element itself).
        if (event.target === dialogRef.current) {
          onClose?.()
        }
      }}
    >
      <div className={cn('modal-box', boxClassName)}>
        {(title || description) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-bold">{title}</h3>}
            {description && <p className="mt-1 text-sm text-base-content/70">{description}</p>}
          </div>
        )}
        {children}
        {footer && <div className="modal-action">{footer}</div>}
      </div>
    </dialog>
  )
}
