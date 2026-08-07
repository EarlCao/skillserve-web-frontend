import { ChevronDown, ChevronRight } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Skeleton from '../../../components/ui/Skeleton'

/**
 * Renders the permission matrix grouped by module with:
 *  - select-all / clear-all controls
 *  - per-module expand/collapse
 *  - read-only mode (super administrator)
 *  - skeleton loading state
 *
 * Shared by PermissionsPage and PermissionsModal.
 *
 * @param {object} props
 * @param {Array<{module: string, permissions: Array<{id: number, name: string}>}>} props.groups
 * @param {string[]} props.selected
 * @param {(name: string) => void} props.onToggle
 * @param {() => void} props.onSelectAll
 * @param {() => void} props.onClearAll
 * @param {boolean} [props.readOnly]   super administrator — no toggling
 * @param {Set<string>} [props.collapsedModules]
 * @param {(module: string) => void} [props.onToggleModule]
 * @param {boolean} [props.isLoading]
 */
export default function PermissionGroupList({
  groups,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  readOnly = false,
  collapsedModules = new Set(),
  onToggleModule,
  isLoading = false,
}) {
  const permissionNames = groups.flatMap((group) => group.permissions.map((permission) => permission.name))
  const isSelectAll = permissionNames.length > 0 && permissionNames.every((name) => selected.includes(name))

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-48" />
        {Array.from({ length: 3 }).map((_, moduleIndex) => (
          <div key={moduleIndex} className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, permissionIndex) => (
                <Skeleton key={permissionIndex} className="h-11 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 border-b border-base-200 pb-2">
          <label className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={isSelectAll}
              onChange={(event) => (event.target.checked ? onSelectAll() : onClearAll())}
              aria-label="Select all permissions"
            />
            <span className="label-text font-medium">Select all permissions</span>
          </label>

          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={onClearAll}
            disabled={selected.length === 0}
            aria-label="Clear all permissions"
          >
            Clear all
          </button>
        </div>
      )}

      {groups.map((group) => {
        const isCollapsed = collapsedModules.has(group.module)

        return (
          <fieldset key={group.module} className="flex flex-col gap-2">
            <legend className="sr-only">{group.module}</legend>

            <div className="flex w-full items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/60">
              {onToggleModule && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  onClick={() => onToggleModule(group.module)}
                  aria-expanded={!isCollapsed}
                  aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${group.module}`}
                >
                  {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
              )}
              <h3 className="uppercase tracking-wide">{group.module}</h3>
              <Badge variant="outline" size="xs">
                {group.permissions.length}
              </Badge>
            </div>

            {!isCollapsed && (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {group.permissions.map((permission) => {
                  const checked = selected.includes(permission.name)

                  return (
                    <label
                      key={permission.id}
                      className={`label cursor-pointer justify-start gap-3 rounded-lg border p-2.5 transition-colors ${
                        readOnly
                          ? 'border-base-200 bg-base-200/40'
                          : checked
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-base-200 hover:border-base-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={checked}
                        disabled={readOnly}
                        onChange={() => onToggle(permission.name)}
                      />
                      <span className="label-text text-sm">{permission.name}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </fieldset>
        )
      })}

      {!isLoading && groups.length === 0 && (
        <p className="py-6 text-center text-sm text-base-content/60">No permissions in the catalog yet.</p>
      )}
    </div>
  )
}
