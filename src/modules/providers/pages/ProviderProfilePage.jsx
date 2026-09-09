import { useState } from 'react'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  FileText,
  MessageSquare,
  Power,
  Star,
  XCircle,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Skeleton from '../../../components/ui/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import Modal from '../../../components/ui/Modal'
import Textarea from '../../../components/ui/Textarea'
import { useAuth } from '../../../contexts/AuthContext'
import {
  useProvider,
  useVerificationHistory,
  useApproveVerification,
  useRejectVerification,
  useRequestAdditionalInfo,
  useSuspendProvider,
  useActivateProvider,
  useRemoveVerification,
} from '../hooks/useProviders'
import ProviderAvatar from '../components/ProviderAvatar'
import ProviderStatusBadge from '../components/ProviderStatusBadge'
import VerificationStatusBadge from '../components/VerificationStatusBadge'
import { hasCapability } from '../../../utils/permissions'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : '—')

/**
 * Detailed provider profile: personal information, skills, experience,
 * verification review, verification history and moderation actions.
 */
export default function ProviderProfilePage() {
  const { providerId } = useParams()
  const { user: currentUser } = useAuth()
  const can = (permission) => hasCapability(currentUser, permission, 'manage providers')

  const { data, isLoading, isError, error, refetch } = useProvider(providerId)
  const provider = data?.data

  const verificationHistoryQuery = useVerificationHistory(providerId)
  const verificationHistory = verificationHistoryQuery.data?.data ?? []

  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showActivateConfirm, setShowActivateConfirm] = useState(false)
  const [showRemoveVerificationConfirm, setShowRemoveVerificationConfirm] = useState(false)

  const [approveNotes, setApproveNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [requestInfoMessage, setRequestInfoMessage] = useState('')
  const [suspendReason, setSuspendReason] = useState('')

  const approveMutation = useApproveVerification()
  const rejectMutation = useRejectVerification()
  const requestInfoMutation = useRequestAdditionalInfo()
  const suspendMutation = useSuspendProvider()
  const activateMutation = useActivateProvider()
  const removeVerificationMutation = useRemoveVerification()

  const handleApprove = () => {
    if (!provider) return
    approveMutation.mutate(
      { id: provider.id, notes: approveNotes.trim() || undefined },
      {
        onSuccess: () => {
          setShowApproveModal(false)
          setApproveNotes('')
        },
      },
    )
  }

  const handleReject = () => {
    if (!provider || !rejectReason.trim()) return
    rejectMutation.mutate(
      { id: provider.id, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setShowRejectModal(false)
          setRejectReason('')
        },
      },
    )
  }

  const handleRequestInfo = () => {
    if (!provider || !requestInfoMessage.trim()) return
    requestInfoMutation.mutate(
      { id: provider.id, message: requestInfoMessage.trim() },
      {
        onSuccess: () => {
          setShowRequestInfoModal(false)
          setRequestInfoMessage('')
        },
      },
    )
  }

  const handleSuspend = () => {
    if (!provider || !suspendReason.trim()) return
    suspendMutation.mutate(
      { id: provider.id, reason: suspendReason.trim() },
      {
        onSuccess: () => {
          setShowSuspendModal(false)
          setSuspendReason('')
        },
      },
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load the provider profile"
        message={error?.message}
        onRetry={refetch}
      />
    )
  }

  const verificationRequest = provider?.latest_verification_request
  const verificationDocuments = verificationRequest?.documents ?? []
  const isPending = provider?.verification_status === 'pending'

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/providers" className="btn btn-ghost btn-sm" aria-label="Back to providers">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {isLoading ? 'Provider profile' : provider?.business_name || provider?.user?.name}
            </h1>
            <p className="text-sm text-base-content/60">Provider profile and verification management.</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {provider && (
            <>
              {isPending && (
                <>
                  {can('verify providers') && <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApproveModal(true)}
                  >
                    <CheckCircle className="size-4 text-success" />
                    Approve
                  </Button>}
                  {can('reject providers') && <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectModal(true)}
                  >
                    <XCircle className="size-4 text-error" />
                    Reject
                  </Button>}
                  {can('verify providers') && <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRequestInfoModal(true)}
                  >
                    <MessageSquare className="size-4" />
                    Request Info
                  </Button>}
                </>
              )}
              {provider.is_suspended ? (
                can('activate providers') && <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActivateConfirm(true)}
                >
                  <Power className="size-4 text-success" />
                  Activate
                </Button>
              ) : (
                can('suspend providers') && <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuspendModal(true)}
                >
                  <Ban className="size-4 text-warning" />
                  Suspend
                </Button>
              )}
              {provider.verification_status === 'verified' && can('verify providers') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRemoveVerificationConfirm(true)}
                >
                  <XCircle className="size-4 text-error" />
                  Remove Verification
                </Button>
              )}
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
            <ProviderAvatar name={provider?.user?.name || provider?.business_name} size="lg" />
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold">{provider?.business_name || provider?.user?.name}</span>
                <ProviderStatusBadge isSuspended={provider?.is_suspended} />
                <VerificationStatusBadge status={provider?.verification_status} />
              </div>
              <p className="text-sm text-base-content/60">{provider?.user?.email}</p>
              {provider?.specialization && (
                <p className="text-sm text-base-content/50">{provider?.specialization}</p>
              )}
            </div>
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Profile information */}
        <Card title="Profile Information" description="Provider professional details.">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProfileField label="Business name" value={provider?.business_name} />
              <ProfileField label="Specialization" value={provider?.specialization} />
              <ProfileField label="Experience" value={provider?.experience_years ? `${provider.experience_years} years` : null} />
              <ProfileField label="Hourly rate" value={provider?.hourly_rate ? `$${provider.hourly_rate}` : null} />
              <ProfileField label="Location" value={provider?.location} className="sm:col-span-2" />
              <ProfileField label="Bio" value={provider?.bio} className="sm:col-span-2" />
              <ProfileField label="Website" value={provider?.website} className="sm:col-span-2" />
            </dl>
          )}
        </Card>

        {/* Skills & certifications */}
        <Card title="Skills & Certifications" description="Professional skills and certifications.">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-medium text-base-content/70 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {provider?.skills?.length > 0 ? (
                    provider.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-base-content/40">No skills listed.</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-base-content/70 mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {provider?.certifications?.length > 0 ? (
                    provider.certifications.map((cert, index) => (
                      <Badge key={index} variant="primary">{cert}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-base-content/40">No certifications listed.</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-base-content/70 mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {provider?.languages?.length > 0 ? (
                    provider.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">{lang}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-base-content/40">No languages listed.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Verification status */}
        <Card title="Verification Status" description="Current verification status and details.">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProfileField label="Status" value={provider?.verification_status?.replace(/_/g, ' ')} capitalize />
              <ProfileField label="Verified at" value={formatDateTime(provider?.verified_at)} />
              <ProfileField label="Verified by" value={provider?.verified_by?.name} />
              <ProfileField label="Rejection reason" value={provider?.rejection_reason} className="sm:col-span-2" />
              {provider?.is_suspended && (
                <>
                  <ProfileField label="Suspended at" value={formatDateTime(provider?.suspended_at)} />
                  <ProfileField label="Suspended by" value={provider?.suspended_by?.name} />
                  <ProfileField label="Suspension reason" value={provider?.suspension_reason} className="sm:col-span-2" />
                </>
              )}
            </dl>
          )}
        </Card>

        {/* Platform summary */}
        <Card title="Platform Summary" description="Ratings, reviews and booking statistics.">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryStat label="Rating" value={provider?.average_rating > 0 ? Number(provider.average_rating).toFixed(1) : '—'} icon={<Star className="size-4 text-yellow-500" />} />
              <SummaryStat label="Reviews" value={provider?.total_reviews ?? 0} />
              <SummaryStat label="Total Bookings" value={provider?.total_bookings ?? 0} />
              <SummaryStat label="Completed" value={provider?.completed_bookings ?? 0} />
            </div>
          )}
        </Card>
      </div>

      {/* Verification documents */}
      {verificationRequest && (
        <Card title="Verification Documents" description="Documents submitted for verification review.">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : verificationDocuments.length === 0 ? (
            <p className="text-sm text-base-content/40">No documents submitted.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {verificationDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-box border border-base-300 p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-base-content/50" />
                    <div>
                      <p className="text-sm font-medium">{doc.file_name}</p>
                      <p className="text-xs text-base-content/50">
                        {doc.document_type} · {doc.formatted_file_size}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Verification history */}
      <Card title="Verification History" description="Previous verification requests and their outcomes.">
        {verificationHistoryQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : verificationHistory.length === 0 ? (
          <p className="text-sm text-base-content/40">No verification history.</p>
        ) : (
          <ul className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
            {verificationHistory.map((entry) => {
              const statusConfig = {
                approved: { color: 'bg-success', label: 'Approved' },
                rejected: { color: 'bg-error', label: 'Rejected' },
                additional_info_required: { color: 'bg-accent', label: 'Info Required' },
                pending: { color: 'bg-warning', label: 'Pending' },
              }
              const config = statusConfig[entry.status] ?? statusConfig.pending

              return (
                <li key={entry.id} className="flex flex-col gap-0.5 border-l-2 border-base-300 pl-3">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${config.color}`} aria-hidden="true" />
                    <span className="text-sm font-semibold">{config.label}</span>
                    <span className="text-xs text-base-content/50">{formatDateTime(entry.submitted_at)}</span>
                  </div>
                  {entry.reviewed_by && (
                    <p className="text-xs text-base-content/60 pl-4">by {entry.reviewed_by.name}</p>
                  )}
                  {entry.rejection_reason && (
                    <p className="pl-4 text-sm text-base-content/70">"{entry.rejection_reason}"</p>
                  )}
                  {entry.additional_info_request && (
                    <p className="pl-4 text-sm text-base-content/70">"{entry.additional_info_request}"</p>
                  )}
                  {entry.admin_notes && (
                    <p className="pl-4 text-xs text-base-content/50">Notes: {entry.admin_notes}</p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* Approve Modal */}
      <Modal
        open={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve verification?"
        description={`This will mark ${provider?.business_name || provider?.user?.name} as verified.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowApproveModal(false)} disabled={approveMutation.isPending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApprove} loading={approveMutation.isPending}>
              Approve
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="approve-notes" className="text-sm font-medium">
            Notes (optional)
          </label>
          <Textarea
            id="approve-notes"
            value={approveNotes}
            onChange={(e) => setApproveNotes(e.target.value)}
            placeholder="Add any notes about this approval…"
            rows={3}
            maxLength={1000}
          />
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject verification?"
        description={`This will reject the verification request for ${provider?.business_name || provider?.user?.name}.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowRejectModal(false)} disabled={rejectMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={handleReject}
              loading={rejectMutation.isPending}
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="reject-reason" className="text-sm font-medium">
            Reason <span className="text-error">*</span>
          </label>
          <Textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejection…"
            rows={3}
            maxLength={1000}
          />
          <p className="text-xs text-base-content/50">{rejectReason.length}/1000 characters</p>
        </div>
      </Modal>

      {/* Request Info Modal */}
      <Modal
        open={showRequestInfoModal}
        onClose={() => setShowRequestInfoModal(false)}
        title="Request additional information?"
        description={`This will ask ${provider?.business_name || provider?.user?.name} to provide additional information.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowRequestInfoModal(false)} disabled={requestInfoMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRequestInfo}
              loading={requestInfoMutation.isPending}
              disabled={!requestInfoMessage.trim()}
            >
              Send Request
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="request-info-message" className="text-sm font-medium">
            Message <span className="text-error">*</span>
          </label>
          <Textarea
            id="request-info-message"
            value={requestInfoMessage}
            onChange={(e) => setRequestInfoMessage(e.target.value)}
            placeholder="Please specify what additional information is required…"
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-base-content/50">{requestInfoMessage.length}/2000 characters</p>
        </div>
      </Modal>

      {/* Suspend Modal */}
      <Modal
        open={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspend provider?"
        description={`${provider?.business_name || provider?.user?.name} will not be able to offer services while suspended.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSuspendModal(false)} disabled={suspendMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={handleSuspend}
              loading={suspendMutation.isPending}
              disabled={!suspendReason.trim()}
            >
              Suspend
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="suspend-reason" className="text-sm font-medium">
            Reason <span className="text-error">*</span>
          </label>
          <Textarea
            id="suspend-reason"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="Please provide a reason for the suspension…"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-base-content/50">{suspendReason.length}/500 characters</p>
        </div>
      </Modal>

      {/* Activate Confirm */}
      <ConfirmDialog
        open={showActivateConfirm}
        onCancel={() => setShowActivateConfirm(false)}
        onConfirm={() => {
          if (provider) activateMutation.mutate(provider.id, { onSuccess: () => setShowActivateConfirm(false) })
        }}
        loading={activateMutation.isPending}
        title="Activate provider?"
        description={`This will restore ${provider?.business_name || provider?.user?.name}'s access to the platform.`}
        confirmText="Activate"
        variant="primary"
      />

      {/* Remove Verification Confirm */}
      <ConfirmDialog
        open={showRemoveVerificationConfirm}
        onCancel={() => setShowRemoveVerificationConfirm(false)}
        onConfirm={() => {
          if (provider) removeVerificationMutation.mutate(provider.id, { onSuccess: () => setShowRemoveVerificationConfirm(false) })
        }}
        loading={removeVerificationMutation.isPending}
        title="Remove verification?"
        description={`This will remove the verified status of ${provider?.business_name || provider?.user?.name}. They will need to re-apply for verification.`}
        confirmText="Remove verification"
        variant="error"
      />
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

function SummaryStat({ label, value, icon }) {
  return (
    <div className="rounded-box border border-base-300 p-4 text-center">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <p className="text-sm text-base-content/60">{label}</p>
    </div>
  )
}
