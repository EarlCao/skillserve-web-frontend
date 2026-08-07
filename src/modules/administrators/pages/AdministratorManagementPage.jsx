import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, UserPlus } from 'lucide-react'
import Button from '../../../components/ui/Button'
import AdministratorsPage from './AdministratorsPage'
import RolesPage from './RolesPage'
import PermissionsPage from './PermissionsPage'
import AdministratorFormModal from '../components/AdministratorFormModal'
import RoleFormModal from '../components/RoleFormModal'
import { useRoles } from '../hooks/useRoles'

const TABS = [
  { id: 'administrators', label: 'Administrators', Component: AdministratorsPage },
  { id: 'roles', label: 'Roles', Component: RolesPage },
  { id: 'permissions', label: 'Permissions', Component: PermissionsPage },
]

/**
 * Administrator Management — a single page with tabs for the three admin
 * sub-sections. The active tab lives in the URL (?tab=roles) so tabs are
 * shareable and survive a refresh.
 *
 * Panels stay mounted once visited (hidden with CSS) so each tab keeps its
 * own search/filter/pagination state while switching. The "Add administrator"
 * and "Add role" actions live in the page header — always on the right.
 */
export default function AdministratorManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab = TABS.find((tab) => tab.id === requestedTab)?.id ?? 'administrators'

  const [adminFormOpen, setAdminFormOpen] = useState(false)
  const [roleFormOpen, setRoleFormOpen] = useState(false)

  // Role names for the administrator form's role select.
  const rolesQuery = useRoles({ per_page: 100, sort: 'name', direction: 'asc' })
  const roleNames = rolesQuery.data?.data?.map((role) => role.name) ?? []

  const selectTab = (id) => {
    setSearchParams(id === TABS[0].id ? {} : { tab: id }, { replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Administrator Management</h1>
          <p className="text-sm text-base-content/60">Manage administrator accounts, roles and permissions.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {activeTab === 'roles' && (
            <Button onClick={() => setRoleFormOpen(true)}>
              <Plus className="size-4" />
              Add role
            </Button>
          )}
          {activeTab === 'administrators' && (
            <Button onClick={() => setAdminFormOpen(true)}>
              <UserPlus className="size-4" />
              Add administrator
            </Button>
          )}
        </div>
      </div>

      <div role="tablist" aria-label="Administrator management sections" className="tabs tabs-bordered w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`admin-tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`admin-panel-${id}`}
            tabIndex={activeTab === id ? 0 : -1}
            className={`tab text-base ${activeTab === id ? 'tab-active font-bold text-primary' : ''}`}
            onClick={() => selectTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {TABS.map(({ id, Component }) => (
        <section
          key={id}
          id={`admin-panel-${id}`}
          role="tabpanel"
          aria-labelledby={`admin-tab-${id}`}
          tabIndex={0}
          hidden={activeTab !== id}
          className="outline-none"
        >
          <Component />
        </section>
      ))}

      {/* Create modals — opened from the page header, independent of the tab. */}
      <RoleFormModal open={roleFormOpen} onClose={() => setRoleFormOpen(false)} role={null} />

      <AdministratorFormModal
        open={adminFormOpen}
        onClose={() => setAdminFormOpen(false)}
        administrator={null}
        roles={roleNames}
      />
    </div>
  )
}
