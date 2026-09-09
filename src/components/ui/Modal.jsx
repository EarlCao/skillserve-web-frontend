import { useEffect, useId, useRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * Controlled modal built on the native <dialog> element.
 *
 * @param {boolean} open
 * @param {() => void} onClose  called on Escape / backdrop click / onClose event
 */
export default function Modal({ open, onClose, title, description, children, footer, className, boxClassName }) {
  const dialogRef = useRef(null)
  const previousActiveElement = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  const restoreFocus = () => {
    const element = previousActiveElement.current
    previousActiveElement.current = null

    if (element instanceof HTMLElement) element.focus()
  }

  useEffect(() => {
    const dialog = dialogRef.current
    let focusFrame

    if (!dialog) return

    if (open && !dialog.open) {
      previousActiveElement.current = document.activeElement
      dialog.showModal()
      focusFrame = requestAnimationFrame(() => {
        const firstControl = dialog.querySelector('[autofocus], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
        const focusTarget = firstControl ?? dialog
        focusTarget.focus()
      })
    } else if (!open && dialog.open) {
      dialog.close()
    }

    return () => {
      if (focusFrame) cancelAnimationFrame(focusFrame)
    }
  }, [open])

  const handleClose = () => {
    restoreFocus()
    onClose?.()
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn('modal', className)}
      onClose={handleClose}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      tabIndex={-1}
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
            {title && <h3 id={titleId} className="text-lg font-bold">{title}</h3>}
            {description && <p id={descriptionId} className="mt-1 text-sm text-base-content/70">{description}</p>}
          </div>
        )}
        {children}
        {footer && <div className="modal-action">{footer}</div>}
      </div>
    </dialog>
  )
}
