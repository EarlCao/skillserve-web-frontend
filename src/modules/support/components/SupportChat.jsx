import { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { ImagePlus, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import { PrivatePhotoThumbnail } from '../../../components/common/PrivatePhotos'
import { cn } from '../../../lib/utils'

/** The API's limits for one reply (SupportTicketAttachment::MAX_PER_POST, PrivateImages::RULES). */
const MAX_PHOTOS = 5
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

const formatTime = (value) => (value ? format(new Date(value), 'MMM d, h:mm a') : '')

/**
 * The Customer Support conversation, as the user sees it in the app: their
 * request first, then every reply — theirs on the left, staff on the right —
 * with a composer for text and photos while it is open. New replies from the
 * app arrive through the live admin updates.
 */
export default function SupportChat({ ticket, canRespond, onSend, sending }) {
  const threadRef = useRef(null)
  const requesterId = ticket.requester?.id
  const thread = useMemo(() => [
    {
      id: 'request',
      body: ticket.description,
      attachments: ticket.attachments ?? [],
      author: ticket.requester,
      created_at: ticket.created_at,
    },
    ...(ticket.messages ?? []),
  ], [ticket])

  // Keep the newest message in view, as a chat does.
  useEffect(() => {
    const element = threadRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [thread.length])

  const isOpen = ticket.status !== 'resolved'

  return (
    <div className="flex flex-col overflow-hidden rounded-box border border-base-300">
      <div ref={threadRef} className="flex max-h-[26rem] min-h-48 flex-col gap-3 overflow-y-auto bg-base-200/40 p-3" aria-live="polite">
        {thread.map((message) => (
          <ChatBubble key={message.id} message={message} fromRequester={message.author?.id === requesterId} />
        ))}
      </div>
      {isOpen && canRespond ? (
        <Composer onSend={onSend} sending={sending} requesterName={ticket.requester?.name} />
      ) : (
        <p className="border-t border-base-300 p-3 text-center text-sm text-base-content/60">
          {isOpen ? 'You can read this conversation but not reply to it.' : 'This conversation is resolved.'}
        </p>
      )}
    </div>
  )
}

function ChatBubble({ message, fromRequester }) {
  return (
    <div className={cn('flex flex-col gap-1', fromRequester ? 'items-start' : 'items-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
          fromRequester ? 'rounded-bl-sm bg-base-100 shadow-sm' : 'rounded-br-sm bg-primary text-primary-content',
        )}
      >
        {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
        {message.attachments?.length > 0 && (
          <div className={cn('flex flex-wrap gap-2', message.body && 'mt-2')}>
            {message.attachments.map((photo, index) => (
              <PrivatePhotoThumbnail key={photo.id} path={photo.download_path} number={index + 1} />
            ))}
          </div>
        )}
      </div>
      <span className="px-1 text-xs text-base-content/50">
        {message.author?.name ?? 'System'} · {formatTime(message.created_at)}
      </span>
    </div>
  )
}

function Composer({ onSend, sending, requesterName }) {
  const [body, setBody] = useState('')
  const [photos, setPhotos] = useState([])
  const fileInput = useRef(null)
  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos])
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  const canSend = (body.trim() !== '' || photos.length > 0) && !sending

  const send = () => {
    if (!canSend) return
    onSend(body.trim(), photos, () => {
      setBody('')
      setPhotos([])
    })
  }

  const addPhotos = (event) => {
    const picked = Array.from(event.target.files ?? [])
    event.target.value = ''
    const tooLarge = picked.filter((file) => file.size > MAX_PHOTO_BYTES)
    if (tooLarge.length > 0) toast.error('Each photo must be 5 MB or smaller.')
    const next = [...photos, ...picked.filter((file) => file.size <= MAX_PHOTO_BYTES)]
    if (next.length > MAX_PHOTOS) toast.error(`A reply can carry up to ${MAX_PHOTOS} photos.`)
    setPhotos(next.slice(0, MAX_PHOTOS))
  }

  return (
    <div className="flex flex-col gap-2 border-t border-base-300 bg-base-100 p-3">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative">
              <img src={previews[index]} alt={`Photo ${index + 1} to send`} className="size-14 rounded-md object-cover" />
              <button
                type="button"
                className="btn btn-circle btn-xs absolute -end-2 -top-2"
                onClick={() => setPhotos(photos.filter((_, position) => position !== index))}
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          type="button"
          className="btn btn-square btn-ghost"
          onClick={() => fileInput.current?.click()}
          disabled={sending || photos.length >= MAX_PHOTOS}
          aria-label="Attach photos"
        >
          <ImagePlus className="size-5" />
        </button>
        <textarea
          className="textarea textarea-bordered min-h-10 flex-1 resize-none text-sm"
          rows={2}
          maxLength={5000}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends; Shift+Enter starts a new line.
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              send()
            }
          }}
          placeholder={`Reply to ${requesterName ?? 'the user'}…`}
          aria-label="Reply message"
        />
        <Button onClick={send} loading={sending} disabled={!canSend} aria-label="Send reply">
          <Send className="size-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={addPhotos}
        aria-label="Choose photos to send"
      />
    </div>
  )
}
