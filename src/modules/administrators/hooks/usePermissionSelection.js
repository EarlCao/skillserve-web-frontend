import { useCallback, useState } from 'react'
import { withAccessLevel, withPermissionToggled } from '../utils/permissionLevels'

/**
 * Selection + expand/collapse state for the permission matrix. Shared by
 * PermissionsPage and PermissionsModal so both views behave identically.
 *
 * Areas start collapsed: the level buttons cover most cases, and "Choose
 * specific" opens the individual permissions of an area.
 *
 * @returns {{
 *   selected: string[],
 *   setSelected: (names: string[]) => void,
 *   setLevel: (group: object, level: 'none'|'view'|'full') => void,
 *   togglePermission: (group: object, name: string) => void,
 *   setAll: (groups: object[], level: 'none'|'view'|'full') => void,
 *   collapsedModules: Set<string>,
 *   toggleModule: (module: string) => void,
 * }}
 */
export function usePermissionSelection() {
  const [selected, setSelected] = useState([])
  const [expandedModules, setExpandedModules] = useState(() => new Set())

  const setLevel = useCallback((group, level) => {
    setSelected((prev) => withAccessLevel(prev, group, level))
  }, [])

  const togglePermission = useCallback((group, name) => {
    setSelected((prev) => withPermissionToggled(prev, group, name))
  }, [])

  const setAll = useCallback((groups, level) => {
    setSelected((prev) => groups.reduce((current, group) => withAccessLevel(current, group, level), prev))
  }, [])

  const toggleModule = useCallback((module) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(module)) {
        next.delete(module)
      } else {
        next.add(module)
      }

      return next
    })
  }, [])

  // The list asks which areas are collapsed; everything not expanded is.
  const collapsedModules = { has: (module) => !expandedModules.has(module) }

  return { selected, setSelected, setLevel, togglePermission, setAll, collapsedModules, toggleModule }
}
