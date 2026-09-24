import { useState } from 'react'
import { FileText, ShieldCheck } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Spinner from '../../../components/ui/Spinner'
import Textarea from '../../../components/ui/Textarea'
import { formatDate, formatDateTime } from '../../../utils'
import IdentityStatusBadge from './IdentityStatusBadge'

const DOCUMENT_LABELS = {
  id_front: 'Front of card',
  id_back: 'Back of card',
  selfie: 'Selfie',
}

/**
 * Review one National ID submission.
 *
 * The card number is deliberately not shown — only its last four digits. The
 * reviewer confirms the number by opening the ID image, which is fetched with
 * their token rather than linked, so the file is never reachable by URL.
 */
export default function IdentityReviewModal({
  open,
  onClose,
  verification,
  isLoading,
  onApprove,
  onReject,
  onOpenDocument,
  canApprove,
  canReject,
  actionLoading,
  documentLoading,
}) {
  // Remounted by the page's `key` when a different submission is opened, so
  // these defaults are the reset.
  const [mode, setMode] = useState(null) // 'approve' | 'reject'
  const [text, setText] = useState('')

  const pending = verification?.status === 'pending'
  const canSubmit = mode === 'reject' ? text.trim().length >= 3 : true

  const submit = () => {
    if (mode === 'approve') onApprove(text.trim() || null)
    if (mode === 'reject') onReject(text.trim())
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="National ID submission"
      description={verification?.account ? `${verification.account.name} · ${verification.account.email}` : undefined}
      boxClassName="max-w-2xl"
      footer={
        mode ? (
          <>
            <Button variant="ghost" onClick={() => setMode(null)} disabled={actionLoading}>
              Back
            </Button>
            <Button
              variant={mode === 'reject' ? 'error' : 'primary'}
              onClick={submit}
              loading={actionLoading}
              disabled={!canSubmit}
            >
              {mode === 'reject' ? 'Reject submission' : 'Verify identity'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {pending && canReject && (
              <Button variant="error" onClick={() => setMode('reject')}>
                Reject
              </Button>
            )}
            {pending && canApprove && (
              <Button onClick={() => setMode('approve')}>
                <ShieldCheck className="size-4" /> Approve
              </Button>
            )}
          </>
        )
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !verification ? null : mode ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-base-content/70">
            {mode === 'reject'
              ? 'The reason is shown to the account holder so they can correct the problem and submit again.'
              : 'An optional internal note, recorded in the audit log. It is never shown to the account holder.'}
          </p>
          <Textarea
            label={mode === 'reject' ? 'Reason' : 'Notes (optional)'}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            maxLength={1000}
            required={mode === 'reject'}
            placeholder={mode === 'reject' ? 'e.g. The back of the card was unreadable.' : ''}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <IdentityStatusBadge status={verification.status} />
            <span className="text-sm text-base-content/60 capitalize">{verification.account?.account_type}</span>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Name on card" value={verification.full_name} />
            <Detail label="Date of birth" value={verification.birthdate ? formatDate(verification.birthdate) : null} />
            <Detail
              label="National ID"
              value={verification.id_number_last4 ? `•••• •••• •••• ${verification.id_number_last4}` : null}
              hint="Confirm the full number against the card image."
            />
            <Detail label="Submitted" value={verification.submitted_at ? formatDateTime(verification.submitted_at) : null} />
          </dl>

          {verification.rejection_reason && (
            <div className="rounded-lg bg-error/10 p-3 text-sm">
              <p className="font-medium">Previously rejected</p>
              <p className="text-base-content/70">{verification.rejection_reason}</p>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-semibold">Documents</h3>
            {verification.documents?.length ? (
              <ul className="flex flex-col gap-2">
                {verification.documents.map((document) => (
                  <li key={document.id} className="flex items-center justify-between gap-2 rounded-lg border border-base-200 p-2">
                    <span className="flex items-center gap-2 text-sm">
                      <FileText className="size-4 text-base-content/60" />
                      {DOCUMENT_LABELS[document.document_type] ?? document.document_type}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDocument(document.id)}
                      loading={documentLoading}
                    >
                      Open
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-base-content/60">
                The images have been deleted under the retention policy. The decision and its history are kept.
              </p>
            )}
          </div>

          {verification.history?.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">History</h3>
              <ul className="flex flex-col gap-1 text-sm">
                {verification.history.map((event, index) => (
                  <li key={index} className="flex flex-wrap justify-between gap-2 text-base-content/70">
                    <span>
                      <span className="capitalize">{event.action}</span>
                      {event.actor ? ` by ${event.actor.name}` : ''}
                      {event.reason ? ` — ${event.reason}` : ''}
                    </span>
                    <span className="text-xs">{event.created_at ? formatDateTime(event.created_at) : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function Detail({ label, value, hint }) {
  return (
    <div>
      <dt className="text-xs text-base-content/60">{label}</dt>
      <dd className="text-sm font-medium">{value ?? '—'}</dd>
      {hint && <p className="text-xs text-base-content/50">{hint}</p>}
    </div>
  )
}
