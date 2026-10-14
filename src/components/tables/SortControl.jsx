import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import Tooltip from '../ui/Tooltip'

/**
 * Sort field and direction as one compact control.
 *
 * @param {object} props
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} props.sort
 * @param {'asc'|'desc'} props.direction
 * @param {(sort: string) => void} props.onSortChange
 * @param {() => void} props.onToggleDirection
 */
export default function SortControl({ options, sort, direction, onSortChange, onToggleDirection }) {
  const ascending = direction === 'asc'
  const directionLabel = ascending ? 'Ascending' : 'Descending'

  return (
    <div className="join">
      <select
        className="select select-bordered select-sm join-item w-40"
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
        aria-label="Sort by"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            Sort: {option.label}
          </option>
        ))}
      </select>
      <Tooltip label={`${directionLabel} — click to reverse`}>
        <button
          type="button"
          className="btn btn-sm btn-outline join-item border-base-300"
          onClick={onToggleDirection}
          aria-label={`Sort ${directionLabel.toLowerCase()}, click to reverse`}
        >
          {ascending ? <ArrowUpNarrowWide className="size-4" /> : <ArrowDownWideNarrow className="size-4" />}
        </button>
      </Tooltip>
    </div>
  )
}
