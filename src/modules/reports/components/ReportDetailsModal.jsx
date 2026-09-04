import { format } from 'date-fns'
import { AlertTriangle, MessageSquareQuote, PackageCheck, ShieldX, StickyNote, UserCheck, UserCog } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import ReportStatusBadge from './ReportStatusBadge'
import ReportTypeBadge from './ReportTypeBadge'
import { useReport } from '../hooks/useReports'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : null)

/**
 * Modal that displays the full details of a report — the reported item,
 * report reason, investigation notes, and moderation/resolution stamps — and
 * exposes the lifecycle actions (investigate, add note, take action, resolve,
 * reject).
 */
export default function ReportDetailsModal({
  open,
  onClose,
  reportId,
  onInvestigate,
  onAddNote,
  onTakeAction,
  onResolve,
  onReject,
}) {
  const { data, isLoading, isError, error } = useReport(reportId)
  const report = data?.data
  const terminal = report?.status === 'resolved' || report?.status === 'rejected'

  const notes = report?.investigation_notes ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report Details"
      description="Investigate the reported item and record findings before taking action."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {report && !terminal && (
            <>
              {onInvestigate && report.status !== 'investigating' && (
                <Button variant="primary" onClick={() => onInvestigate(report)}>
                  <UserCheck className="size-4" />
                  Investigate
                </Button>
              )}
              {onAddNote && (
                <Button variant="secondary" onClick={() => onAddNote(report)}>
                  <StickyNote className="size-4" />
                  Add note
                </Button>
              )}
              {onTakeAction && (
                <Button variant="warning" onClick={() => onTakeAction(report)}>
                  <UserCog className="size-4" />
                  Take action
                </Button>
              )}
              {onResolve && (
                <Button variant="success" onClick={() => onResolve(report)}>
                  <PackageCheck className="size-4" />
                  Resolve
                </Button>
              )}
              {onReject && (
                <Button variant="error" onClick={() => onReject(report)}>
                  <ShieldX className="size-4" />
                  Reject
                </Button>
              )}
            </>
          )}
        </>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-base-200" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center text-error">
          <p>{error?.message ?? 'Failed to load report details.'}</p>
        </div>
      ) : report ? (
        <div className="flex flex-col gap-4">
          {/* Type, status and reason */}
          <div className="flex flex-wrap items-center gap-2">
            <ReportTypeBadge type={report.type} />
            <ReportStatusBadge status={report.status} />
            <span className="ml-1 text-sm font-medium capitalize">{report.reason?.replaceAll('_', ' ')}</span>
          </div>

          {/* Reportable item */}
          {report.reportable && (
            <div className="rounded-md bg-base-200/60 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-warning" />
                <span className="text-sm font-medium capitalize">{report.type}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{report.reportable.name ?? report.reportable.title ?? report.reportable.comment ?? report.reportable.content}</p>
              {report.reportable.email && <p className="text-sm text-base-content/60">{report.reportable.email}</p>}
              {report.reportable.provider && (
                <p className="text-xs text-base-content/60">
                  Provider: {report.reportable.provider.business_name}
                  {report.reportable.provider.user?.name ? ` (${report.reportable.provider.user.name})` : ''}
                </p>
              )}
              {report.reportable.reviewer && <p className="text-xs text-base-content/60">Reviewer: {report.reportable.reviewer.name}</p>}
              {report.reportable.sender && <p className="text-xs text-base-content/60">From: {report.reportable.sender.name}</p>}
              {report.reportable.receiver && <p className="text-xs text-base-content/60">To: {report.reportable.receiver.name}</p>}
              {report.reportable.status && <p className="text-xs text-base-content/60">Target status: {report.reportable.status}</p>}
            </div>
          )}

          {/* Report description */}
          {report.description && (
            <div>
              <span className="text-sm font-medium">Report details</span>
              <p className="mt-1 text-sm text-base-content/80">{report.description}</p>
            </div>
          )}

          {/* Reporter */}
          {report.reporter && (
            <div className="text-sm">
              <span className="text-base-content/60">Reported by: </span>
              <span className="font-medium">{report.reporter.name}</span>
              {report.reporter.email && <span className="text-base-content/60 ml-2">({report.reporter.email})</span>}
            </div>
          )}

          {/* Investigation notes */}
          {notes.length > 0 && (
            <div>
              <span className="text-sm font-medium">Investigation notes</span>
              <div className="mt-2 flex flex-col gap-2">
                {notes.map((entry, index) => (
                  <div key={index} className="rounded-md border border-base-200 p-3">
                    <p className="text-sm">{entry.note}</p>
                    <p className="mt-1 text-xs text-base-content/60">
                      {entry.created_by ? `Admin #${entry.created_by}` : 'Admin'} · {formatDateTime(entry.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investigator */}
          {report.investigated_by && (
            <div className="text-sm">
              <span className="text-base-content/60">Investigated by: </span>
              <span className="font-medium">{report.investigated_by.name}</span>
              {report.investigated_at && <span className="text-base-content/60 ml-2">({formatDateTime(report.investigated_at)})</span>}
            </div>
          )}

          {/* Moderation action */}
          {report.moderation_action && (
            <div className="rounded-md bg-warning/10 p-3">
              <span className="text-sm font-medium text-warning">
                Moderation action: {report.moderation_action}
              </span>
              {report.action_note && <p className="mt-1 text-sm">{report.action_note}</p>}
              {report.action_taken_by && (
                <p className="mt-1 text-xs text-base-content/60">
                  By {report.action_taken_by.name} · {formatDateTime(report.action_taken_at)}
                </p>
              )}
            </div>
          )}

          {/* Resolution / rejection */}
          {report.resolved_by && (
            <div className="rounded-md bg-success/10 p-3">
              <span className="text-sm font-medium text-success">Resolved</span>
              {report.resolution_note && <p className="mt-1 text-sm">{report.resolution_note}</p>}
              <p className="mt-1 text-xs text-base-content/60">
                By {report.resolved_by.name} · {formatDateTime(report.resolved_at)}
              </p>
            </div>
          )}

          {report.rejected_by && (
            <div className="rounded-md bg-error/10 p-3">
              <span className="text-sm font-medium text-error">Rejected</span>
              {report.reject_reason && <p className="mt-1 text-sm">{report.reject_reason}</p>}
              <p className="mt-1 text-xs text-base-content/60">
                By {report.rejected_by.name} · {formatDateTime(report.rejected_at)}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-1 border-t border-base-200 pt-3 text-xs text-base-content/60">
            <MessageSquareQuote className="size-3" />
            <span>Reported {formatDateTime(report.created_at)}</span>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}