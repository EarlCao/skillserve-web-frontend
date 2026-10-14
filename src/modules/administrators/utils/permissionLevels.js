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

/**
 * [selected] with one permission of [group] switched on or off. Switching on
 * a control permission also grants the area's view permissions — a control
 * cannot be used without seeing the page it is on.
 */
export function withPermissionToggled(selected, group, name) {
  if (selected.includes(name)) return selected.filter((item) => item !== name)

  const viewNames = group.view_permissions ?? []
  const added = viewNames.includes(name) ? [name] : [name, ...viewNames]

  return [...new Set([...selected, ...added])]
}

/** [selected] with the area set to [level]; other areas are left as they are. */
export function withAccessLevel(selected, group, level) {
  const names = group.permissions.map((permission) => permission.name)
  const others = selected.filter((name) => !names.includes(name))

  if (level === 'full') return [...others, ...names]
  if (level === 'view') return [...others, ...(group.view_permissions ?? [])]

  return others
}
