import React from "react";

const ChecklistTable = ({
    steps,
    accounts,
    onAddFiles,
    handleOpenNotesModal,
    currentUserId,
    onRefresh,
}) => {
    // Filter steps to only show milestones assigned to the current user for specific properties
    const filteredSteps = steps
        .map((step) => ({
            ...step,
            subMilestones: step.subMilestones.filter((milestone) => {
                console.log("Current user ID:", currentUserId);
                console.log("Milestone data:", milestone);

                // If no currentUserId is provided, show all milestones
                if (!currentUserId) {
                    console.log("No currentUserId, showing all milestones");
                    return true;
                }

                // Check if milestone has assignees data (from project_milestone_assignees table)
                const hasAssignees = milestone.milestone_assignees;
                console.log("Milestone assignees:", hasAssignees);

                if (hasAssignees && hasAssignees.length > 0) {
                    // Get all property names from the current accounts
                    const accountPropertyNames = accounts
                        .map(
                            (account) =>
                                account.property_name ||
                                account.project ||
                                account.account_name
                        )
                        .filter(Boolean);

                    console.log(
                        "Account property names:",
                        accountPropertyNames
                    );

                    // Check if current user is assigned to this milestone for any of the current properties
                    const isAssigned = hasAssignees.some((assignee) => {
                        const userMatches =
                            assignee.employee_id === currentUserId;
                        const propertyMatches = accountPropertyNames.includes(
                            assignee.property_name
                        );

                        console.log(
                            `Checking assignee: employee_id=${assignee.employee_id}, property_name=${assignee.property_name}, userMatches=${userMatches}, propertyMatches=${propertyMatches}`
                        );

                        return userMatches && propertyMatches;
                    });

                    console.log(
                        "Is assigned via milestone_assignees:",
                        isAssigned
                    );
                    return isAssigned;
                }

                // Fallback: Check other possible assignment fields
                const isAssigned =
                    milestone.assigned_to === currentUserId ||
                    milestone.assignees?.includes(currentUserId) ||
                    milestone.assigned_users?.some(
                        (user) =>
                            user.id === currentUserId || user === currentUserId
                    ) ||
                    milestone.assignee_id === currentUserId ||
                    milestone.user_id === currentUserId ||
                    milestone.assigned_user_id === currentUserId;

                console.log("Is assigned via other fields:", isAssigned);

                // Return false if no assignment found (proper filtering)
                return isAssigned;
            }),
        }))
        .filter((step) => step.subMilestones.length > 0);

    console.log("Filtered steps:", filteredSteps);
    console.log("Original steps:", steps);

    // Calculate total columns to prevent unnecessary stretching
    const totalColumns = filteredSteps.reduce(
        (sum, step) =>
            sum +
            step.subMilestones.reduce(
                (subSum, sub) => subSum + (sub.checklists?.length || 0) * 2,
                0
            ),
        0
    );

    // Filter accounts to show if:
    // - The account is currently on a submilestone assigned to the user, OR
    // - The account has completed all checklists for a submilestone assigned to the user
    const filteredAccounts = accounts.filter((account) => {
        let show = false;
        for (const step of filteredSteps) {
            for (const sub of step.subMilestones) {
                // Check if submilestone is assigned to the user
                let assignedToUser = false;
                const hasAssignees = sub.milestone_assignees;
                if (hasAssignees && hasAssignees.length > 0) {
                    assignedToUser = hasAssignees.some(
                        (assignee) => assignee.employee_id === currentUserId
                    );
                } else {
                    assignedToUser =
                        sub.assigned_to === currentUserId ||
                        (sub.assignees?.includes &&
                            sub.assignees.includes(currentUserId)) ||
                        (sub.assigned_users?.some &&
                            sub.assigned_users.some(
                                (user) =>
                                    user.id === currentUserId ||
                                    user === currentUserId
                            )) ||
                        sub.assignee_id === currentUserId ||
                        sub.user_id === currentUserId ||
                        sub.assigned_user_id === currentUserId;
                }
                if (!assignedToUser) continue;

                // 1. Show if account is currently on this submilestone
                if (account.current_submilestone_id === sub.id) {
                    show = true;
                    break;
                }

                // 2. Show if account has completed all checklists for this submilestone
                const checklists = sub.checklists || [];
                if (checklists.length > 0) {
                    const uploadedDocs = account.uploaded_documents || [];
                    const completedCount = checklists.filter((checklist) => {
                        const hasUploadedDoc = uploadedDocs.some(
                            (doc) => doc.file_title === checklist.name
                        );
                        const accountChecklistStatus = (
                            account.account_checklist_statuses || []
                        ).find(
                            (status) => status.checklist_id === checklist.id
                        );
                        const hasCompletedStatus =
                            accountChecklistStatus &&
                            accountChecklistStatus.is_completed;
                        return hasUploadedDoc || hasCompletedStatus;
                    }).length;
                    if (completedCount === checklists.length) {
                        show = true;
                        break;
                    }
                }
            }
            if (show) break;
        }
        return show;
    });

    // Build a flat list of all checklists under each milestone (step)
    // For each account, show a row for each checklist under each milestone
    return (
        <div className="w-full">
            <div
                className={`overflow-x-auto shadow-lg rounded-lg border border-gray-200 bg-white ${
                    totalColumns <= 4 ? "max-w-fit" : ""
                }`}
            >
                <table className="text-left border-collapse bg-white table-auto">
                    <thead>
                        {/* Row 1: Steps */}
                        <tr className="bg-custom-bluegreen text-white">
                            <th className="px-4 py-2.5 font-bold sticky left-0 bg-custom-bluegreen z-20 border-r border-white border-opacity-30 min-w-[220px] max-w-[220px] text-center shadow-lg"></th>
                            {filteredSteps.map((step, idx) => (
                                <th
                                    key={idx}
                                    colSpan={
                                        step.subMilestones.reduce(
                                            (sum, sub) =>
                                                sum +
                                                (sub.checklists?.length || 0),
                                            0
                                        ) * 2
                                    }
                                    className={`text-center px-3 py-2.5 font-bold text-sm border-x border-white border-opacity-30 min-w-[140px] transition-all duration-200 hover:bg-opacity-90 ${
                                        idx % 2 === 0
                                            ? "bg-custom-bluegreen"
                                            : "bg-teal-600"
                                    }`}
                                >
                                    <div className="flex items-center justify-center">
                                        <span className="font-semibold tracking-wide leading-tight">
                                            {step.stepName}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>

                        {/* Row 2: Milestones (actual milestone names) */}
                        <tr className="bg-custom-bluegreen text-white">
                            <th
                                rowSpan={2}
                                className="px-4 py-2.5 font-bold sticky left-0 bg-custom-bluegreen z-20 border-r border-white border-opacity-30 min-w-[220px] max-w-[220px] text-center align-middle text-sm shadow-lg"
                            >
                                <div className="flex items-center justify-center">
                                    <span className="font-bold tracking-wide text-white">
                                        ACCOUNT NAME
                                    </span>
                                </div>
                            </th>
                            {filteredSteps.map((step, stepIdx) =>
                                step.subMilestones.map((sub, subIdx) => (
                                    <th
                                        key={`${stepIdx}-${subIdx}`}
                                        colSpan={
                                            (sub.checklists?.length || 0) * 2
                                        }
                                        className={`text-center px-3 py-2.5 font-semibold text-sm border-x border-t border-white border-opacity-30 min-w-[180px] transition-all duration-200 hover:bg-opacity-90 ${
                                            stepIdx % 2 === 0
                                                ? "bg-custom-bluegreen"
                                                : "bg-teal-600"
                                        }`}
                                    >
                                        <div className="flex items-center justify-center">
                                            <span
                                                className="font-medium text-xs leading-tight px-1 text-center"
                                                title={
                                                    sub.milestoneName ||
                                                    sub.name
                                                }
                                            >
                                                {sub.milestoneName ||
                                                    sub.name ||
                                                    `M${subIdx + 1}`}
                                            </span>
                                        </div>
                                    </th>
                                ))
                            )}
                        </tr>

                        {/* Row 3: Checklists */}
                        <tr className="bg-custom-bluegreen text-white">
                            {filteredSteps.map((step, stepIdx) =>
                                step.subMilestones.map((sub, subIdx) =>
                                    (sub.checklists || []).map(
                                        (checklist, cIdx) => (
                                            <th
                                                key={`${stepIdx}-${subIdx}-${cIdx}`}
                                                colSpan={2}
                                                className={`text-center px-2 py-2.5 font-medium border-x border-y border-white border-opacity-30 min-w-[200px] transition-all duration-200 hover:bg-opacity-90 ${
                                                    stepIdx % 2 === 0
                                                        ? "bg-custom-bluegreen"
                                                        : "bg-teal-600"
                                                }`}
                                            >
                                                <div className="flex items-center justify-center px-1">
                                                    <span
                                                        className="text-xs font-semibold leading-tight text-center"
                                                        title={checklist.name}
                                                    >
                                                        {checklist.name.length >
                                                        22
                                                            ? checklist.name.substring(
                                                                  0,
                                                                  22
                                                              ) + "..."
                                                            : checklist.name}
                                                    </span>
                                                </div>
                                            </th>
                                        )
                                    )
                                )
                            )}
                        </tr>

                        {/* Row 4: Date and Remarks/Files */}
                        <tr className="bg-custom-bluegreen text-white">
                            <th className="px-4 py-1.5 font-medium sticky left-0 bg-custom-bluegreen z-20 border-r border-white border-opacity-30 shadow-lg"></th>
                            {filteredSteps.map((step, stepIdx) =>
                                step.subMilestones.map((sub, subIdx) =>
                                    (sub.checklists || []).map(
                                        (checklist, cIdx) => [
                                            <th
                                                key={`date-${stepIdx}-${subIdx}-${cIdx}`}
                                                className={`text-center px-2 py-1.5 font-medium border-x border-white border-opacity-30 min-w-[100px] w-[100px] transition-all duration-200 hover:bg-opacity-90 ${
                                                    stepIdx % 2 === 0
                                                        ? "bg-custom-bluegreen"
                                                        : "bg-teal-600"
                                                }`}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <span className="text-xs font-semibold flex items-center gap-1">
                                                        <svg
                                                            className="w-2.5 h-2.5"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Date
                                                    </span>
                                                </div>
                                            </th>,
                                            <th
                                                key={`remarks-${stepIdx}-${subIdx}-${cIdx}`}
                                                className={`text-center px-2 py-1.5 font-medium border-x border-white border-opacity-30 min-w-[100px] w-[100px] transition-all duration-200 hover:bg-opacity-90 ${
                                                    stepIdx % 2 === 0
                                                        ? "bg-custom-bluegreen"
                                                        : "bg-teal-600"
                                                }`}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <span className="text-xs font-semibold flex items-center gap-1">
                                                        <svg
                                                            className="w-2.5 h-2.5"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Remarks / Files
                                                    </span>
                                                </div>
                                            </th>,
                                        ]
                                    )
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.map((account, rowIdx) => (
                            <tr
                                key={account.id}
                                className={`${
                                    rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100`}
                            >
                                <td className="px-4 py-1.5 font-semibold text-gray-900 sticky left-0 bg-inherit z-10 border-r border-gray-200 shadow-sm min-w-[220px] max-w-[220px]">
                                    <div className="flex items-center">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                                        <span
                                            className="font-medium text-gray-800 text-sm truncate"
                                            title={account.account_name}
                                        >
                                            {account.account_name}
                                        </span>
                                    </div>
                                </td>
                                {filteredSteps.map((step, stepIdx) =>
                                    step.subMilestones.map((sub) => {
                                        // For STEP 1 (first step), always show action buttons
                                        let showActionButtons = false;
                                        if (stepIdx === 0) {
                                            showActionButtons = true;
                                        } else if (
                                            account.current_submilestone_id ===
                                            sub.id
                                        ) {
                                            showActionButtons = true;
                                        } else {
                                            const checklistsArr =
                                                sub.checklists || [];
                                            if (checklistsArr.length > 0) {
                                                const uploadedDocsArr =
                                                    account.uploaded_documents ||
                                                    [];
                                                const completedCount =
                                                    checklistsArr.filter(
                                                        (cl) => {
                                                            const hasUploadedDoc =
                                                                uploadedDocsArr.some(
                                                                    (doc) =>
                                                                        doc.file_title ===
                                                                        cl.name
                                                                );
                                                            const accountChecklistStatus =
                                                                (
                                                                    account.account_checklist_statuses ||
                                                                    []
                                                                ).find(
                                                                    (status) =>
                                                                        status.checklist_id ===
                                                                        cl.id
                                                                );
                                                            const hasCompletedStatus =
                                                                accountChecklistStatus &&
                                                                accountChecklistStatus.is_completed;
                                                            return (
                                                                hasUploadedDoc ||
                                                                hasCompletedStatus
                                                            );
                                                        }
                                                    ).length;
                                                if (
                                                    completedCount ===
                                                    checklistsArr.length
                                                ) {
                                                    showActionButtons = true;
                                                }
                                            }
                                        }
                                        return (sub.checklists || []).map(
                                            (checklist) => {
                                                // ...existing code...
                                                const uploadedDoc = (
                                                    account.uploaded_documents ||
                                                    []
                                                ).find(
                                                    (doc) =>
                                                        doc.file_title ===
                                                        checklist.name
                                                );
                                                const accountChecklistStatus = (
                                                    account.account_checklist_statuses ||
                                                    []
                                                ).find(
                                                    (status) =>
                                                        status.checklist_id ===
                                                        checklist.id
                                                );
                                                const isComplete =
                                                    uploadedDoc ||
                                                    (accountChecklistStatus &&
                                                        accountChecklistStatus.is_completed);
                                                const checklistRemark =
                                                    (account.remarks_by_checklist ||
                                                        {})[checklist.id] ||
                                                    "-";
                                                const checklistDate =
                                                    uploadedDoc
                                                        ? uploadedDoc.updated_at ||
                                                          uploadedDoc.created_at
                                                        : accountChecklistStatus?.completed_at;
                                                const baseColor =
                                                    stepIdx % 2 === 0
                                                        ? "blue"
                                                        : "teal";
                                                const dateColumnBgColor = `bg-${baseColor}-50`;
                                                const remarksColumnBgColor = `bg-${baseColor}-100`;
                                                return [
                                                    <td
                                                        key={`date-${checklist.id}`}
                                                        className={`text-center px-2 py-1.5 border-r border-gray-200 text-sm font-medium ${
                                                            isComplete
                                                                ? "bg-green-100 border-green-300"
                                                                : dateColumnBgColor
                                                        } hover:bg-opacity-80 transition-all duration-150 min-w-[100px] w-[100px]`}
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            {checklistDate ? (
                                                                <div className="bg-white bg-opacity-80 px-2 py-1 rounded-sm text-xs shadow-sm border border-gray-200">
                                                                    <span className="text-gray-700 font-medium">
                                                                        {new Date(
                                                                            checklistDate
                                                                        ).toLocaleDateString(
                                                                            "en-US",
                                                                            {
                                                                                month: "2-digit",
                                                                                day: "2-digit",
                                                                                year: "2-digit",
                                                                            }
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">
                                                                    -
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>,
                                                    <td
                                                        key={`remarks-${checklist.id}`}
                                                        className={`text-center px-2 py-1.5 border-r border-gray-200 text-sm ${remarksColumnBgColor} hover:bg-opacity-80 transition-all duration-150 min-w-[100px] w-[100px] ${
                                                            isComplete
                                                                ? "bg-green-100 border-green-300"
                                                                : ""
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            {showActionButtons && (
                                                                <>
                                                                    {/* Show Files button only if checklist requires document */}
                                                                    {checklist.requires_document && (
                                                                        <button
                                                                            type="button"
                                                                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded hover:bg-blue-200 hover:border-blue-400 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm ${
                                                                                isComplete
                                                                                    ? "text-green-700 bg-green-100 border border-green-300"
                                                                                    : "text-blue-700 bg-blue-100 border-blue-300"
                                                                            }`}
                                                                            onClick={() =>
                                                                                onAddFiles(
                                                                                    account.id,
                                                                                    step.workOrder,
                                                                                    step.stepName,
                                                                                    checklist, // Pass the checklist object
                                                                                    onRefresh // Pass refresh callback
                                                                                )
                                                                            }
                                                                        >
                                                                            {isComplete ? (
                                                                                <span className="inline-flex items-center justify-center w-3 h-3 bg-green-500 text-white text-xs font-bold rounded-sm mr-1">
                                                                                    ✓
                                                                                </span>
                                                                            ) : (
                                                                                <svg
                                                                                    className="w-2.5 h-2.5 mr-0.5"
                                                                                    fill="currentColor"
                                                                                    viewBox="0 0 20 20"
                                                                                >
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                                                                        clipRule="evenodd"
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                            Files
                                                                        </button>
                                                                    )}
                                                                    {/* Show Notes button only if checklist does not require document */}
                                                                    {!checklist.requires_document && (
                                                                        <button
                                                                            type="button"
                                                                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded hover:bg-gray-200 hover:border-gray-400 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-gray-500 shadow-sm ${
                                                                                isComplete
                                                                                    ? "text-green-700 bg-green-100 border border-green-300"
                                                                                    : "text-gray-700 bg-gray-100 border-gray-300"
                                                                            }`}
                                                                            onClick={() =>
                                                                                handleOpenNotesModal(
                                                                                    {
                                                                                        accountId:
                                                                                            account.id,
                                                                                        workOrder:
                                                                                            step.workOrder,
                                                                                        workOrderType:
                                                                                            step.stepName,
                                                                                        checklistId:
                                                                                            checklist.id,
                                                                                        checklistName:
                                                                                            checklist.name,
                                                                                        onRefresh, // Pass refresh callback
                                                                                    }
                                                                                )
                                                                            }
                                                                        >
                                                                            {isComplete ? (
                                                                                <span className="inline-flex items-center justify-center w-3 h-3 bg-green-500 text-white text-xs font-bold rounded-sm mr-1">
                                                                                    ✓
                                                                                </span>
                                                                            ) : (
                                                                                <svg
                                                                                    className="w-2.5 h-2.5 mr-0.5"
                                                                                    fill="currentColor"
                                                                                    viewBox="0 0 20 20"
                                                                                >
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                                                        clipRule="evenodd"
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                            Notes
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>,
                                                ];
                                            }
                                        );
                                    })
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ChecklistTable;
