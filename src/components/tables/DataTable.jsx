import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
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
 */
export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search.',
}) {
  // TanStack Table's hook returns non-memoizable functions; React Compiler
  // skips memoizing it, which is expected for this library.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
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
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
