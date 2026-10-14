import { ChevronDown, ChevronRight } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Skeleton from '../../../components/ui/Skeleton'
import { accessLevel, LEVELS } from '../utils/permissionLevels'

/**
 * The permission matrix: one row per area of the admin web, each with a
 * single choice — No access, View or Full control. The exact permissions a
 * level grants are listed under "What's included".
 *
 * A role whose permissions do not match a level (set before levels existed,
 * or by the API) shows as "Custom" until a level is picked.
 *
 * Shared by PermissionsPage and PermissionsModal.
 *
 * @param {object} props
 * @param {Array<{key: string, module: string, description?: string, view_permissions: string[], permissions: Array<{id: number, name: string}>}>} props.groups
 * @param {string[]} props.selected
 * @param {(group: object, level: 'none'|'view'|'full') => void} props.onSetLevel
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
            expanded={!collapsedModules.has(group.module)}
            onToggle={onToggleModule ? () => onToggleModule(group.module) : null}
          />
        ))}
      </ul>
    </div>
  )
}

function AreaRow({ group, selected, readOnly, onSetLevel, expanded, onToggle }) {
  const level = accessLevel(group, selected)
  const names = group.permissions.map((permission) => permission.name)
  const viewNames = group.view_permissions ?? []
  const radioName = `level-${group.key ?? group.module}`

  return (
    <li className="flex flex-col gap-2 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{group.module}</h3>
            {level === 'custom' && <Badge variant="warning" size="xs">Custom</Badge>}
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
            What's included
          </button>
        )}
      </div>

      {expanded && (
        <div className="grid gap-2 rounded-md bg-base-200/40 p-3 text-xs sm:grid-cols-2">
          <PermissionList title="View" names={viewNames} selected={selected} />
          <PermissionList
            title="Full control adds"
            names={names.filter((name) => !viewNames.includes(name))}
            selected={selected}
          />
        </div>
      )}
    </li>
  )
}

function PermissionList({ title, names, selected }) {
  if (names.length === 0) return null

  return (
    <div>
      <p className="mb-1 font-semibold uppercase tracking-wide text-base-content/60">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {names.map((name) => (
          <li key={name} className={selected.includes(name) ? 'text-base-content' : 'text-base-content/50'}>
            {selected.includes(name) ? '✓' : '·'} {name.charAt(0).toUpperCase() + name.slice(1)}
          </li>
        ))}
      </ul>
    </div>
  )
}
