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

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        });
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };
    return (
        <>
            <tr
                key={row.key}
                className={`border-b border-gray-100 hover:bg-blue-50 transition-colors`}
            >
                <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-inherit z-10 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                        <span
                            className="text-sm font-medium text-gray-900 truncate"
                            title={row.accountName}
                        >
                            {row.accountName}
                        </span>
                    </div>
                </td>
                {row.stepData.map((step, i) => {
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

                        const cellContent = (
                            <td
                                className={`px-0 py-0 relative ${
                                    isCurrentStep
                                        ? "border-2 border-blue-600 shadow-lg ring-2 ring-blue-300 ring-opacity-50"
                                        : "border border-gray-200"
                                }`}
                                colSpan={2}
                                style={{
                                    backgroundColor: isCurrentStep
                                        ? "#dbeafe"
                                        : "inherit",
                                }}
                                onMouseEnter={
                                    isCurrent && currentChecklistInfo
                                        ? handleMouseEnter
                                        : undefined
                                }
                                onMouseLeave={
                                    isCurrent && currentChecklistInfo
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
                                        completion === 100
                                            ? "bg-green-500"
                                            : completion > 0
                                            ? "bg-amber-500"
                                            : "bg-gray-200"
                                    }`}
                                    style={{ width: `${completion}%` }}
                                ></div>
                                <div className="flex relative z-10">
                                    <div className="flex-1 px-2 py-2 text-center border-r border-gray-100">
                                        <span
                                            className={`text-xs ${
                                                isCurrentStep
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
                                                isCurrentStep
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
                                {isCurrentStep && (
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
                <td className="px-2 py-2 text-center border-l border-gray-200">
                    <div className="flex justify-center">
                        {getStatusBadge(row.status)}
                    </div>
                </td>
                <td className="px-2 py-2 text-xs text-gray-600 border-l border-gray-200">
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
                <td className="px-2 py-2 border-l border-gray-200">
                    <div className="flex justify-center gap-1">
                        <button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs font-medium rounded"
                            onClick={onShowFiles}
                        >
                            Files
                        </button>
                        {currentChecklistInfo &&
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
                            )}
                    </div>
                </td>
            </tr>

            {/* Custom Tooltip */}
            {showTooltip && currentChecklistInfo && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: "translate(-50%, -100%)",
                    }}
                >
                    <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700 max-w-sm">
                        <div className="text-sm font-semibold mb-2">
                            {currentChecklistInfo.stepName} -{" "}
                            {currentChecklistInfo.milestoneName}
                        </div>

                        <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-300">
                                    Progress:
                                </span>
                                <span className="text-xs text-white font-medium">
                                    {currentChecklistInfo.progressPercentage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-1.5">
                                <div
                                    className="bg-green-400 h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${currentChecklistInfo.progressPercentage}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        {currentChecklistInfo.completedChecklists &&
                            currentChecklistInfo.completedChecklists.length >
                                0 && (
                                <div className="mb-3">
                                    <div className="text-sm font-medium mb-2">
                                        Completed Checklists (
                                        {
                                            currentChecklistInfo
                                                .completedChecklists.length
                                        }
                                        ):
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {currentChecklistInfo.completedChecklists.map(
                                            (checklist, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-2"
                                                >
                                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                                    <div className="flex-1">
                                                        <div className="text-gray-200 text-xs">
                                                            {checklist.name}
                                                        </div>
                                                        <div className="text-gray-400 text-xs">
                                                            {checklist.completedVia ===
                                                            "document"
                                                                ? "Document uploaded"
                                                                : "Manually completed"}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {currentChecklistInfo.pendingChecklists &&
                            currentChecklistInfo.pendingChecklists.length >
                                0 && (
                                <div className="border-t border-gray-600 pt-2">
                                    <div className="text-sm font-medium mb-1">
                                        Pending Checklists (
                                        {
                                            currentChecklistInfo
                                                .pendingChecklists.length
                                        }
                                        ):
                                    </div>
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                        {currentChecklistInfo.pendingChecklists
                                            .slice(0, 3)
                                            .map((checklist, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-2"
                                                >
                                                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                                    <div className="text-gray-300 text-xs">
                                                        {checklist.name}
                                                    </div>
                                                </div>
                                            ))}
                                        {currentChecklistInfo.pendingChecklists
                                            .length > 3 && (
                                            <div className="text-gray-400 text-xs ml-4">
                                                ... and{" "}
                                                {currentChecklistInfo
                                                    .pendingChecklists.length -
                                                    3}{" "}
                                                more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                            <div className="border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WorkOrderMilestoneRow;
