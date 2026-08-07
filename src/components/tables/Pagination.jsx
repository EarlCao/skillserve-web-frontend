import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePagination } from '../../hooks/usePagination'

/**
 * Pagination controls driven by usePagination state.
 *
 * @param {number} totalItems
 * @param {number} perPage
 * @param {{ currentPage, goToPage, pageNumbers, canPrev, canNext }} [pagination]  from usePagination
 */
export default function Pagination({ totalItems = 0, perPage = 10, pagination }) {
  // Hooks must be called unconditionally — compute the fallback state and
  // only use the passed-in pagination object when one is provided.
  const fallback = usePagination({ totalItems, perPage })
  const state = pagination ?? fallback
  const { currentPage, pageNumbers, canPrev, canNext, goToPage } = state

  // Nothing to paginate through when there's a single page.
  if (pageNumbers.length <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={!canPrev}
        onClick={() => goToPage(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          className={cn('btn btn-sm', page === currentPage ? 'btn-primary' : 'btn-ghost')}
          onClick={() => goToPage(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={!canNext}
        onClick={() => goToPage(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
