import { Search, X } from 'lucide-react'
import Input from '../ui/Input'
import { cn } from '../../lib/utils'

/**
 * Input with a search icon and clear button.
 *
 * Pair with the useDebounce hook when the search should hit an API.
 * `size="sm"` matches the small selects and buttons of a table toolbar.
 */
export default function SearchInput({ value, onChange, placeholder = 'Search…', className, size = 'md', ...props }) {
  return (
    <div className={className}>
      <div className="relative">
        {/* Above the input, which would otherwise paint over it. */}
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-base-content/40" />
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn('pl-9 pr-9', size === 'sm' && 'input-sm')}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange?.({ target: { value: '' } })}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
