import { RefreshCw } from 'lucide-react'
import Tooltip from '../ui/Tooltip'

/** Re-reads a list; spins while it is fetching. */
export default function RefreshButton({ onClick, isFetching, label = 'Refresh' }) {
  return (
    <Tooltip label={label} placement="left">
      <button
        type="button"
        className="btn btn-sm btn-ghost btn-square"
        onClick={onClick}
        disabled={isFetching}
        aria-label={label}
      >
        <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
      </button>
    </Tooltip>
  )
}
