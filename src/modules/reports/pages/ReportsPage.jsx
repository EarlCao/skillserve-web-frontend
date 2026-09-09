import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Eye, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePagination } from '../../../hooks/usePagination'
import { useDisclosure } from '../../../hooks/useDisclosure'
import {
  useReports,
  useInvestigateReport,
  useAddReportNote,
  useResolveReport,
  useRejectReport,
  useTakeReportAction,
} from '../hooks/useReports'
import ReportStatusBadge from '../components/ReportStatusBadge'
import ReportTypeBadge from '../components/ReportTypeBadge'
import ReportDetailsModal from '../components/ReportDetailsModal'
import ReportActionModal from '../components/ReportActionModal'
import ReportTextModal from '../components/ReportTextModal'
import { reportableLabel, reportableSubtitle } from '../utils/reportable'
import { useAuth } from '../../../contexts/AuthContext'
import { hasCapability } from '../../../utils/permissions'

const PER_PAGE = 10

const REASONS = [
  'spam',
  'harassment',
  'inappropriate_content',
  'fraud',
  'misleading',
  'offensive',
  'other',
]

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

/**
 * Reports and Moderation management list: server-side search, type/status/
 * reason filters, sorting, pagination, and the report lifecycle actions
 * (investigate, add note, take moderation action, resolve, reject).
 */
