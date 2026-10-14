import Pagination from './Pagination'

/**
 * Under a paginated table: "Showing 1–10 of 54 customers" and the pages.
 *
 * @param {object} props
 * @param {{from?: number, to?: number, total: number}|undefined} props.meta  meta.pagination
 * @param {number} props.perPage
 * @param {object} props.pagination  usePagination() state
 * @param {string} props.noun  plural, e.g. "customers"
 */
export default function TableFooter({ meta, perPage, pagination, noun }) {
  if (!meta || meta.total === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-200 px-4 py-3">
      <p className="text-sm text-base-content/60">
        Showing <span className="font-medium text-base-content">{meta.from ?? 0}–{meta.to ?? 0}</span> of{' '}
        <span className="font-medium text-base-content">{meta.total}</span> {noun}
      </p>
      <Pagination totalItems={meta?.total ?? 0} perPage={perPage} pagination={pagination} />
    </div>
  )
}
