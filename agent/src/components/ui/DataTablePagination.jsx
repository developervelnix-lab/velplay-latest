import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const DataTablePagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2.5 px-4 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-300 text-xs mt-3">
      {/* Items per page selector & status text */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange && onPageSizeChange(Number(e.target.value));
              onPageChange && onPageChange(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-[11px] font-bold text-slate-400">entries</span>
        </div>

        <span className="text-[11px] font-medium text-slate-400">
          Showing <span className="font-bold text-slate-200">{startItem}</span> to <span className="font-bold text-slate-200">{endItem}</span> of <span className="font-bold text-slate-200">{totalItems}</span> entries
        </span>
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center gap-1 font-bold text-[11px] px-2.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>

        <span className="px-2.5 py-1 font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          {currentPage} / {Math.max(1, totalPages)}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center gap-1 font-bold text-[11px] px-2.5"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
