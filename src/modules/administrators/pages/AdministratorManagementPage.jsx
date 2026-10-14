import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, UserPlus } from 'lucide-react'
import Button from '../../../components/ui/Button'
import PageHeader from '../../../components/common/PageHeader'
import AdministratorsPage from './AdministratorsPage'
import RolesPage from './RolesPage'
import PermissionsPage from './PermissionsPage'
import AdministratorFormModal from '../components/AdministratorFormModal'
import RoleFormModal from '../components/RoleFormModal'
import { useAuth } from '../../../contexts/AuthContext'
import { hasCapability } from '../../../utils/permissions'

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
  const { user } = useAuth()
  const canCreateAdministrator = hasCapability(user, 'create administrators', 'manage administrators')
  const canManageRoles = hasCapability(user, 'manage administrators')
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab = TABS.find((tab) => tab.id === requestedTab)?.id ?? 'administrators'

  const [adminFormOpen, setAdminFormOpen] = useState(false)
  const [roleFormOpen, setRoleFormOpen] = useState(false)

  const selectTab = (id) => {
    setSearchParams(id === TABS[0].id ? {} : { tab: id }, { replace: true })
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Administrator Management"
        description="Staff accounts, their roles, and what each role may view and control."
        actions={
          <>
            {activeTab === 'roles' && canManageRoles && (
              <Button onClick={() => setRoleFormOpen(true)}>
                <Plus className="size-4" />
                Add role
              </Button>
            )}
            {activeTab === 'administrators' && canCreateAdministrator && (
              <Button onClick={() => setAdminFormOpen(true)}>
                <UserPlus className="size-4" />
                Add administrator
              </Button>
            )}
          </>
        }
      />

      <div role="tablist" aria-label="Administrator management sections" className="-mb-1 flex gap-1 border-b border-base-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`admin-tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`admin-panel-${id}`}
            tabIndex={activeTab === id ? 0 : -1}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-base-content/60 hover:border-base-300 hover:text-base-content'
            }`}
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
      />
    </div>
  )
}
