import { useState } from 'react'
import { format } from 'date-fns'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'
import SearchInput from '../../../components/common/SearchInput'
import ErrorState from '../../../components/common/ErrorState'
import { useNotificationRecipients } from '../hooks/useNotifications'

const initialForm = { title: '', message: '', target: 'all', scheduledAt: '' }

export default function AnnouncementModal({ open, onClose, mutation, canTarget, canSchedule }) {
  const [form, setForm] = useState(initialForm)
  const [recipientSearch, setRecipientSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [minimumSchedule] = useState(() => format(new Date(Date.now() + 60_000), "yyyy-MM-dd'T'HH:mm"))
  const recipientsQuery = useNotificationRecipients(form.target, recipientSearch)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const isSelectedTarget = form.target === 'selected'
  const recipientList = recipientsQuery.data?.data ?? []
  const canSubmit = form.title.trim() && form.message.trim() && (!isSelectedTarget || selectedIds.length > 0)

  const submit = (event) => {
    event.preventDefault()
    if (!canSubmit) return

    mutation.mutate({
      title: form.title.trim(),
      message: form.message.trim(),
      target: form.target,
      recipient_ids: isSelectedTarget ? selectedIds : undefined,
      scheduled_at: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
    }, { onSuccess: onClose })
  }

  const toggleRecipient = (id) => setSelectedIds((current) => (
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  ))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send announcement"
      description="Notify active clients and service providers, now or at a scheduled time."
      className="max-w-2xl"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="announcement-form" loading={mutation.isPending} disabled={!canSubmit}>
            {form.scheduledAt ? 'Schedule announcement' : 'Send announcement'}
          </Button>
        </>
      )}
    >
      <form id="announcement-form" className="flex flex-col gap-4" onSubmit={submit}>
        <Input label="Title" value={form.title} onChange={update('title')} maxLength={160} required placeholder="Platform maintenance" />
        <Textarea label="Message" value={form.message} onChange={update('message')} maxLength={10000} required rows={5} placeholder="Write the announcement message…" />

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="announcement-target">Recipients</label>
          <select id="announcement-target" className="select select-bordered w-full" value={form.target} onChange={update('target')}>
            <option value="all">All clients and providers</option>
            {canTarget && <option value="customers">Clients only</option>}
            {canTarget && <option value="providers">Service providers only</option>}
            {canTarget && <option value="selected">Selected users</option>}
          </select>
        </div>

        {isSelectedTarget && (
          <div className="rounded-lg border border-base-300 p-3">
            <SearchInput value={recipientSearch} onChange={(event) => setRecipientSearch(event.target.value)} placeholder="Search recipients…" />
            <div className="mt-3 max-h-48 overflow-y-auto">
              {recipientsQuery.isLoading ? <span className="loading loading-spinner loading-sm" aria-label="Loading recipients" /> : recipientsQuery.isError ? (
                <ErrorState title="Could not load recipients" message={recipientsQuery.error?.message} onRetry={recipientsQuery.refetch} />
              ) : recipientList.length === 0 ? (
                <p className="text-sm text-base-content/60">No active recipients found.</p>
              ) : recipientList.map((recipient) => (
                <label key={recipient.id} className="flex cursor-pointer items-center gap-3 border-b border-base-200 py-2 last:border-0">
                  <input type="checkbox" className="checkbox checkbox-sm" checked={selectedIds.includes(recipient.id)} onChange={() => toggleRecipient(recipient.id)} />
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium">{recipient.name}</span><span className="block truncate text-xs text-base-content/60">{recipient.email}</span></span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-base-content/60">{selectedIds.length} recipient(s) selected</p>
          </div>
        )}

        {canSchedule && (
          <Input
            label="Schedule (optional)"
            type="datetime-local"
            min={minimumSchedule}
            value={form.scheduledAt}
            onChange={update('scheduledAt')}
            hint="Leave blank to send immediately."
          />
        )}
      </form>
    </Modal>
  )
}
