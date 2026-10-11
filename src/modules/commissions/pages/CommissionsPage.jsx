import { useEffect, useState } from 'react'
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import DataTable from '../../../components/tables/DataTable'
import Pagination from '../../../components/tables/Pagination'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import { useAuth } from '../../../contexts/AuthContext'
import { useDebounce } from '../../../hooks/useDebounce'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { usePagination } from '../../../hooks/usePagination'
import { formatCurrency, formatDateTime } from '../../../utils'
import { hasCapability } from '../../../utils/permissions'
import CommissionStatusBadge from '../components/CommissionStatusBadge'
import CommissionTierModal from '../components/CommissionTierModal'
import ReviewRemittanceModal from '../components/ReviewRemittanceModal'
import SettleCommissionModal from '../components/SettleCommissionModal'
import { useAttentionCounts } from '../../dashboard/hooks/useAttentionCounts'
import {
  useCommissionRemittances,
  useCommissions,
  useCommissionTiers,
  useConfirmRemittance,
  useCreateCommissionTier,
  useDeleteCommissionTier,
  useRejectRemittance,
  useSettleCommission,
  useUpdateCommissionTier,
  useWaiveCommission,
} from '../hooks/useCommissions'

const PER_PAGE = 10

const TABS = [
  { id: 'tiers', label: 'Tiers' },
  { id: 'ledger', label: 'Commissions & Payments' },
  { id: 'payments', label: 'Provider payments' },
]

const REMITTANCE_STATUSES = {
  pending: { variant: 'warning', label: 'Waiting' },
  confirmed: { variant: 'success', label: 'Confirmed' },
  rejected: { variant: 'error', label: 'Rejected' },
  expired: { variant: 'neutral', label: 'QR expired' },
  failed: { variant: 'neutral', label: 'Failed' },
}

// How the provider paid: a GCash reference a reviewer checks, or a PayMongo
// QR Ph code PayMongo confirms by itself.
const REMITTANCE_METHODS = {
  gcash_reference: 'GCash reference',
  qrph: 'QR Ph (PayMongo)',
}

const range = (tier) =>
  `${formatCurrency(tier.min_amount)} – ${tier.is_open_ended ? 'above' : formatCurrency(tier.max_amount)}`

/**
 * Commission configuration and the settlement ledger.
 *
 * The commission is inclusive: it comes out of the price the provider
 * advertises, so the customer pays that price and the provider receives the
 * rest. The ledger therefore doubles as the payment view — it carries the
 * payment status, method and date alongside what SkillServe earned — while
 * marking a booking paid or refunding it stays on Booking Management, where
 * those actions already live.
 */
export default function CommissionsPage() {
  const { user } = useAuth()
  const canManageTiers = hasCapability(user, 'manage commissions')
  const canSettle = hasCapability(user, 'settle commissions')

  const [searchParams, setSearchParams] = useSearchParams()
  const tab = TABS.some((entry) => entry.id === searchParams.get('tab')) ? searchParams.get('tab') : 'tiers'

  const selectTab = (id) => setSearchParams(id === 'tiers' ? {} : { tab: id }, { replace: true })
  const { pendingCommissionRemittances } = useAttentionCounts()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Commission Management</h1>
        <p className="text-sm text-base-content/60">
          Configure what SkillServe charges, and track whether providers have remitted it. The
          commission is included in the price a provider advertises — the customer pays that price
          and the provider receives the rest.
        </p>
      </div>

      <div role="tablist" className="tabs tabs-boxed w-fit">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className={`tab ${tab === entry.id ? 'tab-active' : ''}`}
            onClick={() => selectTab(entry.id)}
          >
            {entry.label}
            {entry.id === 'payments' && pendingCommissionRemittances > 0 && (
              <span className="badge badge-error badge-sm ms-2" aria-label={`${pendingCommissionRemittances} waiting for confirmation`}>
                {pendingCommissionRemittances}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'tiers' && <TiersTab canManage={canManageTiers} />}
      {tab === 'ledger' && <LedgerTab canSettle={canSettle} />}
      {tab === 'payments' && <PaymentsTab canSettle={canSettle} />}
    </div>
  )
}

