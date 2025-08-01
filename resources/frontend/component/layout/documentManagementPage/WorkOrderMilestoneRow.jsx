import React, { useState } from "react";
import { Typography } from "@material-tailwind/react";

const WorkOrderMilestoneRow = ({
    row,
    steps,
    getStatusBadge,
    handleOpenNotesModal,
    onShowFiles,
    currentChecklistInfo,
    onMilestoneProgression,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [hoveredChecklistInfo, setHoveredChecklistInfo] = useState(null);

    const handleMouseEnter = (e, checklistInfo) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        });
        setHoveredChecklistInfo(checklistInfo);
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
        setHoveredChecklistInfo(null);
    };
    // Determine if this row should have a bottom border
    // You can adjust this logic as needed (e.g., pass a prop like isLastRow)
    const hasBottomBorder = !row.isLastRow; // Example: set row.isLastRow=true for last row
    const stickyTdClass = `px-3 py-2 font-medium text-gray-900 sticky left-0 bg-white z-40 border-r border-gray-200`;

    return (
        <>
            <tr key={row.key} className={`transition-colors`}>
                <td className={stickyTdClass}>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-sm font-medium text-gray-900 truncate"
                            title={row.accountName}
                        >
                            {row.accountName}
                        </span>
                    </div>
                </td>
                {Array.isArray(row.stepData) &&
                    row.stepData.map((step, i) => {
                        const currentStep = steps[i];
                        const isCurrentStep =
                            currentStep &&
                            currentStep.subMilestones.some(
                                (sub) => sub.id === row.currentSubMilestoneId
                            );
                        return step.map((completion, j) => {
                            const currentSubmilestone =
                                currentStep?.subMilestones[j];
                            const isCurrent =
                                isCurrentStep &&
                                currentSubmilestone &&
                                currentSubmilestone.id ===
                                    row.currentSubMilestoneId;

                            // Show tooltip for all CURRENT cells in the step
                            // Instead of using the same currentChecklistInfo for all, use the correct info for the hovered cell
                            let checklistInfoForCell = null;
                            if (
                                isCurrentStep &&
                                row.checklistInfos &&
                                Array.isArray(row.checklistInfos)
                            ) {
                                // Try to find the checklist info for this submilestone
                                checklistInfoForCell = row.checklistInfos.find(
                                    (info) =>
                                        info &&
                                        info.subMilestoneId ===
                                            currentSubmilestone?.id
                                );
                            } else if (isCurrentStep && currentChecklistInfo) {
                                checklistInfoForCell = currentChecklistInfo;
                            }

                            const attachTooltip =
                                isCurrentStep && checklistInfoForCell;

                            // Apply green background only to step cells if complete
                            const isRowComplete =
                                row.status &&
                                row.status.toLowerCase() === "complete";

                            const cellContent = (
                                <td
                                    className={`px-0 py-0 relative ${
                                        isCurrentStep && !isRowComplete
                                            ? "border-2 border-blue-600 shadow-lg ring-2 ring-blue-300 ring-opacity-50 z-30"
                                            : "border border-gray-200"
                                    } ${
                                        isRowComplete
                                            ? "bg-green-500 bg-opacity-20"
                                            : ""
                                    }`}
                                    colSpan={2}
                                    style={{
                                        backgroundColor:
                                            isCurrentStep && !isRowComplete
                                                ? "#dbeafe"
                                                : isRowComplete
                                                ? ""
                                                : "inherit",
                                    }}
                                    onMouseEnter={
                                        attachTooltip
                                            ? (e) =>
                                                  handleMouseEnter(
                                                      e,
                                                      checklistInfoForCell
                                                  )
                                            : undefined
                                    }
                                    onMouseLeave={
                                        attachTooltip
                                            ? handleMouseLeave
                                            : undefined
                                    }
                                >
                                    <div
                                        className={`absolute inset-0 ${
                                            isCurrentStep
                                                ? "opacity-30"
                                                : "opacity-20"
                                        } ${
                                            row.status &&
                                            row.status.toLowerCase() ===
                                                "complete"
                                                ? ""
                                                : completion === 100
                                                ? "bg-green-500"
                                                : completion > 0
                                                ? "bg-amber-500"
                                                : "bg-gray-200"
                                        }`}
                                        style={{ width: `${completion}%` }}
                                    ></div>
                                    <div className="flex relative z-20">
                                        <div className="flex-1 px-2 py-2 text-center border-r border-gray-100">
                                            <span
                                                className={`text-xs ${
                                                    isCurrentStep &&
                                                    (!row.status ||
                                                        row.status.toLowerCase() !==
                                                            "complete")
                                                        ? "text-blue-800 font-semibold"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {new Date().toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        year: "2-digit",
                                                    }
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex-1 px-2 py-2 text-center">
                                            <span
                                                className={`text-xs ${
                                                    isCurrentStep &&
                                                    (!row.status ||
                                                        row.status.toLowerCase() !==
                                                            "complete")
                                                        ? "text-blue-800 font-semibold"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {completion > 0
                                                    ? new Date().toLocaleDateString(
                                                          "en-US",
                                                          {
                                                              month: "2-digit",
                                                              day: "2-digit",
                                                              year: "2-digit",
                                                          }
                                                      )
                                                    : "-"}
                                            </span>
                                        </div>
                                    </div>
                                    {isCurrentStep &&
                                        (!row.status ||
                                            row.status.toLowerCase() !==
                                                "complete") && (
                                            <>
                                                <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-blue-600 rounded-full animate-pulse border border-white shadow-sm"></div>
                                                <div className="absolute top-0.5 right-0.5 px-1 py-0.5 bg-blue-600 text-white text-[8px] rounded font-bold shadow-sm leading-none">
                                                    CURRENT
                                                </div>
                                            </>
                                        )}
                                </td>
                            );

                            return (
                                <React.Fragment key={`${i}-${j}`}>
                                    {cellContent}
                                </React.Fragment>
                            );
                        });
                    })}
                <td className="px-2 py-2 text-center border-l border-b border-gray-200">
                    <div className="flex justify-center">
                        {getStatusBadge(row.status)}
                    </div>
                </td>
                <td className="px-2 py-2 text-xs text-gray-600 border-l border-b border-gray-200">
                    <div className="flex items-center gap-1 max-w-[150px]">
                        <span className="truncate" title={row.remarks}>
                            {row.remarks}
                        </span>
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-800"
                            onClick={() => handleOpenNotesModal(row.notesData)}
                            style={{
                                padding: 0,
                                background: "none",
                                border: "none",
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path
                                    fillRule="evenodd"
                                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </td>
                <td className="px-2 py-2 border-l border-b border-gray-200">
                    <div className="flex justify-center gap-1">
                        <button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs font-medium rounded"
                            onClick={onShowFiles}
                        >
                            Files
                        </button>
                        {/* {currentChecklistInfo &&
                            currentChecklistInfo.progressPercentage === 100 && (
                                <button
                                    type="button"
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs font-medium rounded"
                                    onClick={() =>
                                        onMilestoneProgression &&
                                        onMilestoneProgression(row.key)
                                    }
                                    title="Progress to next milestone"
                                >
                                    Next
                                </button>
                            )} */}
                    </div>
                </td>
            </tr>

            {/* Custom Tooltip */}
            {showTooltip && hoveredChecklistInfo && (
                <div
                    className="fixed z-[9999] pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform:
                            tooltipPosition.y < window.innerHeight / 2
                                ? "translate(-50%, 75px)"
                                : "translate(-50%, -100%)",
                    }}
                >
                    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-600/50 backdrop-blur-sm max-w-sm min-w-72">
                        {/* Header Section */}
                        <div className="mb-4 pb-3 border-b border-slate-600/30">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-white leading-tight mb-1">
                                        {hoveredChecklistInfo.stepName}
                                    </h3>
                                    <p className="text-xs text-slate-300 font-medium">
                                        {hoveredChecklistInfo.milestoneName}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="inline-flex items-center px-2.5 py-1 bg-slate-700/50 rounded-full border border-slate-600/30">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></div>
                                        <span className="text-xs font-semibold text-emerald-400">
                                            {
                                                hoveredChecklistInfo.progressPercentage
                                            }
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-slate-300">
                                    Overall Progress
                                </span>
                                <span className="text-xs text-slate-400">
                                    {hoveredChecklistInfo.completedChecklists
                                        ?.length || 0}{" "}
                                    /{" "}
                                    {(hoveredChecklistInfo.completedChecklists
                                        ?.length || 0) +
                                        (hoveredChecklistInfo.pendingChecklists
                                            ?.length || 0)}{" "}
                                    tasks
                                </span>
                            </div>
                            <div className="relative w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                    style={{
                                        width: `${hoveredChecklistInfo.progressPercentage}%`,
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Completed Checklists Section */}
                        {hoveredChecklistInfo.completedChecklists &&
                            hoveredChecklistInfo.completedChecklists.length >
                                0 && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-4 h-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                        </div>
                                        <h4 className="text-sm font-semibold text-emerald-400">
                                            Completed (
                                            {
                                                hoveredChecklistInfo
                                                    .completedChecklists.length
                                            }
                                            )
                                        </h4>
                                    </div>
                                    <div className="space-y-1">
                                        {hoveredChecklistInfo.completedChecklists
                                            .slice(0, 4)
                                            .map((checklist, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 p-1 bg-slate-800/30 rounded border border-slate-700/30"
                                                >
                                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-slate-200 text-xs truncate">
                                                            {checklist.name}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium ${
                                                            checklist.completedVia ===
                                                            "document"
                                                                ? "bg-blue-500/80"
                                                                : "bg-purple-500/80"
                                                        }`}
                                                    >
                                                        {checklist.completedVia ===
                                                        "document"
                                                            ? "Docs Upload"
                                                            : "Remarks"}
                                                    </div>
                                                </div>
                                            ))}
                                        {hoveredChecklistInfo
                                            .completedChecklists.length > 4 && (
                                            <div className="text-slate-400 text-xs text-center py-1 bg-slate-800/20 rounded border border-slate-700/20">
                                                +
                                                {hoveredChecklistInfo
                                                    .completedChecklists
                                                    .length - 4}{" "}
                                                more completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Pending Checklists Section */}
                        {hoveredChecklistInfo.pendingChecklists &&
                            hoveredChecklistInfo.pendingChecklists.length >
                                0 && (
                                <div className="border-t border-slate-600/30 pt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-4 h-4 bg-amber-500/20 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                        </div>
                                        <h4 className="text-sm font-semibold text-amber-400">
                                            Pending (
                                            {
                                                hoveredChecklistInfo
                                                    .pendingChecklists.length
                                            }
                                            )
                                        </h4>
                                    </div>
                                    <div className="space-y-1">
                                        {hoveredChecklistInfo.pendingChecklists
                                            .slice(0, 3)
                                            .map((checklist, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 p-1 bg-slate-800/20 rounded border border-slate-700/20"
                                                >
                                                    <div className="w-1.5 h-1.5 bg-amber-400/70 rounded-full flex-shrink-0"></div>
                                                    <div className="text-slate-300 text-xs truncate">
                                                        {checklist.name}
                                                    </div>
                                                </div>
                                            ))}
                                        {hoveredChecklistInfo.pendingChecklists
                                            .length > 3 && (
                                            <div className="text-slate-400 text-xs text-center py-1 bg-slate-800/10 rounded border border-slate-700/10">
                                                +
                                                {hoveredChecklistInfo
                                                    .pendingChecklists.length -
                                                    3}{" "}
                                                more pending
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Dynamic Tooltip Arrow */}
                        <div
                            className={`absolute left-1/2 transform -translate-x-1/2 ${
                                tooltipPosition.y < window.innerHeight / 2
                                    ? "-top-[6px]"
                                    : "top-full -mt-px"
                            }`}
                        >
                            <div className="relative">
                                {tooltipPosition.y < window.innerHeight / 2 ? (
                                    // Arrow pointing up (tooltip below cursor)
                                    <>
                                        <div className="border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-slate-800"></div>
                                        <div className="absolute -bottom-[7px] left-1/2 transform -translate-x-1/2">
                                            <div className="border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-slate-600/50"></div>
                                        </div>
                                    </>
                                ) : (
                                    // Arrow pointing down (tooltip above cursor)
                                    <>
                                        <div className="border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-800"></div>
                                        <div className="absolute -top-[7px] left-1/2 transform -translate-x-1/2">
                                            <div className="border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-slate-600/50"></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WorkOrderMilestoneRow;
