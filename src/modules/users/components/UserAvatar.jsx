import { useState } from 'react'
import { cn } from '../../../lib/utils'

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-lg',
}

/**
 * An account's avatar: their profile photo when they have one, otherwise —
 * or when the photo fails to load — their initials.
 *
 * @param {object} props
 * @param {string} [props.name]
 * @param {string|null} [props.src]  the profile photo URL
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.className]
 */
export default function UserAvatar({ name, src, size = 'md', className }) {
  // Remembers which URL failed, so a new photo is tried again.
  const [failedSrc, setFailedSrc] = useState(null)

  const initials = (name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        onError={() => setFailedSrc(src)}
        className={cn('shrink-0 rounded-full object-cover', SIZES[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary',
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials || '?'}
    </div>
  )
}
