import { flexRender } from '@tanstack/react-table'
// @tanstack/react-table is v9; this component is written against the v8 API.
// The legacy entry keeps the v8 contract (useLegacyTable + getCoreRowModel) —
// intentional, do not "upgrade" to the v9 useTable/Subscribe API.
import { getCoreRowModel, useLegacyTable } from '@tanstack/react-table/legacy'
import EmptyState from '../common/EmptyState'
import Skeleton from '../ui/Skeleton'

/**
 * Generic data table built on @tanstack/react-table.
 *
 * No business logic — pass `columns` (column definitions) and `data`.
 * Feature modules provide their own columns and fetch their own data.
 *
 * @param {Array<object>} columns
 * @param {Array<object>} data
 * @param {boolean} [isLoading]
 * @param {string} [emptyTitle]
 * @param {string} [emptyDescription]
 * @param {'default'|'clean'} [variant]  'clean': no stripes, a quiet header,
 *   row hover — for full-width management lists
 */
export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search.',
  variant = 'default',
}) {
  const clean = variant === 'clean'

  const table = useLegacyTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto">
      <table className={clean ? 'table' : 'table table-zebra'}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={clean ? 'border-b border-base-200 bg-base-200/40' : undefined}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={clean ? 'py-2.5 text-xs font-semibold uppercase tracking-wide text-base-content/60' : undefined}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <td key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={clean ? 'border-b border-base-200 transition-colors last:border-0 hover:bg-base-200/40' : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={clean ? 'py-3 align-middle' : undefined}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
