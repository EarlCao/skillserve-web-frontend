import { useMemo, useState } from 'react'

/**
 * Pagination state for tables and lists.
 *
 * Note: `pageNumbers` / `canPrev` / `canNext` / `totalPages` are only correct
 * when `totalItems` is known. The shared Pagination component derives the
 * page range from the server-side total itself, so list pages typically use
 * this hook just for the current page state (currentPage / setCurrentPage).
 *
 * @param {object} options
 * @param {number} options.totalItems
 * @param {number} [options.perPage]
 * @param {number} [options.initialPage]
 */
export function usePagination({ totalItems = 0, perPage = 10, initialPage = 1 } = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))

  const pageNumbers = useMemo(() => {
    const pages = []
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
    const end = Math.min(totalPages, start + 4)

    for (let i = start; i <= end; i += 1) {
      pages.push(i)
    }

    return pages
  }, [currentPage, totalPages])

  const goToPage = (page) => {
    const next = Math.min(Math.max(1, Number(page) || 1), totalPages)
    setCurrentPage(next)
  }

  return {
    currentPage,
    totalPages,
    pageNumbers,
    canPrev: currentPage > 1,
    canNext: currentPage < totalPages,
    goToPage,
    setCurrentPage,
  }
}
