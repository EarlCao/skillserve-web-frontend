import { ChevronDown, ChevronRight } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Skeleton from '../../../components/ui/Skeleton'
import { accessLevel, LEVELS } from '../utils/permissionLevels'

/**
 * The permission matrix: one row per area of the admin web, each with a
 * quick choice — No access, View or Full control — and "Choose specific" to
 * pick exactly which things the role may view and control in that area.
 *
 * A role whose permissions match none of the three levels shows as "Custom",
 * with how many of the area's permissions it holds.
 *
 * Shared by PermissionsPage and PermissionsModal.
 *
 * @param {object} props
 * @param {Array<{key: string, module: string, description?: string, view_permissions: string[], permissions: Array<{id: number, name: string}>}>} props.groups
 * @param {string[]} props.selected
 * @param {(group: object, level: 'none'|'view'|'full') => void} props.onSetLevel
 * @param {(group: object, name: string) => void} props.onTogglePermission  one permission on or off
 * @param {(level: 'none'|'view'|'full') => void} props.onSetAll
 * @param {boolean} [props.readOnly]   super administrator — no changes
 * @param {Set<string>} [props.collapsedModules]  areas whose details are hidden (all by default)
 * @param {(module: string) => void} [props.onToggleModule]
 * @param {boolean} [props.isLoading]
 */
export default function PermissionGroupList({
  groups,
  selected,
  onSetLevel,
  onTogglePermission,
  onSetAll,
  readOnly = false,
  collapsedModules = new Set(),
  onToggleModule,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return <p className="py-6 text-center text-sm text-base-content/60">No permissions in the catalog yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 border-b border-base-200 pb-3 text-sm">
          <span className="font-medium">Set every area to:</span>
          {LEVELS.map(({ value, label }) => (
            <button key={value} type="button" className="btn btn-ghost btn-xs" onClick={() => onSetAll(value)}>
              {label}
            </button>
          ))}
        </div>
      )}

      <ul className="flex flex-col divide-y divide-base-200 rounded-lg border border-base-200">
        {groups.map((group) => (
          <AreaRow
            key={group.key ?? group.module}
            group={group}
            selected={selected}
            readOnly={readOnly}
            onSetLevel={onSetLevel}
            onTogglePermission={onTogglePermission}
            expanded={!collapsedModules.has(group.module)}
            onToggle={onToggleModule ? () => onToggleModule(group.module) : null}
          />
        ))}
      </ul>
    </div>
  )
}

function AreaRow({ group, selected, readOnly, onSetLevel, onTogglePermission, expanded, onToggle }) {
  const level = accessLevel(group, selected)
  const names = group.permissions.map((permission) => permission.name)
  const viewNames = group.view_permissions ?? []
  const controlNames = names.filter((name) => !viewNames.includes(name))
  const heldCount = names.filter((name) => selected.includes(name)).length
  const radioName = `level-${group.key ?? group.module}`

  return (
    <li className="flex flex-col gap-2 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{group.module}</h3>
            {level === 'custom' && (
              <Badge variant="warning" size="xs">Custom · {heldCount} of {names.length}</Badge>
            )}
          </div>
          {group.description && <p className="text-xs text-base-content/60">{group.description}</p>}
        </div>

        <div role="radiogroup" aria-label={`${group.module} access`} className="join">
          {LEVELS.filter(({ value }) => value !== 'view' || viewNames.length > 0).map(({ value, label }) => (
            <label
              key={value}
              className={`btn join-item btn-sm ${level === value ? 'btn-primary' : 'btn-outline border-base-300'} ${readOnly ? 'pointer-events-none' : ''}`}
            >
              <input
                type="radio"
                className="sr-only"
                name={radioName}
                value={value}
                checked={level === value}
                disabled={readOnly}
                onChange={() => onSetLevel(group, value)}
              />
              {label}
            </label>
          ))}
        </div>

        {onToggle && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={onToggle}
            aria-expanded={expanded}
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            {readOnly ? "What's included" : 'Choose specific'}
          </button>
        )}
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 rounded-md bg-base-200/40 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <PermissionChecklist
              title="What they can view"
              names={viewNames}
              selected={selected}
              readOnly={readOnly}
              onToggle={(name) => onTogglePermission(group, name)}
            />
            <PermissionChecklist
              title="What they can control"
              names={controlNames}
              selected={selected}
              readOnly={readOnly}
              onToggle={(name) => onTogglePermission(group, name)}
            />
          </div>
          {!readOnly && controlNames.length > 0 && (
            <p className="text-xs text-base-content/60">Choosing something to control also lets them view this area.</p>
          )}
        </div>
      )}
    </li>
  )
}

/** One permission per line, as a checkbox (or a plain list when read-only). */
function PermissionChecklist({ title, names, selected, readOnly, onToggle }) {
  if (names.length === 0) return null

  return (
    <fieldset>
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/60">{title}</legend>
      <div className="flex flex-col gap-1">
        {names.map((name) => {
          const checked = selected.includes(name)

          return (
            <label
              key={name}
              className={`flex items-center gap-2 rounded px-1 py-0.5 text-sm ${readOnly ? '' : 'cursor-pointer hover:bg-base-200'}`}
            >
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={checked}
                disabled={readOnly}
                onChange={() => onToggle(name)}
              />
              <span className={checked ? '' : 'text-base-content/60'}>{permissionLabel(name)}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** "suspend users" → "Suspend users". */
function permissionLabel(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
