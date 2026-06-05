import React from 'react';

const PaginationFooter = ({ currentPage, totalPages, totalEntries, startIndex, rowsPerPage, onPageChange, onRowsPerPageChange }) => {
  return (
    <div className="bg-surface-container px-6 py-2 flex flex-col sm:flex-row justify-between items-center border-t border-outline-variant gap-2">
      <div className="flex flex-wrap items-center gap-8">
        <p className="font-label-md text-label-md text-secondary">
          Showing <span className="text-on-surface font-bold">{totalEntries > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + rowsPerPage, totalEntries)}</span> of <span className="text-on-surface font-bold">{totalEntries}</span> entries
        </p>
        <div className="flex items-center gap-2">
          <span className="font-label-md text-label-md text-secondary font-semibold">Rows per page:</span>
          <select value={rowsPerPage} onChange={(e) => onRowsPerPageChange(parseInt(e.target.value))} className="bg-transparent border-none font-label-md text-label-md focus:ring-0 cursor-pointer p-0 font-bold">
            <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
          </select>
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1 hover:bg-surface-container-high rounded transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer">
          <span className="material-symbols-outlined select-none">chevron_left</span>
        </button>
        <div className="flex gap-1 select-none">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => onPageChange(i + 1)} className={`w-8 h-8 flex items-center justify-center font-label-md text-label-md rounded cursor-pointer ${currentPage === i + 1 ? 'bg-primary text-white font-bold shadow' : 'hover:bg-surface-container-high text-secondary'}`}>{i + 1}</button>
          ))}
        </div>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1 hover:bg-surface-container-high rounded transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer">
          <span className="material-symbols-outlined select-none">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default PaginationFooter;
