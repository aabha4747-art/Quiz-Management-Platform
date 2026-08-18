import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function DataTable({
  columns,
  rows,
  getRowKey,
  emptyState,
  loading = false,
  loadingRows = 5,
  pagination,
  className = "",
  rowClassName,
}) {
  return (
    <section
      className={`ui-surface overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500 ${
                    column.headerClassName || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {loading
              ? Array.from({
                  length: loadingRows,
                }).map((_, rowIndex) => (
                  <LoadingRow
                    key={rowIndex}
                    columns={columns}
                  />
                ))
              : rows.map((row, rowIndex) => (
                  <tr
                    key={
                      getRowKey
                        ? getRowKey(row, rowIndex)
                        : row.id ?? rowIndex
                    }
                    className={`transition hover:bg-slate-50 ${
                      rowClassName
                        ? rowClassName(row, rowIndex)
                        : ""
                    }`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-5 align-middle ${
                          column.cellClassName || ""
                        }`}
                      >
                        {column.render
                          ? column.render(row, rowIndex)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!loading &&
        rows.length === 0 &&
        emptyState && (
          <div className="border-t border-slate-200 p-6">
            {emptyState}
          </div>
        )}

      {pagination && rows.length > 0 && (
        <TablePagination {...pagination} />
      )}
    </section>
  );
}

function LoadingRow({ columns }) {
  return (
    <tr>
      {columns.map((column) => (
        <td
          key={column.key}
          className="px-6 py-5"
        >
          <div className="h-5 animate-pulse rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}

function TablePagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  previousDisabled = currentPage <= 1,
  nextDisabled = currentPage >= totalPages,
  label,
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        {label || (
          <>
            Page{" "}
            <span className="font-black text-slate-950">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-black text-slate-950">
              {totalPages}
            </span>
          </>
        )}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={previousDisabled}
          className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="ui-button-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default DataTable;