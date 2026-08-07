import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePagination } from '../../hooks/usePagination'

/**
 * Pagination controls.
 *
 * The page range (numbered buttons, Previous/Next enabled state) is computed
 * from the server-side `totalItems` / `perPage`, while `pagination` (from
 * usePagination) is used only for the current page state — so pages pass
 * their query result's total straight through without extra state.
 *
 * @param {number} totalItems
 * @param {number} perPage
 * @param {{ currentPage, setCurrentPage }} [pagination]  from usePagination
 */
export default function Pagination({ totalItems = 0, perPage = 10, pagination }) {
  // Hooks must be called unconditionally — compute the fallback state and
  // only use the passed-in pagination object when one is provided.
  const fallback = usePagination({ totalItems, perPage })
  const state = pagination ?? fallback
  const { currentPage, setCurrentPage } = state

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  const pageNumbers = useMemo(() => {
    const pages = []
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
    const end = Math.min(totalPages, start + 4)

    for (let i = start; i <= end; i += 1) {
      pages.push(i)
    }

    return pages
  }, [currentPage, totalPages])

  // Nothing to paginate through when there's a single page.
  if (pageNumbers.length <= 1) {
    return null
  }

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, Number(page) || 1), totalPages))
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        className="btn btn-ghost btn-sm gap-1"
        disabled={!canPrev}
        onClick={() => goToPage(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Previous</span>
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
        className="btn btn-ghost btn-sm gap-1"
        disabled={!canNext}
        onClick={() => goToPage(currentPage + 1)}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
