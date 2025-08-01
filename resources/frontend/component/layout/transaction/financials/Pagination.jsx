import React from "react";

const Pagination = ({ 
    currentPage, 
    totalPages, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange 
}) => {
    return (
        <div className="flex gap-3 items-center my-4 px-4 print:hidden">
            <div className="flex items-center gap-2">
                <label className="text-sm">Rows per page:</label>
                <select
                    value={rowsPerPage}
                    onChange={(e) => onRowsPerPageChange(parseInt(e.target.value))}
                    className="border px-2 py-1 rounded"
                >
                    {[2, 4, 6, 8, 10, 20, 50, 100].map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="text-sm">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    disabled={totalPages === 0 || currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;