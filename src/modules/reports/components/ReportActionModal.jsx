import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/forms/FormField'
import { cn } from '../../../lib/utils'

const PRESET_DAYS = [7, 30, 90]

const ACTIONS_BY_TYPE = {
  user: ['warning', 'suspend', 'ban'],
  service: ['hide'],
  review: ['hide', 'remove'],
  message: ['remove'],
}

const ACTION_LABELS = {
  warning: 'Warning',
  suspend: 'Suspend',
  ban: 'Ban',
  hide: 'Hide',
  remove: 'Remove',
}

/**
 * Modal for taking a moderation action on a reported item.
 *
 * The available actions depend on the reported item type (user: warning /
 * suspend / ban; service: hide; review: hide / remove; message: remove).
 * Suspend and ban require a reason; bans additionally require a duration
 * (fixed number of days, with quick presets, or "forever"); warnings require
 * a message. An optional note is recorded with every action.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object} props.report
 * @param {({ action: string, reason?: string, duration?: string, days?: number|null, note?: string }) => void} props.onConfirm
 */
export default function ReportActionModal({
  open,
  onClose,
  report,
  loading = false,
  onConfirm,
}) {
  const type = report?.type
  const actions = ACTIONS_BY_TYPE[type] ?? []
  const [action, setAction] = useState(actions[0] ?? 'warning')
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('days') // 'days' | 'forever'
  const [days, setDays] = useState(PRESET_DAYS[0])
  const [warningMessage, setWarningMessage] = useState('')
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)

  const requiresReason = action === 'suspend' || action === 'ban'
  const missingReason = requiresReason && !reason.trim()
  const missingWarning = action === 'warning' && !warningMessage.trim()
  const invalidDays = duration === 'days' && (!Number.isInteger(days) || days < 1)
  const invalid = missingReason || missingWarning || invalidDays

  const submit = () => {
    setTouched(true)

    if (invalid) {
      return
    }

    onConfirm({
      action,
      reason: requiresReason ? reason.trim() : undefined,
      duration: action === 'ban' ? duration : undefined,
      days: action === 'ban' && duration === 'days' ? days : null,
      note: (action === 'warning' ? warningMessage : note).trim() || undefined,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Take Moderation Action"
      description={
        report
          ? `Choose how to moderate this reported ${type === 'user' ? 'user' : type === 'message' ? 'message' : type}.`
          : ''
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={action === 'ban' || action === 'remove' ? 'error' : 'warning'}
            onClick={submit}
            loading={loading}
            disabled={loading || (touched && invalid)}
          >
            Take action
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {actions.length > 1 && (
          <div>
            <span className="text-sm font-medium">Action</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {actions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setAction(item)
                    setTouched(false)
                  }}
                  className={cn('btn btn-sm', action === item ? 'btn-primary' : 'btn-outline')}
                  aria-pressed={action === item}
                >
                  {ACTION_LABELS[item]}
                </button>
              ))}
            </div>
          </div>
        )}

        {requiresReason && (
          <FormField
            label="Reason"
            required
            error={touched && missingReason ? 'Please provide a reason.' : undefined}
            hint="Recorded on the account and in the audit log."
          >
            <textarea
              className={`textarea textarea-bordered w-full ${touched && missingReason ? 'textarea-error' : ''}`}
              rows={3}
              placeholder={action === 'ban' ? 'Why is this account being banned?' : 'Why is this account being suspended?'}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </FormField>
        )}

        {action === 'warning' && (
          <FormField
            label="Warning message"
            required
            error={touched && missingWarning ? 'Please provide a warning message.' : undefined}
            hint="Recorded with the moderation action."
          >
            <textarea
              className={`textarea textarea-bordered w-full ${touched && missingWarning ? 'textarea-error' : ''}`}
              rows={3}
              placeholder="What is the user being warned about?"
              value={warningMessage}
              onChange={(event) => setWarningMessage(event.target.value)}
            />
          </FormField>
        )}

        {action === 'ban' && (
          <div>
            <span className="text-sm font-medium">
              Ban duration
              <span className="ml-0.5 text-error">*</span>
            </span>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setDuration('days')}
                className={cn('btn btn-sm flex-1', duration === 'days' ? 'btn-primary' : 'btn-outline')}
                aria-pressed={duration === 'days'}
              >
                Temporary (days)
              </button>
              <button
                type="button"
                onClick={() => setDuration('forever')}
                className={cn('btn btn-sm flex-1', duration === 'forever' ? 'btn-error' : 'btn-outline')}
                aria-pressed={duration === 'forever'}
              >
                Forever
              </button>
            </div>

            {duration === 'days' ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_DAYS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDays(preset)}
                      className={cn('btn btn-xs', days === preset ? 'btn-primary' : 'btn-ghost btn-outline')}
                      aria-pressed={days === preset}
                    >
                      {preset} days
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <label htmlFor="report-ban-days" className="text-sm text-base-content/70">
                    Custom:
                  </label>
                  <input
                    id="report-ban-days"
                    type="number"
                    min={1}
                    max={3650}
                    className={`input input-bordered input-sm w-24 ${touched && invalidDays ? 'input-error' : ''}`}
                    value={Number.isInteger(days) ? days : ''}
                    onChange={(event) => setDays(parseInt(event.target.value, 10))}
                  />
                  <span className="text-sm text-base-content/60">day(s)</span>
                </div>

                {touched && invalidDays ? (
                  <p className="mt-1 text-sm text-error">A temporary ban must last at least 1 day.</p>
                ) : (
                  <p className="mt-1 text-sm text-base-content/60">
                    The account will be unbanned automatically after {days} day{days === 1 ? '' : 's'}.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-base-content/60">
                The account stays banned until an administrator unbans it.
              </p>
            )}
          </div>
        )}

        {action !== 'warning' && (
          <FormField
            label="Action note"
            hint="Optional — recorded with the moderation action."
          >
            <textarea
              className="textarea textarea-bordered w-full"
              rows={2}
              placeholder="Optional note for the audit trail…"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </FormField>
        )}
      </div>
    </Modal>
  )
}