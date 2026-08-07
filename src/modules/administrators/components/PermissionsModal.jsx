import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import ErrorState from '../../../components/common/ErrorState'
import PermissionGroupList from './PermissionGroupList'
import { usePermissionMatrix } from '../hooks/usePermissions'
import { useSyncRolePermissions } from '../hooks/useRoles'
import { usePermissionSelection } from '../hooks/usePermissionSelection'

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
  const { selected, setSelected, toggle, clearAll, collapsedModules, toggleModule } = usePermissionSelection()
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false)

  const isSuperAdmin = role?.name === SUPER_ADMIN
  const groups = matrixQuery.data?.data ?? []
  const permissionNames = groups.flatMap((group) => group.permissions.map((permission) => permission.name))

  // Seed the selection from the role's current permissions whenever the modal
  // opens (or the target role changes). Adjusting state during render follows
  // the React docs' recommended pattern and avoids a cascading effect.
  const [seedKey, setSeedKey] = useState('')
  const currentSeedKey = open && role ? `open:${role.id}` : 'closed'
  if (currentSeedKey !== seedKey) {
    setSeedKey(currentSeedKey)
    setSelected(role?.permissions ?? [])
  }

  const onSelectAll = () => setSelected(permissionNames)

  const onSubmit = () => {
    setConfirmSaveOpen(false)
    syncMutation.mutate({ id: role.id, permissions: selected }, { onSuccess: () => onClose() })
  }

  return (
    <>
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
              <Button
                onClick={() => setConfirmSaveOpen(true)}
                loading={syncMutation.isPending}
                disabled={matrixQuery.isLoading}
              >
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

          <PermissionGroupList
            groups={groups}
            selected={selected}
            onToggle={toggle}
            onSelectAll={onSelectAll}
            onClearAll={clearAll}
            readOnly={isSuperAdmin}
            collapsedModules={collapsedModules}
            onToggleModule={toggleModule}
            isLoading={matrixQuery.isLoading}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmSaveOpen}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={onSubmit}
        loading={syncMutation.isPending}
        title="Save permission changes?"
        description={`Assign the selected permissions to "${role?.name ?? ''}"? Changes take effect immediately.`}
        confirmText="Save changes"
        variant="primary"
      />
    </>
  )
}
