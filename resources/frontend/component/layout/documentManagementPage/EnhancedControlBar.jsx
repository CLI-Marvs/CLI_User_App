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
}) => {
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    const isFilterActive = statusFilter !== "All";

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-6 py-4">
                {/* Main Controls Row */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Left Section - Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
                        {/* Enhanced Search Input */}
                        <div className="relative w-full sm:w-80">
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
                            <input
                                type="text"
                                placeholder="Search accounts..."
                                value={searchTerm}
                                onChange={onSearchChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-colors duration-200 text-sm bg-white placeholder-gray-500"
                            />
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

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium ${
                                showFilters || isFilterActive
                                    ? "bg-white border-custom-lightgreen text-custom-lightgreen"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
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
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                />
                            </svg>
                            Filters
                        </button>

                        {/* Refresh Button */}
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                className={`relative flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${
                                    isRefreshing
                                        ? "bg-blue-50 border-blue-300 shadow-sm animate-refresh-glow"
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

                    {/* Right Section - View Controls and Actions */}
                    <div className="flex items-center gap-3">
                        {/* Items Per Page */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                                Show:
                            </span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) =>
                                    onItemsPerPageChange(e.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-colors duration-200 text-sm bg-white"
                            >
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2.5 gradient-btn5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium text-white">
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
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expandable Filters Row */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
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
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <button
                                onClick={() => onStatusFilterChange("All")}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
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
