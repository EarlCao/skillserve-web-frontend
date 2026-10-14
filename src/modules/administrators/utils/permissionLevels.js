/** The access levels an area of the admin web offers, in display order. */
export const LEVELS = [
  { value: 'none', label: 'No access' },
  { value: 'view', label: 'View' },
  { value: 'full', label: 'Full control' },
]

/**
 * Which level [selected] permissions give an area: 'full' when it holds every
 * permission of the area, 'view' when it holds exactly the read-only ones,
 * 'none' when it holds none, otherwise 'custom'.
 */
export function accessLevel(group, selected) {
  const names = group.permissions.map((permission) => permission.name)
  const viewNames = group.view_permissions ?? []
  const held = names.filter((name) => selected.includes(name))

  if (held.length === 0) return 'none'
  if (held.length === names.length) return 'full'
  if (viewNames.length > 0 && held.length === viewNames.length && viewNames.every((name) => held.includes(name))) return 'view'

  return 'custom'
}

/** [selected] with the area set to [level]; other areas are left as they are. */
export function withAccessLevel(selected, group, level) {
  const names = group.permissions.map((permission) => permission.name)
  const others = selected.filter((name) => !names.includes(name))

  if (level === 'full') return [...others, ...names]
  if (level === 'view') return [...others, ...(group.view_permissions ?? [])]

  return others
}
