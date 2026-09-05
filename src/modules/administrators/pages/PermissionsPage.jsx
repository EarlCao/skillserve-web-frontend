import { useMemo, useState } from 'react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import ErrorState from '../../../components/common/ErrorState'
import EmptyState from '../../../components/common/EmptyState'
import PermissionGroupList from '../components/PermissionGroupList'
import { usePermissionMatrix } from '../hooks/usePermissions'
import { useRoles, useSyncRolePermissions } from '../hooks/useRoles'
import { usePermissionSelection } from '../hooks/usePermissionSelection'

const SUPER_ADMIN = 'super-admin'

/**
 * Permission matrix: pick a role, then toggle its permissions grouped by
 * module. Saving syncs the selection to the backend.
 */
export default function PermissionsPage() {
  const rolesQuery = useRoles({ per_page: 100, sort: 'name', direction: 'asc' })
  const matrixQuery = usePermissionMatrix()
  const syncMutation = useSyncRolePermissions()
  const { selected, setSelected, toggle, toggleGroup, clearAll, collapsedModules, toggleModule } = usePermissionSelection()
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false)

  const roles = useMemo(() => rolesQuery.data?.data ?? [], [rolesQuery.data])
  const groups = matrixQuery.data?.data ?? []
  const permissionNames = groups.flatMap((group) => group.permissions.map((permission) => permission.name))

  const [selectedRole, setSelectedRole] = useState(null)
  const [autoSelected, setAutoSelected] = useState(false)

  const isSuperAdmin = selectedRole?.name === SUPER_ADMIN
  const displayedSelected = isSuperAdmin ? permissionNames : selected

  // Auto-select the first (non-system) role once the list loads. Adjusting
  // state during render follows the React docs' recommended pattern.
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

  const onSelectAll = () => setSelected(permissionNames)

  const onSubmit = () => {
    setConfirmSaveOpen(false)
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

        <PermissionGroupList
          groups={groups}
          selected={displayedSelected}
          onToggle={toggle}
          onToggleGroup={toggleGroup}
          onSelectAll={onSelectAll}
          onClearAll={clearAll}
          readOnly={isSuperAdmin}
          collapsedModules={collapsedModules}
          onToggleModule={toggleModule}
          isLoading={matrixQuery.isLoading}
        />

        <div className="mt-6 flex justify-end border-t border-base-200 pt-4">
          <Button
            onClick={() => setConfirmSaveOpen(true)}
            loading={syncMutation.isPending}
            disabled={isSuperAdmin || matrixQuery.isLoading}
          >
            Save permissions
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmSaveOpen}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={onSubmit}
        loading={syncMutation.isPending}
        title="Save permission changes?"
        description={`Assign the selected permissions to "${selectedRole?.name ?? ''}"? Changes take effect immediately.`}
        confirmText="Save changes"
        variant="primary"
      />
    </div>
  )
}