export default function ReportsPage() {
  const { user: currentUser } = useAuth()
  const can = (permission) => hasCapability(currentUser, permission, 'manage reports')
  const canModerationAction = (type, action) => {
    if (action === 'suspend') return hasCapability(currentUser, 'suspend users', 'manage users')
    if (action === 'ban') return hasCapability(currentUser, 'ban users', 'manage users')
    if (type === 'service') return hasCapability(currentUser, 'edit services', 'manage services')
    if (type === 'review' && action === 'hide') return hasCapability(currentUser, 'edit reviews', 'manage reviews')
    if (type === 'review' && action === 'remove') return hasCapability(currentUser, 'delete reviews', 'manage reviews')

    return hasCapability(currentUser, 'manage moderation', 'manage reports')
  }
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState('desc')
  const pagination = usePagination({ perPage: PER_PAGE })

  const [viewing, setViewing] = useState(null)
  const [actionTarget, setActionTarget] = useState(null)
  const [noteTarget, setNoteTarget] = useState(null)
  const [investigateTarget, setInvestigateTarget] = useState(null)
  const [resolveTarget, setResolveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  const actionDisclosure = useDisclosure()
  const noteDisclosure = useDisclosure()
  const investigateDisclosure = useDisclosure()
  const resolveDisclosure = useDisclosure()
  const rejectDisclosure = useDisclosure()

  const investigateMutation = useInvestigateReport()
  const noteMutation = useAddReportNote()
  const resolveMutation = useResolveReport()
  const rejectMutation = useRejectReport()
  const actionMutation = useTakeReportAction()

  const { data, isLoading, isFetching, isError, error, refetch } = useReports({
    search: debouncedSearch || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    reason: reasonFilter || undefined,
    sort,
    direction,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const reports = data?.data ?? []
  const paginationMeta = data?.meta?.pagination

  const applyFilter = (setter) => (value) => {
    setter(value)
    pagination.setCurrentPage(1)
  }

  useEffect(() => {
    if (paginationMeta && pagination.currentPage > paginationMeta.last_page) {
      pagination.setCurrentPage(paginationMeta.last_page)
    }
  }, [paginationMeta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const settleModal = (disclosure, setter) => {
    disclosure.close()
    setter(null)
    setViewing(null)
  }

  const columns = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <ReportTypeBadge type={row.original.type} />,
    },
    {
      accessorKey: 'reportable',
      header: 'Reported item',
      cell: ({ row }) => {
        const label = reportableLabel(row.original)
        const subtitle = reportableSubtitle(row.original)

        return (
          <div className="flex max-w-[220px] flex-col">
            <span className="truncate font-medium" title={label}>{label}</span>
            {subtitle && <span className="truncate text-xs text-base-content/60" title={subtitle}>{subtitle}</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'reporter',
      header: 'Reporter',
      cell: ({ row }) => (
        <div className="flex max-w-[160px] flex-col">
          <span className="font-medium">{row.original.reporter?.name}</span>
          <span className="text-xs text-base-content/60">{row.original.reporter?.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.original.reason?.replaceAll('_', ' ')}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <ReportStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'created_at',
      header: 'Reported',
      cell: ({ row }) => {
        const value = formatDateTime(row.original.created_at)
        return value ? <span className="whitespace-nowrap">{value}</span> : <span className="text-base-content/40">—</span>
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewing(row.original.id)}
            aria-label={`View report #${row.original.id}`}
            title="View details"
          >
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Reports and Moderation</h1>
        <p className="text-sm text-base-content/60">
          Review reports against users, services, reviews, and messages; investigate, moderate, and close them.
        </p>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by reason, description, reporter…"
            className="w-44 shrink min-w-0 sm:w-64"
          />

          <select
            className="select select-bordered select-sm w-28 shrink-0"
            value={typeFilter}
            onChange={(event) => applyFilter(setTypeFilter)(event.target.value)}
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            <option value="user">User</option>
            <option value="service">Service</option>
            <option value="review">Review</option>
            <option value="message">Message</option>
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={statusFilter}
            onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="select select-bordered select-sm w-36 shrink-0"
            value={reasonFilter}
            onChange={(event) => applyFilter(setReasonFilter)(event.target.value)}
            aria-label="Filter by reason"
          >
            <option value="">All reasons</option>
            {REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason.replaceAll('_', ' ')}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm w-32 shrink-0"
            value={sort}
            onChange={(event) => applyFilter(setSort)(event.target.value)}
            aria-label="Sort by"
          >
            <option value="created_at">Reported date</option>
            <option value="status">Status</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0 whitespace-nowrap"
            onClick={() => setDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}
          >
            {direction === 'asc' ? 'Ascending' : 'Descending'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh reports"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load reports" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={reports}
            isLoading={isLoading}
            emptyTitle="No reports found"
            emptyDescription="Try adjusting your search or filters."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
          <p className="text-sm text-base-content/60">
            {paginationMeta ? `${paginationMeta.from ?? 0}–${paginationMeta.to ?? 0} of ${paginationMeta.total}` : ''}
          </p>
          <Pagination totalItems={paginationMeta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
        </div>
      </Card>

      <ReportDetailsModal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        reportId={viewing}
        onInvestigate={can('investigate reports') ? (report) => { setInvestigateTarget(report); investigateDisclosure.open(); } : undefined}
        onAddNote={can('investigate reports') ? (report) => { setNoteTarget(report); noteDisclosure.open(); } : undefined}
        onTakeAction={can('manage moderation') ? (report) => { setActionTarget(report); actionDisclosure.open(); } : undefined}
        onResolve={can('resolve reports') ? (report) => { setResolveTarget(report); resolveDisclosure.open(); } : undefined}
        onReject={can('resolve reports') ? (report) => { setRejectTarget(report); rejectDisclosure.open(); } : undefined}
      />

      <ReportTextModal
        key={investigateTarget?.id ?? 'investigate'}
        open={investigateDisclosure.isOpen}
        onClose={() => settleModal(investigateDisclosure, setInvestigateTarget)}
        title="Investigate Report"
        description="Assign yourself as the investigator. You can optionally add an opening note."
        label="Opening note"
        placeholder="Optional note about the investigation…"
        required={false}
        confirmText="Start investigation"
        variant="primary"
        loading={investigateMutation.isPending}
        onConfirm={(note) =>
          investigateMutation.mutate(
            { id: investigateTarget?.id, note: note || undefined },
            { onSuccess: () => settleModal(investigateDisclosure, setInvestigateTarget) },
          )
        }
      />

      <ReportTextModal
        key={noteTarget?.id ?? 'note'}
        open={noteDisclosure.isOpen}
        onClose={() => settleModal(noteDisclosure, setNoteTarget)}
        title="Add Investigation Note"
        description="Record findings from your investigation."
        label="Note"
        placeholder="Enter your findings…"
        confirmText="Add note"
        variant="secondary"
        loading={noteMutation.isPending}
        onConfirm={(note) =>
          noteMutation.mutate(
            { id: noteTarget?.id, note },
            { onSuccess: () => settleModal(noteDisclosure, setNoteTarget) },
          )
        }
      />

      <ReportTextModal
        key={resolveTarget?.id ?? 'resolve'}
        open={resolveDisclosure.isOpen}
        onClose={() => settleModal(resolveDisclosure, setResolveTarget)}
        title="Resolve Report"
        description="Mark this report as resolved after the appropriate action has been completed."
        label="Resolution note"
        placeholder="Describe the action taken to close this report…"
        confirmText="Resolve report"
        variant="success"
        loading={resolveMutation.isPending}
        onConfirm={(resolutionNote) =>
          resolveMutation.mutate(
            { id: resolveTarget?.id, resolutionNote },
            { onSuccess: () => settleModal(resolveDisclosure, setResolveTarget) },
          )
        }
      />

      <ReportTextModal
        key={rejectTarget?.id ?? 'reject'}
        open={rejectDisclosure.isOpen}
        onClose={() => settleModal(rejectDisclosure, setRejectTarget)}
        title="Reject Report"
        description="Mark this report as invalid when no violation is found."
        label="Rejection reason"
        placeholder="Why is this report being rejected?"
        confirmText="Reject report"
        variant="error"
        loading={rejectMutation.isPending}
        onConfirm={(reason) =>
          rejectMutation.mutate(
            { id: rejectTarget?.id, reason },
            { onSuccess: () => settleModal(rejectDisclosure, setRejectTarget) },
          )
        }
      />

      <ReportActionModal
        key={actionTarget?.id ?? 'action'}
        open={actionDisclosure.isOpen}
        onClose={() => settleModal(actionDisclosure, setActionTarget)}
        report={actionTarget}
        loading={actionMutation.isPending}
        canAction={canModerationAction}
        onConfirm={(payload) =>
          actionMutation.mutate(
            { id: actionTarget?.id, ...payload },
            { onSuccess: () => settleModal(actionDisclosure, setActionTarget) },
          )
        }
      />
    </div>
  )
}
