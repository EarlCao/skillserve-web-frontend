import { useEffect, useState } from 'react'
import { Eye, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import { useAuth } from '../../../contexts/AuthContext'
import { useDebounce } from '../../../hooks/useDebounce'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { usePagination } from '../../../hooks/usePagination'
import { formatDateTime } from '../../../utils'
import { hasCapability } from '../../../utils/permissions'
import IdentityStatusBadge from '../components/IdentityStatusBadge'
import IdentityReviewModal from '../components/IdentityReviewModal'
import {
  useApproveIdentity,
  useIdentityVerification,
  useIdentityVerifications,
  useOpenIdentityDocument,
  useRejectIdentity,
} from '../hooks/useIdentityVerifications'

const PER_PAGE = 10

/**
 * The National ID review queue.
 *
 * Only the last four digits of a card number appear anywhere on this screen;
 * the number itself is never sent to the browser. Reviewers confirm it by
 * opening the ID image, which is fetched with their token.
 *
 * Searching matches the account's name or email — card numbers are
 * deliberately not searchable, because that would make the queue a way to test
 * whether a given ID is registered.
 */
export default function IdentityVerificationsPage() {
  const { user } = useAuth()
  const canApprove = hasCapability(user, 'verify identities')
  const canReject = hasCapability(user, 'reject identities')

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState('pending')
  const [accountType, setAccountType] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const pagination = usePagination({ perPage: PER_PAGE })
  const reviewDisclosure = useDisclosure()

  const approveMutation = useApproveIdentity()
  const rejectMutation = useRejectIdentity()
  const documentMutation = useOpenIdentityDocument()

  const { data, isLoading, isFetching, isError, error, refetch } = useIdentityVerifications({
    search: debouncedSearch || undefined,
    status: status || undefined,
    account_type: accountType || undefined,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  // The list is a summary; documents and history are only fetched when a
  // submission is actually opened.
  const detail = useIdentityVerification(reviewDisclosure.isOpen ? selectedId : null)

  const rows = data?.data ?? []
  const meta = data?.meta?.pagination

  const applyFilter = (setter) => (value) => {
    setter(value)
    pagination.setCurrentPage(1)
  }

  useEffect(() => {
    if (meta && pagination.currentPage > meta.last_page) pagination.setCurrentPage(meta.last_page)
  }, [meta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const review = (row) => {
    setSelectedId(row.id)
    reviewDisclosure.open()
  }

  const closeReview = () => {
    reviewDisclosure.close()
    setSelectedId(null)
  }

  const columns = [
    {
      id: 'account',
      header: 'Account',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.account?.name ?? '—'}</span>
          <span className="text-xs text-base-content/60">{row.original.account?.email ?? ''}</span>
        </div>
      ),
    },
    {
      id: 'account_type',
      header: 'Type',
      cell: ({ row }) => <span className="capitalize">{row.original.account?.account_type ?? '—'}</span>,
    },
    {
      accessorKey: 'full_name',
      header: 'Name on card',
      cell: ({ row }) => row.original.full_name ?? '—',
    },
    {
      accessorKey: 'id_number_last4',
      header: 'National ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.id_number_last4 ? `•••• ${row.original.id_number_last4}` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <IdentityStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted',
      cell: ({ row }) => (
        <span className="text-xs text-base-content/60">
          {row.original.submitted_at ? formatDateTime(row.original.submitted_at) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => review(row.original)} aria-label={`Review ${row.original.account?.name ?? 'submission'}`}>
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Identity Verification</h1>
        <p className="text-sm text-base-content/60">
          Review Philippine National ID submissions from customers and providers. A National ID can
          back only one active account.
        </p>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => applyFilter(setSearch)(event.target.value)}
            placeholder="Search by name or email…"
            className="w-44 shrink min-w-0 sm:w-60"
          />

          <select
            className="select select-bordered select-sm w-40 shrink-0"
            value={status}
            onChange={(event) => applyFilter(setStatus)(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="unverified">Unverified</option>
          </select>

          <select
            className="select select-bordered select-sm w-36 shrink-0"
            value={accountType}
            onChange={(event) => applyFilter(setAccountType)(event.target.value)}
            aria-label="Filter by account type"
          >
            <option value="">All accounts</option>
            <option value="customer">Customers</option>
            <option value="provider">Providers</option>
          </select>

          <Button variant="outline" size="sm" className="shrink-0" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh submissions">
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load submissions" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyTitle="Nothing to review"
            emptyDescription="Submissions appear here once an account holder sends their National ID."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
          <p className="text-sm text-base-content/60">
            {meta ? `${meta.from ?? 0}–${meta.to ?? 0} of ${meta.total}` : ''}
          </p>
          <Pagination totalItems={meta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
        </div>
      </Card>

      <IdentityReviewModal
        key={`${selectedId ?? 'none'}-${reviewDisclosure.isOpen}`}
        open={reviewDisclosure.isOpen}
        onClose={closeReview}
        verification={detail.data?.data}
        isLoading={detail.isLoading}
        canApprove={canApprove}
        canReject={canReject}
        actionLoading={approveMutation.isPending || rejectMutation.isPending}
        documentLoading={documentMutation.isPending}
        onOpenDocument={(documentId) => documentMutation.mutate({ id: selectedId, documentId })}
        onApprove={(notes) => approveMutation.mutate({ id: selectedId, notes }, { onSuccess: closeReview })}
        onReject={(reason) => rejectMutation.mutate({ id: selectedId, reason }, { onSuccess: closeReview })}
      />
    </div>
  )
}
