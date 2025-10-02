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
    // New filter props
    buyerFilter,
    onBuyerFilterChange,
    showStepView,
    onStepViewToggle,
    assigneeFilter,
    onAssigneeFilterChange,
    availableAssignees = [], // List of assignees for dropdown
    // Step visibility props
    availableSteps = [],
    visibleSteps = new Set(),
    onStepVisibilityToggle,
    onToggleAllSteps,
    // Step assignee filter props
    stepAssigneeFilter = "All",
    onStepAssigneeFilterChange,
    hideBuyerFilter = false,
    hideStepViewToggle = false,
    hideAssigneeFilter = false,
    hideStepVisibility = false,
    hideStepAssigneeFilter = false,
    // Completed checklist filter props
    hideCompletedChecklists = false,
    onHideCompletedChecklistsChange,
    hideCompletedChecklistsFilter = false,
}) => {
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    const isFilterActive =
        statusFilter !== "All" ||
        buyerFilter !== "All" ||
        assigneeFilter !== "All" ||
        stepAssigneeFilter !== "All" ||
        (availableSteps.length > 0 &&
            visibleSteps.size < availableSteps.length) ||
        hideCompletedChecklists;

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

                        {/* Buyer Filter */}
                        {!hideBuyerFilter && (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                                <label
                                    htmlFor="buyer-filter"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Type:
                                </label>
                                <select
                                    id="buyer-filter"
                                    value={buyerFilter}
                                    onChange={(e) =>
                                        onBuyerFilterChange(e.target.value)
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-colors duration-200 text-sm bg-white"
                                >
                                    <option value="All">All</option>
                                    <option value="Buyer Related">
                                        Buyer Related
                                    </option>
                                    <option value="Non-buyer">Non-buyer</option>
                                </select>
                            </div>
                        )}

                        {/* Step Assignee Filter */}
                        {!hideStepAssigneeFilter && showStepView && (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                                <label
                                    htmlFor="step-assignee-filter"
                                    className="text-sm font-medium text-gray-700 whitespace-nowrap"
                                >
                                    Steps by:
                                </label>
                                <select
                                    id="step-assignee-filter"
                                    value={stepAssigneeFilter}
                                    onChange={(e) =>
                                        onStepAssigneeFilterChange &&
                                        onStepAssigneeFilterChange(
                                            e.target.value
                                        )
                                    }
                                    disabled={availableAssignees.length === 0}
                                    className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-colors duration-200 text-sm bg-white max-w-48 ${
                                        availableAssignees.length === 0
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <option value="All">
                                        {availableAssignees.length === 0
                                            ? "No Assignees Available"
                                            : "All Assignees"}
                                    </option>
                                    {availableAssignees.map((assignee) => (
                                        <option
                                            key={assignee.id}
                                            value={assignee.id}
                                        >
                                            {assignee.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Hide Completed Checklists Toggle */}
                        {!hideCompletedChecklistsFilter && (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hideCompletedChecklists}
                                        onChange={(e) =>
                                            onHideCompletedChecklistsChange &&
                                            onHideCompletedChecklistsChange(
                                                e.target.checked
                                            )
                                        }
                                        className="h-4 w-4 text-custom-lightgreen focus:ring-custom-lightgreen border-gray-300 rounded transition-colors duration-200"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                                        Hide Completed Checklists
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Step Visibility Selector */}
                        {!hideStepVisibility &&
                            availableSteps.length > 0 &&
                            showStepView && (
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setShowFilters(!showFilters)
                                        }
                                        className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <svg
                                            className="w-4 h-4 text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">
                                            Column Visibility (
                                            {visibleSteps.size}/
                                            {availableSteps.length})
                                        </span>
                                        <svg
                                            className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                                                showFilters ? "rotate-180" : ""
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {showFilters && (
                                        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-[60] max-h-64 overflow-y-auto">
                                            <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Select Visible Steps
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        onToggleAllSteps(
                                                            visibleSteps.size !==
                                                                availableSteps.length
                                                        )
                                                    }
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    {visibleSteps.size ===
                                                    availableSteps.length
                                                        ? "Hide All"
                                                        : "Show All"}
                                                </button>
                                            </div>
                                            <div className="p-2">
                                                {availableSteps.map((step) => {
                                                    // Find the assignee for this step (you may need to adjust this logic based on your data structure)
                                                    const stepAssignee =
                                                        availableAssignees.find(
                                                            (assignee) => {
                                                                // This logic assumes you can match step assignees - adjust as needed
                                                                return true; // Placeholder - implement actual logic
                                                            }
                                                        );

                                                    return (
                                                        <label
                                                            key={step.id}
                                                            className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded cursor-pointer transition-colors duration-200"
                                                        >
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={visibleSteps.has(
                                                                        step.id
                                                                    )}
                                                                    onChange={() =>
                                                                        onStepVisibilityToggle(
                                                                            step.id
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                                                                />
                                                                <span className="ml-3 text-sm text-gray-700 font-medium">
                                                                    {
                                                                        step.stepName
                                                                    }
                                                                </span>
                                                            </div>
                                                            {stepAssigneeFilter !==
                                                                "All" && (
                                                                <span className="text-xs text-gray-500 ml-2">
                                                                    Filtered
                                                                </span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {showFilters && (
                                        <div
                                            className="fixed inset-0 z-[55]"
                                            onClick={() =>
                                                setShowFilters(false)
                                            }
                                        />
                                    )}
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
