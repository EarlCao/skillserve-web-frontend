import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import ErrorState from '../../../components/common/ErrorState'
import { usePermissionMatrix } from '../hooks/usePermissions'
import { useSyncRolePermissions } from '../hooks/useRoles'

const SUPER_ADMIN = 'super-admin'

/**
 * Permission matrix modal: assigns permissions to a single role.
 *
 * Permissions are grouped by module; saving syncs the selection to the
 * backend (PUT /roles/{role}/permissions). Super administrator permissions
 * are immutable and shown read-only.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object|null} props.role  the role being configured
 */
export default function PermissionsModal({ open, onClose, role }) {
  const matrixQuery = usePermissionMatrix()
  const syncMutation = useSyncRolePermissions()
  const isSuperAdmin = role?.name === SUPER_ADMIN
  const groups = matrixQuery.data?.data ?? []
  const permissionNames = groups.flatMap((group) => group.permissions.map((permission) => permission.name))

  const [selected, setSelected] = useState([])
  // Seed the selection from the role's current permissions whenever the modal
  // opens (or the target role changes). Adjusting state during render follows
  // the React docs' recommended pattern and avoids a cascading effect.
  const [seedKey, setSeedKey] = useState('')
  const currentSeedKey = open && role ? `open:${role.id}` : 'closed'
  if (currentSeedKey !== seedKey) {
    setSeedKey(currentSeedKey)
    setSelected(role?.permissions ?? [])
  }

  const toggle = (name) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const isSelectAll = permissionNames.length > 0 && permissionNames.every((name) => selected.includes(name))

  const toggleAll = () => {
    setSelected(isSelectAll ? [] : permissionNames)
  }

  const onSubmit = () => {
    syncMutation.mutate({ id: role.id, permissions: selected }, { onSuccess: () => onClose() })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Permissions — ${role?.name ?? ''}`}
      description={
        isSuperAdmin
          ? 'Super administrator permissions are fixed and cannot be modified.'
          : 'Assign permissions to this role. Changes take effect immediately.'
      }
      footer={
        isSuperAdmin ? (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={syncMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={syncMutation.isPending} disabled={matrixQuery.isLoading}>
              Save permissions
            </Button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4">
        {matrixQuery.isError && (
          <ErrorState
            title="Could not load permissions"
            message={matrixQuery.error?.message}
            onRetry={() => matrixQuery.refetch()}
          />
        )}

        {matrixQuery.isLoading && (
          <div className="flex items-center justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
          </div>
        )}

        {!isSuperAdmin && !matrixQuery.isLoading && !matrixQuery.isError && (
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

        {groups.map((group) => (
          <fieldset key={group.module} className="flex flex-col gap-2">
            <legend className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/60">
              {group.module}
              <Badge variant="outline" size="xs">
                {group.permissions.length}
              </Badge>
            </legend>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
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
          </fieldset>
        ))}

        {!matrixQuery.isLoading && !matrixQuery.isError && groups.length === 0 && (
          <p className="py-6 text-center text-sm text-base-content/60">No permissions in the catalog yet.</p>
        )}
      </div>
    </Modal>
  )
}
