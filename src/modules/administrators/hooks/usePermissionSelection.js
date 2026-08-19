import { useCallback, useState } from 'react'

/**
 * Selection + expand/collapse state for the permission matrix.
 * Shared by PermissionsPage and PermissionsModal so both views behave
 * identically.
 *
 * @returns {{
 *   selected: string[],
 *   setSelected: (names: string[]) => void,
 *   toggle: (name: string) => void,
 *   clearAll: () => void,
 *   collapsedModules: Set<string>,
 *   toggleModule: (module: string) => void,
 * }}
 */
export function usePermissionSelection() {
  const [selected, setSelected] = useState([])
  const [collapsedModules, setCollapsedModules] = useState(() => new Set())

  const toggle = useCallback((name) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }, [])

  const clearAll = useCallback(() => setSelected([]), [])

  const toggleGroup = useCallback((names) => {
    setSelected((prev) => (names.every((name) => prev.includes(name))
      ? prev.filter((name) => !names.includes(name))
      : [...new Set([...prev, ...names])]))
  }, [])

  const toggleModule = useCallback((module) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev)
      if (next.has(module)) {
        next.delete(module)
      } else {
        next.add(module)
      }

      return next
    })
  }, [])

  return { selected, setSelected, toggle, toggleGroup, clearAll, collapsedModules, toggleModule }
}
