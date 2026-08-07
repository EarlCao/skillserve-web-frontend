import { useState } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, Ban, Pencil, Power, Trash2, UserCheck, Wrench } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Skeleton from '../../../components/ui/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useUser, useActivateUser, useBanUser, useDeleteUser, useSuspendUser, useUnbanUser } from '../hooks/useUsers'
import UserAvatar from '../components/UserAvatar'
import UserStatusBadge from '../components/UserStatusBadge'
import VerificationBadge from '../components/VerificationBadge'
import UserFormModal from '../components/UserFormModal'
import UserActionModal from '../components/UserActionModal'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : '—')

const prettyActivity = (description) =>
  (description ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

/**
 * Detailed user profile: personal information, account details, moderation
 * history, recent activity and (placeholder) platform counters.
 */
export default function UserProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useUser(userId)
  const user = data?.data

  const [editing, setEditing] = useState(false)
  const [moderationTarget, setModerationTarget] = useState(null) // { user, action }
  const [confirmTarget, setConfirmTarget] = useState(null) // { user, action }
  const actionDisclosure = useDisclosure()
  const confirmDisclosure = useDisclosure()

  const suspendMutation = useSuspendUser()
  const activateMutation = useActivateUser()
  const banMutation = useBanUser()
  const unbanMutation = useUnbanUser()
  const deleteMutation = useDeleteUser()

  const isBanned = user?.status === 'banned'
  const isSuspended = user?.status === 'suspended'

  const moderationMutation =
    moderationTarget?.action === 'ban'
      ? banMutation
      : moderationTarget?.action === 'unban'
        ? unbanMutation
        : suspendMutation

  const confirmModeration = (payload) => {
    const target = moderationTarget
    if (!target) return

    if (target.action === 'ban') {
      banMutation.mutate({ id: target.user.id, ...payload }, { onSettled: () => actionDisclosure.close() })
    } else if (target.action === 'unban') {
      unbanMutation.mutate({ id: target.user.id, reason: payload || undefined }, { onSettled: () => actionDisclosure.close() })
    } else {
      suspendMutation.mutate({ id: target.user.id, reason: payload }, { onSettled: () => actionDisclosure.close() })
    }
  }

  const confirmSimpleAction = () => {
    const target = confirmTarget
    if (!target) return

    if (target.action === 'activate') {
      activateMutation.mutate(target.user.id, { onSettled: () => confirmDisclosure.close() })
    } else {
      deleteMutation.mutate(target.user.id, {
        onSuccess: () => navigate('/admin/users'),
        onSettled: () => confirmDisclosure.close(),
      })
    }
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load the user profile"
        message={error?.message}
        onRetry={refetch}
      />
    )
  }

  const isActivateConfirm = confirmTarget?.action === 'activate'
  const summary = user?.summary ?? {}
  const activity = summary.recent_activity ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/users" className="btn btn-ghost btn-sm" aria-label="Back to users">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isLoading ? 'User profile' : user.name}</h1>
            <p className="text-sm text-base-content/60">User profile and account management.</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user && (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="size-4" />
                Edit
              </Button>
              {!isBanned &&
                (isSuspended ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfirmTarget({ user, action: 'activate' })
                      confirmDisclosure.open()
                    }}
                  >
                    <Power className="size-4 text-success" />
                    Activate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setModerationTarget({ user, action: 'suspend' })
                      actionDisclosure.open()
                    }}
                  >
                    <Power className="size-4 text-warning" />
                    Suspend
                  </Button>
                ))}
              {!isBanned && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModerationTarget({ user, action: 'ban' })
                    actionDisclosure.open()
                  }}
                >
                  <Ban className="size-4 text-error" />
                  Ban
                </Button>
              )}
              {isBanned && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModerationTarget({ user, action: 'unban' })
                    actionDisclosure.open()
                  }}
                >
                  <UserCheck className="size-4 text-success" />
                  Unban
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmTarget({ user, action: 'delete' })
                  confirmDisclosure.open()
                }}
              >
                <Trash2 className="size-4 text-error" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Identity header */}
      <Card bodyClassName="flex flex-col gap-4 sm:flex-row sm:items-center">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        ) : (
          <>
            <UserAvatar name={user.name} size="lg" />
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold">{user.name}</span>
                <UserStatusBadge status={user.status} bannedUntil={user.banned_until} />
                <VerificationBadge verified={user.verification === 'verified'} />
                <Badge variant="secondary" className="capitalize">
                  {user.user_type}
                </Badge>
              </div>
              <p className="text-sm text-base-content/60">{user.email}</p>
            </div>
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Personal information */}
        <Card title="Personal information" description="Profile fields editable by administrators.">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProfileField label="First name" value={user.first_name} />
              <ProfileField label="Last name" value={user.last_name} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField label="Phone" value={user.phone} />
              <ProfileField label="Birthday" value={user.birthday ? format(new Date(user.birthday), 'MMM d, yyyy') : null} />
              <ProfileField label="Address" value={user.address} className="sm:col-span-2" />
            </dl>
          )}
        </Card>

        {/* Account details */}
        <Card title="Account details" description="System state for this account.">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProfileField label="User type" value={user.user_type} capitalize />
              <ProfileField label="Status" value={user.status} capitalize />
              <ProfileField label="Verification" value={user.verification} capitalize />
              <ProfileField label="Roles" value={user.roles?.length ? user.roles.join(', ') : 'None'} />
              <ProfileField label="Last login" value={formatDateTime(user.last_login_at)} />
              <ProfileField label="Created at" value={formatDateTime(user.created_at)} />
              <ProfileField label="Updated at" value={formatDateTime(user.updated_at)} />
              <ProfileField label="Created by" value={user.created_by?.name ?? '—'} />
            </dl>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Moderation history */}
        <Card title="Moderation history" description="Suspension, activation and ban records for this account.">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {user.suspended_at ? (
                <HistoryItem
                  tone="warning"
                  title="Suspended"
                  date={formatDateTime(user.suspended_at)}
                  actor={user.suspended_by?.name}
                  reason={user.suspension_reason}
                />
              ) : null}
              {user.activated_at ? (
                <HistoryItem
                  tone="success"
                  title={user.unban_reason ? 'Unbanned' : 'Activated'}
                  date={formatDateTime(user.activated_at)}
                  actor={user.activated_by?.name ?? 'System'}
                  reason={user.unban_reason ?? undefined}
                />
              ) : null}
              {user.banned_at ? (
                <HistoryItem
                  tone="error"
                  title="Banned"
                  date={formatDateTime(user.banned_at)}
                  actor={user.banned_by?.name}
                  reason={user.ban_reason}
                  meta={
                    user.banned_until
                      ? `Lifted automatically on ${formatDateTime(user.banned_until)}`
                      : 'Permanent ban'
                  }
                />
              ) : null}
              {!user.suspended_at && !user.activated_at && !user.banned_at ? (
                <p className="text-sm text-base-content/40">No moderation actions recorded.</p>
              ) : null}
            </ul>
          )}
        </Card>

        {/* Recent activity */}
        <Card title="Activity" description="Recent audit activity on this account.">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-base-content/40">No activity recorded yet.</p>
          ) : (
            <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
              {activity.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-0.5 border-l-2 border-base-300 pl-3">
                  <span className="text-sm font-medium">{prettyActivity(entry.description)}</span>
                  <span className="text-xs text-base-content/60">
                    {formatDateTime(entry.logged_at)} · {entry.causer?.name ?? 'System'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Platform summary — populated by future modules */}
      <Card title="Platform summary" description="Services, bookings, ratings and reviews land with their modules.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat label="Services" value={summary.services_count ?? 0} />
          <SummaryStat label="Bookings" value={summary.bookings_count ?? 0} />
          <SummaryStat label="Ratings" value={summary.ratings_count ?? 0} />
          <SummaryStat label="Reviews" value={summary.reviews_count ?? 0} />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-base-content/50">
          <Wrench className="size-4" />
          These counters will populate automatically once the Services, Bookings and Reviews modules are live.
        </p>
      </Card>

      {user && (
        <>
          <UserFormModal open={editing} onClose={() => setEditing(false)} user={user} />

          <UserActionModal
            key={moderationTarget ? `${moderationTarget.user.id}-${moderationTarget.action}-${actionDisclosure.isOpen}` : 'closed'}
            open={actionDisclosure.isOpen}
            onClose={actionDisclosure.close}
            onConfirm={confirmModeration}
            loading={moderationMutation.isPending}
            action={moderationTarget?.action ?? 'suspend'}
            title={
              moderationTarget?.action === 'ban'
                ? 'Ban user?'
                : moderationTarget?.action === 'unban'
                  ? 'Unban user?'
                  : 'Suspend user?'
            }
            description={
              moderationTarget
                ? moderationTarget.action === 'ban'
                  ? `${moderationTarget.user.name} will not be able to sign in for the chosen duration.`
                  : moderationTarget.action === 'unban'
                    ? `This will restore ${moderationTarget.user.name}'s access to the platform immediately.`
                    : `${moderationTarget.user.name} will not be able to sign in while suspended.`
                : ''
            }
            confirmText={
              moderationTarget?.action === 'ban'
                ? 'Ban user'
                : moderationTarget?.action === 'unban'
                  ? 'Unban user'
                  : 'Suspend user'
            }
            variant={
              moderationTarget?.action === 'ban'
                ? 'error'
                : moderationTarget?.action === 'unban'
                  ? 'primary'
                  : 'warning'
            }
          />

          <ConfirmDialog
            open={confirmDisclosure.isOpen}
            onCancel={confirmDisclosure.close}
            onConfirm={confirmSimpleAction}
            loading={isActivateConfirm ? activateMutation.isPending : deleteMutation.isPending}
            title={isActivateConfirm ? 'Activate user?' : 'Delete user?'}
            description={
              confirmTarget
                ? isActivateConfirm
                  ? `This will restore ${confirmTarget.user.name}'s access to the platform.`
                  : `This will permanently delete ${confirmTarget.user.name}'s account. The action cannot be undone.`
                : ''
            }
            confirmText={isActivateConfirm ? 'Activate' : 'Delete'}
            variant={isActivateConfirm ? 'primary' : 'error'}
          />
        </>
      )}
    </div>
  )
}

function ProfileField({ label, value, capitalize = false, className }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-base-content/50">{label}</dt>
      <dd className={`mt-0.5 text-sm ${capitalize ? 'capitalize' : ''}`}>{value ?? '—'}</dd>
    </div>
  )
}

function HistoryItem({ tone, title, date, actor, reason, meta }) {
  const dot = { warning: 'bg-warning', success: 'bg-success', error: 'bg-error' }[tone]

  return (
    <li className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${dot}`} aria-hidden="true" />
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-base-content/50">{date}</span>
      </div>
      {actor && <p className="text-xs text-base-content/60 pl-4">by {actor}</p>}
      {reason && <p className="pl-4 text-sm text-base-content/70">“{reason}”</p>}
      {meta && <p className="pl-4 text-xs text-base-content/50">{meta}</p>}
    </li>
  )
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-box border border-base-300 p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-base-content/60">{label}</p>
    </div>
  )
}
