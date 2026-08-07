import { useCallback, useState } from 'react'

/**
 * Manage boolean "open/closed" state (modals, dropdowns, drawers).
 *
 * @param {boolean} initial
 */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return { isOpen, open, close, toggle, setIsOpen }
}
