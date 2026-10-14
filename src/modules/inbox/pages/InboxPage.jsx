import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import PageHeader from '../../../components/common/PageHeader'
import Pagination from '../../../components/tables/Pagination'
import StatusTabs from '../../../components/tables/StatusTabs'
import { usePagination } from '../../../hooks/usePagination'
import AlertItem from '../components/AlertItem'
import { useInboxAlerts, useInboxUnreadCount, useMarkAllAlertsRead } from '../hooks/useInbox'

const PER_PAGE = 15
const TABS = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' },
]

/**
 * Everything in the app waiting for this administrator — verification
 * requests, services to approve, reports, disputes, support requests and
 * commission payments to check — limited to the areas they may manage.
 */
export default function InboxPage() {
  const [status, setStatus] = useState('')
  const pagination = usePagination({ perPage: PER_PAGE })
  const unread = useInboxUnreadCount()
  const markAll = useMarkAllAlertsRead()
  const { data, isLoading, isError, error, refetch } = useInboxAlerts({
    status: status || undefined,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })
  const alerts = data?.data ?? []
  const total = data?.meta?.pagination?.total ?? 0

  const changeTab = (value) => {
    setStatus(value)
    pagination.setCurrentPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Inbox"
        description="What users did in the app that needs an administrator, for the areas you manage."
        actions={(
          <Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={unread === 0 || markAll.isPending}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        )}
      />
      <Card bodyClassName="p-0">
        <div className="border-b border-base-200 px-4">
          <StatusTabs options={TABS.map((tab) => (tab.value === 'unread' ? { ...tab, label: `Unread (${unread})` } : tab))} value={status} onChange={changeTab} label="Filter alerts" />
        </div>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-16 w-full" />)}
          </div>
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : alerts.length === 0 ? (
          <EmptyState
            title={status === 'unread' ? 'All caught up' : 'No alerts yet'}
            description={status === 'unread'
              ? 'You have read every alert.'
              : 'New verification requests, services to approve, reports, disputes, support requests and payments to check will appear here.'}
          />
        ) : (
          <div className="flex flex-col gap-1 p-2">
            {alerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)}
          </div>
        )}
        {total > PER_PAGE && (
          <div className="border-t border-base-200 p-3">
            <Pagination totalItems={total} perPage={PER_PAGE} pagination={pagination} />
          </div>
        )}
      </Card>
    </div>
  )
}
