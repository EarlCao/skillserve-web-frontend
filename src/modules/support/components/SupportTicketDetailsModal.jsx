import { useState } from 'react'
import { format } from 'date-fns'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Textarea from '../../../components/ui/Textarea'
import Input from '../../../components/ui/Input'
import ErrorState from '../../../components/common/ErrorState'
import SupportTicketStatusBadge from './SupportTicketStatusBadge'
import SupportTicketPriorityBadge from './SupportTicketPriorityBadge'
import SupportChat from './SupportChat'
import { useSupportAssignees, useSupportTicket } from '../hooks/useSupportTickets'

const formatDateTime = (value) => (value ? format(new Date(value), 'MMM d, yyyy HH:mm') : '—')

export default function SupportTicketDetailsModal({
  open,
  onClose,
  ticketId,
  canAssign,
  canRespond,
  canResolve,
  onAssign,
  onRespond,
  onResolve,
  actionLoading,
  sending,
}) {
  const { data, isLoading, isError, error, refetch } = useSupportTicket(ticketId)
  const { data: assigneesData } = useSupportAssignees('')
  const ticket = data?.data
  const [resolutionNote, setResolutionNote] = useState('')
  const [search, setSearch] = useState('')
  const assignees = assigneesData?.data ?? []

  const submitResolution = () => {
    const note = resolutionNote.trim()
    if (!note || !ticket) return
    onResolve(ticket.id, note, () => setResolutionNote(''))
  }

  const filteredAssignees = assignees.filter((assignee) => {
    const term = search.trim().toLowerCase()
    return !term || `${assignee.name} ${assignee.email}`.toLowerCase().includes(term)
  })

  return (
    <Modal open={open} onClose={onClose} title="Customer Support" description="Chat with the user, assign the request, and record how it was resolved." boxClassName="max-w-3xl">
      {isLoading ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="h-4 w-full animate-pulse rounded bg-base-200" />)}</div>
      ) : isError ? (
        <ErrorState title="Could not load this conversation" message={error?.message} onRetry={refetch} />
      ) : ticket ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{ticket.ticket_number}: {ticket.subject}</h3>
              <p className="text-sm text-base-content/60">{ticket.category} · Created {formatDateTime(ticket.created_at)}</p>
            </div>
            <div className="flex gap-2"><SupportTicketPriorityBadge priority={ticket.priority} /><SupportTicketStatusBadge status={ticket.status} /></div>
          </div>

          <div className="grid gap-3 rounded-md bg-base-200/50 p-3 text-sm sm:grid-cols-2">
            <div><span className="text-base-content/60">Requester</span><p className="font-medium">{ticket.requester?.name ?? 'System'}</p><p className="text-xs text-base-content/60">{ticket.requester?.email ?? '—'}</p></div>
            <div><span className="text-base-content/60">Assignee</span><p className="font-medium">{ticket.assigned_to?.name ?? 'Unassigned'}</p><p className="text-xs text-base-content/60">{ticket.assigned_to?.email ?? '—'}</p></div>
          </div>

          {canAssign && ticket.status !== 'resolved' && (
            <div className="flex flex-col gap-2 rounded-md border border-base-200 p-3">
              <span className="text-sm font-medium">Assignment</span>
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search administrators…" aria-label="Search support assignees" />
              <select className="select select-bordered w-full" value={ticket.assigned_to?.id ?? ''} onChange={(event) => onAssign(ticket.id, event.target.value ? Number(event.target.value) : null)} disabled={actionLoading} aria-label="Assign support request">
                <option value="">Unassigned</option>
                {filteredAssignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name} ({assignee.email})</option>)}
              </select>
            </div>
          )}

          <SupportChat ticket={ticket} canRespond={canRespond} sending={sending} onSend={(body, images, reset) => onRespond(ticket.id, body, images, reset)} />

          {ticket.resolution_note && <div className="rounded-md bg-success/10 p-3"><span className="font-medium text-success">Resolution</span><p className="mt-1 whitespace-pre-wrap text-sm">{ticket.resolution_note}</p><p className="mt-1 text-xs text-base-content/60">Resolved by {ticket.resolved_by?.name ?? '—'} · {formatDateTime(ticket.resolved_at)}</p></div>}

          {canResolve && ticket.status !== 'resolved' && <div className="flex flex-col gap-2 border-t border-base-200 pt-4"><Textarea label="Resolution note" rows={3} value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} placeholder="Explain how this request was resolved…" /><Button variant="success" onClick={submitResolution} loading={actionLoading} disabled={!resolutionNote.trim()}>Mark as resolved</Button></div>}
        </div>
      ) : null}
    </Modal>
  )
}
