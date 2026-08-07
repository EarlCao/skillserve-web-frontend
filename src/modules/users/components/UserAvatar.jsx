import { cn } from '../../../lib/utils'

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-lg',
}

/**
 * Initials avatar. Profile photos are surfaced by the resource as soon as a
 * media/upload flow exists; until then every account renders its initials.
 */
export default function UserAvatar({ name, size = 'md', className }) {
  const initials = (name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

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
