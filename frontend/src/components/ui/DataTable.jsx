import React from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  searchTerm = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  emptyMessage = "No records found.",
  actions,
  pagination,
}) => {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {(onSearchChange || actions) && (
        <div
          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--bg-subtle)",
          }}
        >
          {onSearchChange ? (
            <div className="relative flex-1 max-w-sm">
              <Search
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="form-input pl-10"
              />
            </div>
          ) : (
            <div />
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderBottom: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm" style={{ color: "var(--text-primary)" }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {columns.map((__, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="skeleton h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: "var(--accent-subtle)", border: "1px solid var(--accent-muted)" }}
                    >
                      <Inbox className="w-6 h-6" style={{ color: "var(--accent)" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {emptyMessage}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        No data to display at the moment.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-5 py-3.5 align-middle ${col.className || ""}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div
          className="px-5 py-3 flex items-center justify-between text-xs"
          style={{
            borderTop: "1px solid var(--border)",
            backgroundColor: "var(--bg-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            Showing <span className="font-bold" style={{ color: "var(--text-primary)" }}>{data.length}</span> records
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="p-1.5 rounded-lg transition disabled:opacity-40 disabled:pointer-events-none"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-secondary)",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="p-1.5 rounded-lg transition disabled:opacity-40 disabled:pointer-events-none"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-secondary)",
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
