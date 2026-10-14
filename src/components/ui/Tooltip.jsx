import { cn } from '../../lib/utils'

const PLACEMENTS = {
  top: 'tooltip-top',
  bottom: 'tooltip-bottom',
  left: 'tooltip-left',
  right: 'tooltip-right',
}

/**
 * Names an icon-only control on hover and keyboard focus. Presentational
 * only — keep the control's own aria-label for screen readers.
 *
 * Inside a scrolling table, use `left` for buttons at the row's end so the
 * tip stays inside the scroll area.
 */
export default function Tooltip({ label, placement = 'top', className, children }) {
  return (
    <span className={cn('tooltip', PLACEMENTS[placement], className)} data-tip={label}>
      {children}
    </span>
  )
}
