import { cn } from '../../lib/utils'

/**
 * A list's main filter as tabs above the table (e.g. All · Active ·
 * Suspended), so the most-used filter is one click away.
 *
 * @param {object} props
 * @param {Array<{value: string, label: string}>} props.options  '' = all
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} props.label  accessible name of the group
 */
export default function StatusTabs({ options, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto">
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-base-content/60 hover:border-base-300 hover:text-base-content',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
