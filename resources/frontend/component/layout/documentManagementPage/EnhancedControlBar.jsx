import React, { useState } from "react";

const EnhancedControlBar = ({
    searchTerm,
    onSearchChange,
    itemsPerPage,
    onItemsPerPageChange,
    statusFilter,
    onStatusFilterChange,
    onRefresh,
    isRefreshing,
    hideItemsPerPage = false, // New prop to hide items per page control
    hideStatusFilter = false, // New prop to hide status filter
}) => {
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    const isFilterActive = statusFilter !== "All";

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 py-3 md:px-8 md:py-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Search, Status Filter, Refresh */}
                    <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                        {/* Search */}
                        <div className="relative w-64 max-w-full">
                            <input
                                type="text"
                                placeholder="Search accounts..."
                                value={searchTerm}
                                onChange={onSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-colors duration-200 text-sm bg-white placeholder-gray-500 shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() =>
                                        onSearchChange({
                                            target: { value: "" },
                                        })
                                    }
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {/* Status Filter (conditionally visible) */}
                        {!hideStatusFilter && (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                                <label
                                    htmlFor="status-filter"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Status:
                                </label>
                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        onStatusFilterChange(e.target.value)
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-colors duration-200 text-sm bg-white"
                                >
                                    <option value="All">All</option>
                                    <option value="In Progress">
                                        In Progress
                                    </option>
                                    <option value="Complete">Complete</option>
                                </select>
                            </div>
                        )}
                        {/* Refresh Button */}
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                className={`relative flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white transition-all duration-300 ease-in-out hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                                    isRefreshing
                                        ? "bg-blue-50 border-blue-300 animate-refresh-glow"
                                        : "hover:bg-gray-50 hover:border-gray-400"
                                }`}
                                title="Refresh data"
                            >
                                <svg
                                    className={`h-4 w-4 text-gray-600 transition-all duration-300 ${
                                        isRefreshing
                                            ? "animate-spin text-blue-600"
                                            : "hover:text-gray-800"
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                {isRefreshing && (
                                    <div className="absolute inset-0 rounded-lg border-2 border-blue-400 opacity-30 animate-refresh-pulse"></div>
                                )}
                            </button>
                        )}
                    </div>
                    {/* Right: Items Per Page */}
                    {!hideItemsPerPage && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm text-gray-600 whitespace-nowrap font-medium">
                                Show
                            </span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) =>
                                    onItemsPerPageChange(e.target.value)
                                }
                                className="px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-colors duration-200 text-sm bg-white"
                            >
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                            </select>
                            <span className="text-sm text-gray-500 ml-1">
                                rows
                            </span>
                        </div>
                    )}
                </div>
                {/* No expandable filters row, status filter is always visible above */}
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes refreshPulse {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.05);
                        opacity: 0.8;
                    }
                }
                @keyframes refreshGlow {
                    0%,
                    100% {
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-refresh-pulse {
                    animation: refreshPulse 1.5s ease-in-out infinite;
                }
                .animate-refresh-glow {
                    animation: refreshGlow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default EnhancedControlBar;
