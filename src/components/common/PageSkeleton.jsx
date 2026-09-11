import Skeleton from '../ui/Skeleton'

/**
 * Reusable page-level skeleton that matches the common admin page
 * layout: a title bar + a card area with text lines and buttons.
 *
 * @param {{ rows?: number, className?: string }} props
 */
export default function PageSkeleton({ rows = 5, className = '' }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Title bar skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search / filter bar skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Table / card skeleton */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          {/* Table header */}
          <div className="flex gap-4 border-b border-base-200 p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>

          {/* Table rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-base-200/50 px-4 py-3 last:border-b-0">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  )
}
