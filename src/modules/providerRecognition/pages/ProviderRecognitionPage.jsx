import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Award, Crown, Pencil, Plus, RefreshCw, Star, Trash2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import DataTable from '../../../components/tables/DataTable'
import ErrorState from '../../../components/common/ErrorState'
import SearchInput from '../../../components/common/SearchInput'
import Pagination from '../../../components/tables/Pagination'
import { useAuth } from '../../../contexts/AuthContext'
import { useDebounce } from '../../../hooks/useDebounce'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { usePagination } from '../../../hooks/usePagination'
import {
  useAssignBadge, useCreateBadge, useDeleteBadge, useRecognitionBadges, useRecognitionProviders,
  useRemoveBadge, useToggleFeatured, useUpdateBadge,
} from '../hooks/useProviderRecognition'
import BadgeModal from '../components/BadgeModal'

const PER_PAGE = 10
const formatDate = (value) => (value ? format(new Date(value), 'MMM d, yyyy') : '—')

function badgeVariant(color) {
  return ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'outline'].includes(color) ? color : 'neutral'
}

export default function ProviderRecognitionPage() {
  const { user } = useAuth()
  const permissions = user?.permissions ?? []
  const isSuperAdmin = user?.roles?.includes('super-admin')
  const canManageBadges = isSuperAdmin || permissions.includes('manage provider badges')
  const canAssign = isSuperAdmin || permissions.includes('assign provider badges')
  const canFeature = isSuperAdmin || permissions.includes('manage featured providers')
  const [tab, setTab] = useState('badges')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [badgeFilter, setBadgeFilter] = useState('')
  const pagination = usePagination({ perPage: PER_PAGE })
  const badgePagination = usePagination({ perPage: PER_PAGE })
  const badgeModal = useDisclosure()
  const deleteDisclosure = useDisclosure()
  const [editingBadge, setEditingBadge] = useState(null)
  const [deletingBadge, setDeletingBadge] = useState(null)

  const badgesQuery = useRecognitionBadges({ per_page: PER_PAGE, page: badgePagination.currentPage, search: tab === 'badges' ? debouncedSearch || undefined : undefined })
  const providersQuery = useRecognitionProviders({
    per_page: PER_PAGE,
    page: pagination.currentPage,
    search: debouncedSearch || undefined,
    badge_id: badgeFilter || undefined,
    is_featured: tab === 'featured' ? true : undefined,
  }, tab === 'top-rated')
  const createBadge = useCreateBadge()
  const updateBadge = useUpdateBadge()
  const deleteBadge = useDeleteBadge()
  const assignBadge = useAssignBadge()
  const removeBadge = useRemoveBadge()
  const toggleFeatured = useToggleFeatured()

  useEffect(() => {
    pagination.setCurrentPage(1)
    badgePagination.setCurrentPage(1)
  }, [tab, badgeFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const badgeRows = badgesQuery.data?.data ?? []
  const providerRows = providersQuery.data?.data ?? []
  const activeMutation = editingBadge ? updateBadge : createBadge
  const closeBadgeModal = () => { badgeModal.close(); setEditingBadge(null) }

  const providerColumns = [
    { accessorKey: 'business_name', header: 'Provider', cell: ({ row }) => <div className="flex flex-col"><span className="font-medium">{row.original.business_name || row.original.user?.name}</span><span className="text-xs text-base-content/60">{row.original.user?.email}</span></div> },
    { accessorKey: 'verification_status', header: 'Verification', cell: ({ row }) => <span className="badge badge-success badge-sm capitalize">{row.original.verification_status?.replaceAll('_', ' ')}</span> },
    { accessorKey: 'average_rating', header: 'Rating', cell: ({ row }) => <span>{Number(row.original.average_rating ?? 0).toFixed(1)} <span className="text-xs text-base-content/50">({row.original.total_reviews})</span></span> },
    { accessorKey: 'total_bookings', header: 'Bookings' },
    { accessorKey: 'badges', header: 'Badges', cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.badges?.length ? row.original.badges.map((badge) => <Badge key={badge.id} variant={badgeVariant(badge.color)} size="sm">{badge.name}</Badge>) : <span className="text-base-content/40">None</span>}</div> },
    { accessorKey: 'is_featured', header: 'Featured', cell: ({ row }) => row.original.is_featured ? <Badge variant="warning" size="sm"><Crown className="mr-1 size-3" /> Featured</Badge> : <span className="text-base-content/40">No</span> },
    { id: 'actions', header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => { const providerName = row.original.business_name || row.original.user?.name || 'provider'; return <div className="flex justify-end gap-1">
      {canAssign && <select className="select select-bordered select-xs max-w-28" value="" onChange={(event) => event.target.value && assignBadge.mutate({ providerId: row.original.id, badgeId: Number(event.target.value) })} aria-label={`Assign badge to ${row.original.business_name}`}><option value="">Assign</option>{badgeRows.filter((badge) => badge.is_active && !row.original.badges?.some((assigned) => assigned.id === badge.id)).map((badge) => <option key={badge.id} value={badge.id}>{badge.name}</option>)}</select>}
      {canFeature && <Button variant="ghost" size="sm" onClick={() => toggleFeatured.mutate({ providerId: row.original.id, isFeatured: !row.original.is_featured })} aria-label={row.original.is_featured ? `Remove featured status from ${providerName}` : `Feature ${providerName}`}>{row.original.is_featured ? <Crown className="size-4 text-warning" /> : <Star className="size-4" />}</Button>}
      {canAssign && row.original.badges?.map((badge) => <Button key={badge.id} variant="ghost" size="sm" onClick={() => removeBadge.mutate({ providerId: row.original.id, badgeId: badge.id })} aria-label={`Remove ${badge.name} from ${providerName}`} title={`Remove ${badge.name}`}><Award className="size-4 text-error" /></Button>)}
    </div> } },
  ]

  const badgeColumns = [
    { accessorKey: 'name', header: 'Badge', cell: ({ row }) => <div className="flex items-center gap-2"><Award className="size-4 text-primary" /><div><p className="font-medium">{row.original.name}</p><p className="text-xs text-base-content/60">{row.original.slug}</p></div></div> },
    { accessorKey: 'description', header: 'Description', cell: ({ row }) => <span className="block max-w-[320px] truncate">{row.original.description || '—'}</span> },
    { accessorKey: 'color', header: 'Color', cell: ({ row }) => <Badge variant={badgeVariant(row.original.color)} size="sm">{row.original.color}</Badge> },
    { accessorKey: 'providers_count', header: 'Assigned' },
    { accessorKey: 'is_active', header: 'Status', cell: ({ row }) => <span className={`badge badge-sm ${row.original.is_active ? 'badge-success' : 'badge-ghost'}`}>{row.original.is_active ? 'Active' : 'Inactive'}</span> },
    { accessorKey: 'created_at', header: 'Created', cell: ({ row }) => formatDate(row.original.created_at) },
    { id: 'actions', header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => <div className="flex justify-end gap-1">{canManageBadges && <><Button variant="ghost" size="sm" onClick={() => { setEditingBadge(row.original); badgeModal.open() }} aria-label={`Edit ${row.original.name}`}><Pencil className="size-4" /></Button><Button variant="ghost" size="sm" onClick={() => { setDeletingBadge(row.original); deleteDisclosure.open() }} aria-label={`Delete ${row.original.name}`}><Trash2 className="size-4 text-error" /></Button></>}</div> },
  ]

  const rows = tab === 'badges' ? badgeRows : providerRows
  const isLoading = tab === 'badges' ? badgesQuery.isLoading : providersQuery.isLoading
  const isError = tab === 'badges' ? badgesQuery.isError : providersQuery.isError
  const error = tab === 'badges' ? badgesQuery.error : providersQuery.error
  const refetch = tab === 'badges' ? badgesQuery.refetch : providersQuery.refetch
  const meta = (tab === 'badges' ? badgesQuery.data?.meta : providersQuery.data?.meta)?.pagination
  const activePagination = tab === 'badges' ? badgePagination : pagination

  return <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Provider Recognition</h1><p className="text-sm text-base-content/60">Manage badges, featured providers, and top-rated recognition.</p></div>{tab === 'badges' && canManageBadges && <Button onClick={() => { setEditingBadge(null); badgeModal.open() }}><Plus className="size-4" /> New badge</Button>}</div>
    <Card><div className="flex flex-wrap gap-2"><button type="button" className={`btn btn-sm ${tab === 'badges' ? 'btn-primary' : 'btn-outline'}`} aria-pressed={tab === 'badges'} onClick={() => setTab('badges')}><Award className="size-4" /> Badges</button><button type="button" className={`btn btn-sm ${tab === 'featured' ? 'btn-primary' : 'btn-outline'}`} aria-pressed={tab === 'featured'} onClick={() => setTab('featured')}><Crown className="size-4" /> Featured providers</button><button type="button" className={`btn btn-sm ${tab === 'top-rated' ? 'btn-primary' : 'btn-outline'}`} aria-pressed={tab === 'top-rated'} onClick={() => setTab('top-rated')}><Star className="size-4" /> Top-rated providers</button></div></Card>
    <Card bodyClassName="p-0"><div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-base-200 p-4"><SearchInput value={search} onChange={(event) => { setSearch(event.target.value); pagination.setCurrentPage(1); badgePagination.setCurrentPage(1) }} placeholder={tab === 'badges' ? 'Search badges…' : 'Search providers…'} className="w-52 shrink-0" />{tab !== 'badges' && <select className="select select-bordered select-sm w-40 shrink-0" value={badgeFilter} onChange={(event) => setBadgeFilter(event.target.value)} aria-label="Filter by badge"><option value="">All badges</option>{badgeRows.map((badge) => <option key={badge.id} value={badge.id}>{badge.name}</option>)}</select>}<Button variant="outline" size="sm" onClick={() => refetch()} aria-label="Refresh recognition data"><RefreshCw className="size-4" /></Button></div>{isError ? <ErrorState title="Could not load recognition data" message={error?.message} onRetry={refetch} /> : <DataTable key={tab} columns={tab === 'badges' ? badgeColumns : providerColumns} data={rows} isLoading={isLoading} emptyTitle={tab === 'badges' ? 'No badges found' : 'No providers found'} emptyDescription="Try adjusting your search or filters." />}<div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 p-4"><p className="text-sm text-base-content/60">{meta ? `${meta.from ?? 0}–${meta.to ?? 0} of ${meta.total}` : ''}</p><Pagination totalItems={meta?.total ?? 0} perPage={PER_PAGE} pagination={activePagination} /></div></Card>
    <BadgeModal key={`${editingBadge?.id ?? 'new'}-${badgeModal.isOpen}`} open={badgeModal.isOpen} onClose={closeBadgeModal} badge={editingBadge} mutation={activeMutation} />
     <ConfirmDialog open={deleteDisclosure.isOpen} onCancel={deleteDisclosure.close} onConfirm={() => deleteBadge.mutate(deletingBadge?.id, { onSuccess: () => { deleteDisclosure.close(); setDeletingBadge(null) } })} loading={deleteBadge.isPending} title="Delete badge?" description={`Delete "${deletingBadge?.name ?? ''}"? Assigned providers will lose this badge.`} confirmText="Delete badge" variant="error" />
  </div>
}
