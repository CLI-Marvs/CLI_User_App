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
    hideItemsPerPage = false,
    hideStatusFilter = false,
    // New filter props
    buyerFilter,
    onBuyerFilterChange,
    showStepView,
    onStepViewToggle,
    assigneeFilter,
    onAssigneeFilterChange,
    availableAssignees = [],
    // Step visibility props
    availableSteps = [],
    visibleSteps = new Set(),
    onStepVisibilityToggle,
    onToggleAllSteps,
    // Step assignee filter props
    stepAssigneeFilter = "All",
    onStepAssigneeFilterChange,
    stepAssigneeFilterLabel = "Steps by:",
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
    const [showFilters, setShowFilters] = useState(false);

    const isFilterActive =
        statusFilter !== "All" ||
        buyerFilter !== "All" ||
        stepAssigneeFilter !== "All" ||
        hideCompletedChecklists === true ||
        (availableSteps.length > 0 &&
            visibleSteps.size > 0 &&
            visibleSteps.size < availableSteps.length);

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200 shadow-md">
            {/* Main Control Bar */}
            <div className="px-6 py-4">
                {/* Top Row: Search, Primary Filters, Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Enhanced Search */}
                    <div className="relative flex-1 min-w-[280px] max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
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
                            placeholder="Search accounts, properties, contracts..."
                            value={searchTerm}
                            onChange={onSearchChange}
                            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-all duration-200 text-sm bg-white placeholder-gray-400 shadow-sm hover:border-gray-300 hover:shadow-md"
                        />
                        {searchTerm && (
                            <button
                                onClick={() =>
                                    onSearchChange({ target: { value: "" } })
                                }
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg
                                    className="h-5 w-5"
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

                    {/* Quick Filters Group */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        {!hideStatusFilter && (
                            <div className="group relative">
                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        onStatusFilterChange(e.target.value)
                                    }
                                    className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-all duration-200 text-sm bg-white font-medium text-gray-700 hover:border-gray-300 hover:shadow-md cursor-pointer"
                                >
                                    <option value="All">All Status</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Complete">Complete</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg
                                        className="h-4 w-4 text-gray-400 group-hover:text-gray-600"
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
                                </div>
                            </div>
                        )}

                        {/* Buyer Filter */}
                        {!hideBuyerFilter && (
                            <div className="group relative">
                                <select
                                    id="buyer-filter"
                                    value={buyerFilter}
                                    onChange={(e) =>
                                        onBuyerFilterChange(e.target.value)
                                    }
                                    className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-all duration-200 text-sm bg-white font-medium text-gray-700 hover:border-gray-300 hover:shadow-md cursor-pointer"
                                >
                                    <option value="All">All Types</option>
                                    <option value="Buyer Related">Buyer Related</option>
                                    <option value="Non-buyer">Non-buyer</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg
                                        className="h-4 w-4 text-gray-400 group-hover:text-gray-600"
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
                                </div>
                            </div>
                        )}

                        {/* Step Assignee Filter */}
                        {!hideStepAssigneeFilter && showStepView && (
                            <div className="group relative">
                                <div className="flex items-center gap-2 px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        {stepAssigneeFilterLabel}
                                    </span>
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
                                        className={`appearance-none pl-2 pr-8 py-0.5 border-0 focus:ring-2 focus:ring-custom-lightgreen transition-all duration-200 text-sm bg-transparent font-medium text-gray-700 cursor-pointer ${
                                            availableAssignees.length === 0
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        <option value="All">
                                            {availableAssignees.length === 0
                                                ? "No Assignees"
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
                                    <svg
                                        className="absolute right-3 h-4 w-4 text-gray-400 group-hover:text-gray-600 pointer-events-none"
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
                                </div>
                            </div>
                        )}

                        {/* Hide Completed Checklists */}
                        {!hideCompletedChecklistsFilter && (
                            <label className="flex items-center gap-2 px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300 hover:shadow-md transition-all duration-200 group">
                                <input
                                    type="checkbox"
                                    checked={hideCompletedChecklists}
                                    onChange={(e) =>
                                        onHideCompletedChecklistsChange &&
                                        onHideCompletedChecklistsChange(
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                                />
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    Hide Completed
                                </span>
                            </label>
                        )}

                        {/* Clear All Filters */}
                        {isFilterActive && (
                            <button
                                onClick={() => {
                                    onStatusFilterChange && onStatusFilterChange("All");
                                    onBuyerFilterChange && onBuyerFilterChange("All");
                                    onStepAssigneeFilterChange && onStepAssigneeFilterChange("All");
                                    onHideCompletedChecklistsChange && onHideCompletedChecklistsChange(false);
                                    if (availableSteps.length > 0) {
                                        onToggleAllSteps(true);
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border-2 border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                                title="Clear all active filters"
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
                                <span className="hidden sm:inline">Clear Filters</span>
                            </button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-auto">
                        {/* Column Visibility */}
                        {!hideStepVisibility &&
                            availableSteps.length > 0 &&
                            showStepView && (
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setShowFilters(!showFilters)
                                        }
                                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200 font-medium text-sm text-gray-700"
                                    >
                                        <svg
                                            className="w-4 h-4"
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
                                        <span className="hidden sm:inline">
                                            Columns
                                        </span>
                                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                            {visibleSteps.size}/{availableSteps.length}
                                        </span>
                                    </button>

                                    {showFilters && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-[55]"
                                                onClick={() =>
                                                    setShowFilters(false)
                                                }
                                            />
                                            <div className="absolute top-full right-0 mt-2 w-80 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-[60] max-h-96 overflow-hidden">
                                                <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b-2 border-gray-200 flex items-center justify-between">
                                                    <span className="text-sm font-bold text-gray-800">
                                                        Column Visibility
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            onToggleAllSteps(
                                                                visibleSteps.size !==
                                                                    availableSteps.length
                                                            )
                                                        }
                                                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors"
                                                    >
                                                        {visibleSteps.size ===
                                                        availableSteps.length
                                                            ? "Hide All"
                                                            : "Show All"}
                                                    </button>
                                                </div>
                                                <div className="p-2 max-h-80 overflow-y-auto">
                                                    {availableSteps.map((step) => (
                                                        <label
                                                            key={step.id}
                                                            className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-150 group"
                                                        >
                                                            <div className="flex items-center flex-1">
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
                                                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                                                                />
                                                                <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900">
                                                                    {step.stepName}
                                                                </span>
                                                            </div>
                                                            {stepAssigneeFilter !==
                                                                "All" && (
                                                                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                                                                    Filtered
                                                                </span>
                                                            )}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                        {/* Refresh Button */}
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                className={`relative flex items-center justify-center px-4 py-2.5 rounded-lg border-2 font-medium transition-all duration-300 ${
                                    isRefreshing
                                        ? "bg-blue-50 border-blue-300 text-blue-600"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title="Refresh data"
                            >
                                <svg
                                    className={`h-5 w-5 transition-all duration-300 ${
                                        isRefreshing ? "animate-spin" : ""
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
                            </button>
                        )}

                        {/* Items Per Page */}
                        {!hideItemsPerPage && (
                            <div className="flex items-center gap-2 px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Show
                                </span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) =>
                                        onItemsPerPageChange(e.target.value)
                                    }
                                    className="appearance-none border-0 px-2 py-0.5 focus:ring-2 focus:ring-custom-lightgreen transition-all duration-200 text-sm bg-transparent font-bold text-gray-700 cursor-pointer"
                                >
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="200">200</option>
                                </select>
                                <span className="text-xs font-medium text-gray-500">
                                    rows
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedControlBar;