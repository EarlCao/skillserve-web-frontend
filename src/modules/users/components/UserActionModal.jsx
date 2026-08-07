import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/forms/FormField'
import { cn } from '../../../lib/utils'

const PRESET_DAYS = [7, 30, 90]

/**
 * Modal for moderation actions:
 *  - suspend: requires a reason.
 *  - ban: requires a reason plus a duration (fixed number of days, with quick
 *    presets, or "forever").
 *  - unban: optional note only.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {'suspend' | 'ban' | 'unban'} [props.action]
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.confirmText
 * @param {'error' | 'warning' | 'primary'} [props.variant]
 * @param {boolean} [props.loading]
 * @param {({ reason: string, duration?: 'days' | 'forever', days?: number }) => void} props.onConfirm
 *   For ban: receives { reason, duration, days }. For suspend/unban: the
 *   trimmed reason/note string.
 */
export default function UserActionModal({
  open,
  onClose,
  action = 'suspend',
  title,
  description,
  confirmText,
  variant = 'error',
  loading = false,
  onConfirm,
}) {
  // Callers remount this modal per target (via a changing `key`), so the
  // fields always start fresh and no effect-driven reset is needed.
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('days') // 'days' | 'forever'
  const [days, setDays] = useState(PRESET_DAYS[0])
  const [touched, setTouched] = useState(false)

  const isBan = action === 'ban'
  const isUnban = action === 'unban'
  const missingReason = !isUnban && !reason.trim()
  const invalidDays = duration === 'days' && (!Number.isInteger(days) || days < 1)

  const submit = () => {
    setTouched(true)

    if (missingReason || invalidDays) {
      return
    }

    if (isBan) {
      onConfirm({
        reason: reason.trim(),
        duration,
        days: duration === 'days' ? days : null,
      })
      return
    }

    onConfirm(reason.trim())
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={submit}
            loading={loading}
            disabled={loading || (touched && (missingReason || invalidDays))}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField
          label={isUnban ? 'Notes' : 'Reason'}
          required={!isUnban}
          error={touched && missingReason ? 'Please provide a reason.' : undefined}
          hint={
            isUnban
              ? 'Optional — recorded in the audit log.'
              : 'Recorded in the audit log and shown on the profile.'
          }
        >
          <textarea
            className={`textarea textarea-bordered w-full ${touched && missingReason ? 'textarea-error' : ''}`}
            rows={3}
            placeholder={
              isUnban
                ? 'Optional note (e.g. appeal approved)…'
                : isBan
                  ? 'Why is this account being banned?'
                  : 'Why is this action being taken?'
            }
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            autoFocus
          />
        </FormField>

        {isBan && (
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
                    >
                      {preset} days
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <label htmlFor="ban-days" className="text-sm text-base-content/70">
                    Custom:
                  </label>
                  <input
                    id="ban-days"
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
      </div>
    </Modal>
  )
}