function TiersTab({ canManage }) {
  const pagination = usePagination({ perPage: PER_PAGE })
  const [activeFilter, setActiveFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const formDisclosure = useDisclosure()
  const confirmDisclosure = useDisclosure()

  const createMutation = useCreateCommissionTier()
  const updateMutation = useUpdateCommissionTier()
  const deleteMutation = useDeleteCommissionTier()

  const { data, isLoading, isFetching, isError, error, refetch } = useCommissionTiers({
    is_active: activeFilter === '' ? undefined : activeFilter === 'active',
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const tiers = data?.data ?? []
  const meta = data?.meta?.pagination

  useEffect(() => {
    if (meta && pagination.currentPage > meta.last_page) pagination.setCurrentPage(meta.last_page)
  }, [meta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null)
    formDisclosure.open()
  }

  const openEdit = (tier) => {
    setEditing(tier)
    formDisclosure.open()
  }

  const submitTier = (payload) => {
    const options = { onSuccess: () => formDisclosure.close() }

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload }, options)
      return
    }

    createMutation.mutate(payload, options)
  }

  const columns = [
    { accessorKey: 'name', header: 'Tier', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { id: 'range', header: 'Booking amount', cell: ({ row }) => range(row.original) },
    {
      accessorKey: 'percentage',
      header: 'Commission',
      cell: ({ row }) => <span className="font-mono">{row.original.percentage}%</span>,
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) =>
        row.original.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Disabled</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        canManage ? (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)} aria-label={`Edit ${row.original.name}`}>
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDeleting(row.original)
                confirmDisclosure.open()
              }}
              aria-label={`Retire ${row.original.name}`}
            >
              <Trash2 className="size-4 text-error" />
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <Card bodyClassName="p-0">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
        <select
          className="select select-bordered select-sm w-36 shrink-0"
          value={activeFilter}
          onChange={(event) => {
            setActiveFilter(event.target.value)
            pagination.setCurrentPage(1)
          }}
          aria-label="Filter by status"
        >
          <option value="">All tiers</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>

        <Button variant="outline" size="sm" className="shrink-0" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh tiers">
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>

        {canManage && (
          <Button size="sm" className="ml-auto shrink-0" onClick={openCreate}>
            <Plus className="size-4" /> New tier
          </Button>
        )}
      </div>

      {isError ? (
        <ErrorState title="Could not load commission tiers" message={error?.message} onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={tiers}
          isLoading={isLoading}
          emptyTitle="No commission tiers yet"
          emptyDescription="Until a tier is configured, the legacy flat commission rate in System Settings applies."
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
        <p className="text-sm text-base-content/60">
          {meta ? `${meta.from ?? 0}–${meta.to ?? 0} of ${meta.total}` : ''}
        </p>
        <Pagination totalItems={meta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
      </div>

      <CommissionTierModal
        key={editing ? `edit-${editing.id}-${formDisclosure.isOpen}` : `create-${formDisclosure.isOpen}`}
        open={formDisclosure.isOpen}
        onClose={formDisclosure.close}
        onSubmit={submitTier}
        loading={createMutation.isPending || updateMutation.isPending}
        tier={editing}
      />

      <ConfirmDialog
        open={confirmDisclosure.isOpen}
        onCancel={confirmDisclosure.close}
        onConfirm={() => {
          // Guarded: the React Compiler memoises this handler on what it
          // reads, and an unguarded `deleting.id` was evaluated during render
          // while nothing was selected, crashing the page.
          if (!deleting) return
          deleteMutation.mutate(deleting.id, { onSuccess: () => confirmDisclosure.close() })
        }}
        loading={deleteMutation.isPending}
        title="Retire this commission tier?"
        description={
          deleting
            ? `"${deleting.name}" (${range(deleting)}) will stop applying to new bookings. Bookings already charged under it keep their own rate and are unaffected.`
            : ''
        }
        confirmText="Retire tier"
      />
    </Card>
  )
}

function LedgerTab({ canSettle }) {
  const pagination = usePagination({ perPage: PER_PAGE })
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState('')
  const [target, setTarget] = useState(null) // { commission, mode }
  const settleDisclosure = useDisclosure()

  const settleMutation = useSettleCommission()
  const waiveMutation = useWaiveCommission()

  const { data, isLoading, isFetching, isError, error, refetch } = useCommissions({
    search: debouncedSearch || undefined,
    status: status || undefined,
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const rows = data?.data ?? []
  const meta = data?.meta?.pagination
  const totals = data?.meta?.totals

  useEffect(() => {
    if (meta && pagination.currentPage > meta.last_page) pagination.setCurrentPage(meta.last_page)
  }, [meta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const openAction = (commission, mode) => {
    setTarget({ commission, mode })
    settleDisclosure.open()
  }

  const confirmAction = (payload) => {
    if (!target) return

    const options = { onSuccess: () => settleDisclosure.close() }

    if (target.mode === 'waive') {
      waiveMutation.mutate({ bookingId: target.commission.booking_id, reason: payload.reason }, options)
      return
    }

    settleMutation.mutate({ bookingId: target.commission.booking_id, payload }, options)
  }

  const columns = [
    {
      accessorKey: 'booking_number',
      header: 'Booking',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs">{row.original.booking_number}</span>
          <span className="text-xs text-base-content/60">{row.original.service?.title ?? '—'}</span>
        </div>
      ),
    },
    {
      id: 'provider',
      header: 'Provider',
      cell: ({ row }) => row.original.provider?.business_name ?? '—',
    },
    {
      id: 'amounts',
      header: 'Customer pays / provider gets',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{formatCurrency(row.original.total_price)}</span>
          <span className="text-xs text-base-content/60">{formatCurrency(row.original.net_amount)} to provider</span>
        </div>
      ),
    },
    {
      id: 'commission',
      header: 'Commission',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{formatCurrency(row.original.commission_amount)}</span>
          <span className="text-xs text-base-content/60">
            {row.original.commission_rate ? `${row.original.commission_rate}%` : 'legacy rate'}
          </span>
        </div>
      ),
    },
    {
      id: 'payment',
      header: 'Payment',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="capitalize">{(row.original.payment_method ?? '—').replace(/_/g, ' ')}</span>
          <span className="text-xs text-base-content/60">
            {row.original.paid_at ? formatDateTime(row.original.paid_at) : row.original.payment_status}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'commission_status',
      header: 'Commission status',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <CommissionStatusBadge status={row.original.commission_status} />
          {row.original.settlement && (
            <span className="text-xs text-base-content/60">
              via {row.original.settlement.method.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        canSettle && row.original.commission_status === 'outstanding' ? (
          <div className="flex justify-end gap-1">
            <Button variant="outline" size="sm" onClick={() => openAction(row.original, 'settle')}>
              Settle
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openAction(row.original, 'waive')}>
              Waive
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {totals && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-base-content/60">Outstanding</p>
            <p className="text-2xl font-bold text-warning">{formatCurrency(totals.outstanding)}</p>
            <p className="text-xs text-base-content/60">Held by providers, not yet remitted</p>
          </Card>
          <Card>
            <p className="text-sm text-base-content/60">Settled</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(totals.settled)}</p>
          </Card>
          <Card>
            <p className="text-sm text-base-content/60">Waived</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.waived)}</p>
          </Card>
        </div>
      )}

      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              pagination.setCurrentPage(1)
            }}
            placeholder="Search by booking number…"
            className="w-44 shrink min-w-0 sm:w-60"
          />

          <select
            className="select select-bordered select-sm w-40 shrink-0"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              pagination.setCurrentPage(1)
            }}
            aria-label="Filter by commission status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="outstanding">Outstanding</option>
            <option value="settled">Settled</option>
            <option value="waived">Waived</option>
            <option value="voided">Voided</option>
          </select>

          <Button variant="outline" size="sm" className="shrink-0" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh commissions">
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load commissions" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyTitle="No commissions yet"
            emptyDescription="A commission appears here once a booking is created, and becomes outstanding once it is paid for."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
          <p className="text-sm text-base-content/60">
            {meta ? `${meta.from ?? 0}–${meta.to ?? 0} of ${meta.total}` : ''}
          </p>
          <Pagination totalItems={meta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
        </div>
      </Card>

      <SettleCommissionModal
        key={target ? `${target.commission.booking_id}-${target.mode}-${settleDisclosure.isOpen}` : 'closed'}
        open={settleDisclosure.isOpen}
        onClose={settleDisclosure.close}
        onConfirm={confirmAction}
        loading={settleMutation.isPending || waiveMutation.isPending}
        commission={target?.commission}
        mode={target?.mode ?? 'settle'}
      />
    </div>
  )
}

