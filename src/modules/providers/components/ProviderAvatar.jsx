import { cn } from '../../../lib/utils'

/**
 * Provider avatar with initials fallback.
 *
 * @param {object} props
 * @param {string} props.name
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 */
export default function ProviderAvatar({ name, size = 'md' }) {
  const initials = (name ?? 'P')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const sizes = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-16 text-lg',
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-content font-semibold',
        sizes[size],
      )}
    >
      {initials}
    </div>
  )
}
