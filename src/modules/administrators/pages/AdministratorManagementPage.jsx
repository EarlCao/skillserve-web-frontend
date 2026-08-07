import { useSearchParams } from 'react-router-dom'
import AdministratorsPage from './AdministratorsPage'
import RolesPage from './RolesPage'
import PermissionsPage from './PermissionsPage'

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
 * own search/filter/pagination state while switching.
 */
export default function AdministratorManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab = TABS.find((tab) => tab.id === requestedTab)?.id ?? 'administrators'

  const selectTab = (id) => {
    setSearchParams(id === TABS[0].id ? {} : { tab: id }, { replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Administrator Management</h1>
        <p className="text-sm text-base-content/60">Manage administrator accounts, roles and permissions.</p>
      </div>

      <div role="tablist" aria-label="Administrator management sections" className="tabs tabs-boxed w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`admin-tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`admin-panel-${id}`}
            tabIndex={activeTab === id ? 0 : -1}
            className={`tab ${activeTab === id ? 'tab-active' : ''}`}
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
    </div>
  )
}
