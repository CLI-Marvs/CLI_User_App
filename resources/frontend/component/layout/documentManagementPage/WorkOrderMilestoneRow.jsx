import React from "react";

const WorkOrderMilestoneRow = ({
    row,
    steps,
    getStatusBadge,
    handleOpenNotesModal,
}) => {
    return (
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
                return step.map((completion, j) => (
                    <React.Fragment key={`${i}-${j}`}>
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
                        >
                            <div
                                className={`absolute inset-0 ${
                                    isCurrentStep ? "opacity-30" : "opacity-20"
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
                    </React.Fragment>
                ));
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
                <div className="flex justify-center">
                    <button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs font-medium rounded"
                        onClick={row.onAddFilesClick}
                    >
                        Files
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default WorkOrderMilestoneRow;
