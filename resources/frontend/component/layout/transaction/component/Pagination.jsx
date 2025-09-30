import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} entries
        </p>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="h-8 w-20 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span className="text-sm text-muted-foreground">per page</span>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 flex items-center justify-center border border-gray-300 rounded-md text-sm disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`h-8 w-8 p-0 flex items-center justify-center border rounded-md text-sm ${
              page === currentPage
                ? "bg-custom-solidgreen hover:bg-custom-solidgreen/90 text-white"
                : "border-gray-300"
            } ${page === '...' ? 'pointer-events-none opacity-50' : ''}`}
          >
            {page === '...'
              ? <MoreHorizontal className="h-4 w-4" />
              : page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0 flex items-center justify-center border border-gray-300 rounded-md text-sm disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