/**
 * Commission payments providers made: GCash references a reviewer checks, and
 * PayMongo QR Ph payments that confirm themselves. For a GCash reference the
 * reviewer finds it in SkillServe's GCash history, then confirms
 * (settling the bookings it covered) or rejects it with a reason.
 */
function PaymentsTab({ canSettle }) {
  const pagination = usePagination({ perPage: PER_PAGE })
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState('pending')
  const [target, setTarget] = useState(null) // { remittance, mode }
  const reviewDisclosure = useDisclosure()

  const confirmMutation = useConfirmRemittance()
  const rejectMutation = useRejectRemittance()

  const { data, isLoading, isFetching, isError, error, refetch } = useCommissionRemittances({
    search: debouncedSearch || undefined,
    status: status || undefined,
    // The queue is worked oldest first; history reads newest first.
    direction: status === 'pending' ? 'asc' : 'desc',
    per_page: PER_PAGE,
    page: pagination.currentPage,
  })

  const rows = data?.data ?? []
  const meta = data?.meta?.pagination

  useEffect(() => {
    if (meta && pagination.currentPage > meta.last_page) pagination.setCurrentPage(meta.last_page)
  }, [meta?.last_page]) // eslint-disable-line react-hooks/exhaustive-deps

  const openReview = (remittance, mode) => {
    setTarget({ remittance, mode })
    reviewDisclosure.open()
  }

  const submitReview = (payload) => {
    if (!target) return

    const options = { onSuccess: () => reviewDisclosure.close() }

    if (target.mode === 'reject') {
      rejectMutation.mutate({ id: target.remittance.id, reason: payload.reason }, options)
      return
    }

    confirmMutation.mutate({ id: target.remittance.id, notes: payload.notes }, options)
  }

  const columns = [
    {
      accessorKey: 'reference',
      header: 'GCash reference',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono">{row.original.reference}</span>
          <span className="text-xs text-base-content/60">
            {REMITTANCE_METHODS[row.original.method] ?? row.original.method} · {formatDateTime(row.original.submitted_at)}
          </span>
          {row.original.other_claims_count > 0 && (
            <Badge variant="warning" size="sm" className="mt-1">
              Also claimed by another provider
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'provider',
      header: 'Provider',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.provider?.business_name ?? '—'}</span>
          <span className="text-xs text-base-content/60">
            {row.original.provider?.gcash_number ? `GCash ${row.original.provider.gcash_number}` : 'No GCash on file'}
          </span>
        </div>
      ),
    },
    {
      id: 'amounts',
      header: 'Sent / owed',
      cell: ({ row }) => {
        const short = Number(row.original.amount_sent) < Number(row.original.amount_due)

        return (
          <div className="flex flex-col">
            <span className={`font-medium ${short ? 'text-error' : ''}`}>{formatCurrency(row.original.amount_sent)}</span>
            <span className="text-xs text-base-content/60">
              {formatCurrency(row.original.amount_due)} owed on {row.original.bookings?.length ?? 0}{' '}
              {row.original.bookings?.length === 1 ? 'booking' : 'bookings'}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { variant, label } = REMITTANCE_STATUSES[row.original.status] ?? { variant: 'neutral', label: row.original.status }

        return (
          <div className="flex flex-col gap-1">
            <Badge variant={variant}>{label}</Badge>
            {row.original.reviewed_by && (
              <span className="text-xs text-base-content/60">by {row.original.reviewed_by.name}</span>
            )}
            {row.original.status === 'rejected' && row.original.review_notes && (
              <span className="max-w-56 text-xs text-base-content/60">{row.original.review_notes}</span>
            )}
            {row.original.failure_reason && (
              <span className="max-w-56 text-xs text-error">{row.original.failure_reason}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        canSettle && row.original.status === 'pending' ? (
          <div className="flex justify-end gap-1">
            <Button variant="outline" size="sm" onClick={() => openReview(row.original, 'confirm')}>
              Confirm
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openReview(row.original, 'reject')}>
              Reject
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card bodyClassName="p-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4">
          <SearchInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              pagination.setCurrentPage(1)
            }}
            placeholder="Search by reference or provider…"
            className="w-44 shrink min-w-0 sm:w-64"
          />

          <select
            className="select select-bordered select-sm w-44 shrink-0"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              pagination.setCurrentPage(1)
            }}
            aria-label="Filter by payment status"
          >
            <option value="pending">Waiting for confirmation</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="expired">QR expired</option>
            <option value="failed">Failed</option>
            <option value="">All payments</option>
          </select>

          <Button variant="outline" size="sm" className="shrink-0" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh payments">
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isError ? (
          <ErrorState title="Could not load provider payments" message={error?.message} onRetry={refetch} />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyTitle={status === 'pending' ? 'No payments waiting' : 'No payments found'}
            emptyDescription="A provider's GCash-reference payment appears here for you to confirm. QR Ph payments are confirmed by PayMongo and only appear here when one needs a decision."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4">
          <p className="text-sm text-base-content/60">
            {meta ? `${meta.from ?? 0}–${meta.to ?? 0} of ${meta.total}` : ''}
          </p>
          <Pagination totalItems={meta?.total ?? 0} perPage={PER_PAGE} pagination={pagination} />
        </div>
      </Card>

      <ReviewRemittanceModal
        key={target ? `${target.remittance.id}-${target.mode}-${reviewDisclosure.isOpen}` : 'closed'}
        open={reviewDisclosure.isOpen}
        onClose={reviewDisclosure.close}
        onConfirm={submitReview}
        loading={confirmMutation.isPending || rejectMutation.isPending}
        remittance={target?.remittance}
        mode={target?.mode ?? 'confirm'}
      />
    </div>
  )
}
