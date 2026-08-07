import { Search, X } from 'lucide-react'
import Input from '../ui/Input'

/**
 * Input with a search icon and clear button.
 *
 * Pair with the useDebounce hook when the search should hit an API.
 */
export default function SearchInput({ value, onChange, placeholder = 'Search…', className, ...props }) {
  return (
    <div className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-base-content/40" />
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-9 pr-9"
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange?.({ target: { value: '' } })}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
