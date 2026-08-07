import { useMemo, useState } from 'react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ErrorState from '../../../components/common/ErrorState'
import EmptyState from '../../../components/common/EmptyState'
import { usePermissionMatrix } from '../hooks/usePermissions'
import { useRoles, useSyncRolePermissions } from '../hooks/useRoles'

const SUPER_ADMIN = 'super-admin'

/**
 * Permission matrix: pick a role, then toggle its permissions grouped by
 * module. Saving syncs the selection to the backend.
 */
export default function PermissionsPage() {
  const rolesQuery = useRoles({ per_page: 100, sort: 'name', direction: 'asc' })
  const matrixQuery = usePermissionMatrix()
  const syncMutation = useSyncRolePermissions()

  const roles = useMemo(() => rolesQuery.data?.data ?? [], [rolesQuery.data])
  const groups = matrixQuery.data?.data ?? []

  const [selectedRole, setSelectedRole] = useState(null)
  const [selected, setSelected] = useState([])

  const isSuperAdmin = selectedRole?.name === SUPER_ADMIN

  // Auto-select the first (non-system) role once the list loads. Adjusting
  // state during render follows the React docs' recommended pattern.
  const [autoSelected, setAutoSelected] = useState(false)
  if (!autoSelected && !selectedRole && roles.length > 0) {
    setAutoSelected(true)
    const initial = roles.find((role) => role.name !== SUPER_ADMIN) ?? roles[0]
    setSelectedRole(initial)
    setSelected(initial.permissions ?? [])
  }

  function selectRole(role) {
    setSelectedRole(role)
    setSelected(role?.permissions ?? [])
  }

  const toggle = (name) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const permissionNames = groups.flatMap((group) => group.permissions.map((permission) => permission.name))
  const isSelectAll = permissionNames.length > 0 && permissionNames.every((name) => selected.includes(name))

  const toggleAll = () => setSelected(isSelectAll ? [] : permissionNames)

  const onSubmit = () => {
    if (!selectedRole) return

    syncMutation.mutate({ id: selectedRole.id, permissions: selected })
  }

  if (rolesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
      </div>
    )
  }

  if (rolesQuery.isError) {
    return <ErrorState title="Could not load roles" message={rolesQuery.error?.message} onRetry={rolesQuery.refetch} />
  }

  if (roles.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No roles yet"
          description="Create a role first, then assign permissions to it."
        />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Permissions</h1>
        <p className="text-sm text-base-content/60">Assign permissions to roles. Permissions are grouped by module.</p>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium" htmlFor="permission-role">
            Role
          </label>
          <select
            id="permission-role"
            className="select select-bordered select-sm w-full sm:w-64"
            value={selectedRole?.id ?? ''}
            onChange={(event) => selectRole(roles.find((role) => role.id === Number(event.target.value)))}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
                {role.name === SUPER_ADMIN ? ' (fixed)' : ''}
              </option>
            ))}
          </select>

          {isSuperAdmin && (
            <Badge variant="warning">Super administrator permissions are fixed</Badge>
          )}
        </div>

        {matrixQuery.isError && (
          <ErrorState
            title="Could not load permissions"
            message={matrixQuery.error?.message}
            onRetry={matrixQuery.refetch}
          />
        )}

        {matrixQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
          </div>
        ) : (
          <>
            {!isSuperAdmin && (
              <label className="label cursor-pointer justify-start gap-2 border-b border-base-200 pb-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={isSelectAll}
                  onChange={toggleAll}
                />
                <span className="label-text font-medium">Select all permissions</span>
              </label>
            )}

            <div className="mt-2 flex flex-col gap-6">
              {groups.map((group) => (
                <section key={group.module}>
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/60">
                    {group.module}
                    <Badge variant="outline" size="xs">
                      {group.permissions.length}
                    </Badge>
                  </h2>

                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {group.permissions.map((permission) => {
                      const checked = selected.includes(permission.name)

                      return (
                        <label
                          key={permission.id}
                          className={`label cursor-pointer justify-start gap-3 rounded-lg border p-2.5 transition-colors ${
                            isSuperAdmin
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
                            disabled={isSuperAdmin}
                            onChange={() => toggle(permission.name)}
                          />
                          <span className="label-text text-sm">{permission.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </section>
              ))}

              {groups.length === 0 && (
                <p className="py-8 text-center text-sm text-base-content/60">No permissions in the catalog yet.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-base-200 pt-4">
              <Button onClick={onSubmit} loading={syncMutation.isPending} disabled={isSuperAdmin}>
                Save permissions
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
