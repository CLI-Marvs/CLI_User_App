import React from "react";

const ChecklistTable = ({
    steps,
    accounts,
    onAddFiles,
    handleOpenNotesModal,
    currentUserId, // Add current user ID prop
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
        .filter((step) => step.subMilestones.length > 0); // Remove steps with no assigned milestones

    console.log("Filtered steps:", filteredSteps);
    console.log("Original steps:", steps);

    // Build a flat list of all checklists under each milestone (step)
    // For each account, show a row for each checklist under each milestone
    return (
        <table className="w-full text-left border-collapse bg-white">
            <thead>
                {/* Row 1: Steps */}
                <tr className="bg-custom-bluegreen text-white">
                    <th className="px-3 py-1 font-bold sticky left-0 bg-custom-bluegreen z-20 border-r border-white min-w-[180px] text-center"></th>
                    {filteredSteps.map((step, idx) => (
                        <th
                            key={idx}
                            colSpan={
                                step.subMilestones.reduce(
                                    (sum, sub) =>
                                        sum + (sub.checklists?.length || 0),
                                    0
                                ) * 2
                            }
                            className={`text-center px-3 py-1 font-bold text-sm border-x border-white min-w-[100px] ${
                                idx % 2 === 0
                                    ? "bg-custom-bluegreen"
                                    : "bg-custom-lightgreen"
                            }`}
                        >
                            {step.stepName}
                        </th>
                    ))}
                </tr>
                {/* Row 2: Milestones (actual milestone names) */}
                <tr className="bg-custom-bluegreen text-white">
                    <th
                        rowSpan={2}
                        className="px-3 py-2 font-bold sticky left-0 bg-custom-bluegreen z-20 border-r border-white min-w-[180px] text-center align-middle text-sm"
                    >
                        ACCOUNT NAME
                    </th>
                    {filteredSteps.map((step, stepIdx) =>
                        step.subMilestones.map((sub, subIdx) => (
                            <th
                                key={`${stepIdx}-${subIdx}`}
                                colSpan={(sub.checklists?.length || 0) * 2}
                                className={`text-center px-3 py-1 font-semibold text-sm border-x border-t border-white min-w-[120px] ${
                                    stepIdx % 2 === 0
                                        ? "bg-custom-bluegreen"
                                        : "bg-custom-lightgreen"
                                }`}
                            >
                                <span
                                    className="truncate block"
                                    title={sub.milestoneName || sub.name}
                                >
                                    {(
                                        sub.milestoneName ||
                                        sub.name ||
                                        `M${subIdx + 1}`
                                    ).length > 15
                                        ? (
                                              sub.milestoneName ||
                                              sub.name ||
                                              `M${subIdx + 1}`
                                          ).substring(0, 15) + "..."
                                        : sub.milestoneName ||
                                          sub.name ||
                                          `M${subIdx + 1}`}
                                </span>
                            </th>
                        ))
                    )}
                </tr>
                {/* Row 3: Checklists */}
                <tr className="bg-custom-bluegreen text-white">
                    {filteredSteps.map((step, stepIdx) =>
                        step.subMilestones.map((sub, subIdx) =>
                            (sub.checklists || []).map((checklist, cIdx) => (
                                <th
                                    key={`${stepIdx}-${subIdx}-${cIdx}`}
                                    colSpan={2}
                                    className={`text-center px-2 py-1 font-medium border-x border-y border-white min-w-[180px] ${
                                        stepIdx % 2 === 0
                                            ? "bg-custom-bluegreen"
                                            : "bg-custom-lightgreen"
                                    }`}
                                >
                                    <span
                                        className="text-sm font-semibold truncate block"
                                        title={checklist.name}
                                    >
                                        {checklist.name.length > 15
                                            ? checklist.name.substring(0, 15) +
                                              "..."
                                            : checklist.name}
                                    </span>
                                </th>
                            ))
                        )
                    )}
                </tr>
                {/* Row 4: Date and Remarks/Files */}
                <tr className="bg-custom-bluegreen text-white">
                    <th className="px-3 py-1 font-medium sticky left-0 bg-custom-bluegreen z-20 border-r border-white"></th>
                    {filteredSteps.map((step, stepIdx) =>
                        step.subMilestones.map((sub, subIdx) =>
                            (sub.checklists || []).map((checklist, cIdx) => [
                                <th
                                    key={`date-${stepIdx}-${subIdx}-${cIdx}`}
                                    className={`text-center px-1 py-1 font-medium border-x border-white min-w-[90px] ${
                                        stepIdx % 2 === 0
                                            ? "bg-custom-bluegreen"
                                            : "bg-custom-lightgreen"
                                    }`}
                                >
                                    <span className="text-xs font-medium">
                                        Date
                                    </span>
                                </th>,
                                <th
                                    key={`remarks-${stepIdx}-${subIdx}-${cIdx}`}
                                    className={`text-center px-1 py-1 font-medium border-x border-white min-w-[120px] ${
                                        stepIdx % 2 === 0
                                            ? "bg-custom-bluegreen"
                                            : "bg-custom-lightgreen"
                                    }`}
                                >
                                    <span className="text-xs font-medium">
                                        Remarks / Files
                                    </span>
                                </th>,
                            ])
                        )
                    )}
                </tr>
            </thead>
            <tbody>
                {accounts.map((account, rowIdx) => (
                    <tr
                        key={account.id}
                        className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                        <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-inherit z-10 border-r border-gray-200">
                            {account.account_name}
                        </td>
                        {filteredSteps.map((step, stepIdx) =>
                            step.subMilestones.map((sub) =>
                                (sub.checklists || []).map((checklist) => {
                                    // Find uploaded doc for this checklist (if any)
                                    const uploadedDoc = (
                                        account.uploaded_documents || []
                                    ).find(
                                        (doc) =>
                                            doc.file_title === checklist.name
                                    );

                                    // Check if checklist is complete
                                    // A checklist is complete if:
                                    // 1. It has an uploaded document (for any checklist type), OR
                                    // 2. It's marked as complete in account_checklist_status (for any checklist type)
                                    const isComplete =
                                        uploadedDoc ||
                                        (checklist.account_checklist_status &&
                                            checklist.account_checklist_status
                                                .is_completed);

                                    // Find remarks for this checklist (if any)
                                    const checklistRemark =
                                        (account.remarks_by_checklist || {})[
                                            checklist.id
                                        ] || "-";
                                    // Find date for this checklist (if any)
                                    const checklistDate = uploadedDoc
                                        ? uploadedDoc.updated_at ||
                                          uploadedDoc.created_at
                                        : checklist.account_checklist_status
                                              ?.completed_at;

                                    // Same step color but different opacity for Date vs Remarks/Files
                                    const baseColor =
                                        stepIdx % 2 === 0 ? "teal" : "green";
                                    const dateColumnBgColor = `bg-${baseColor}-50`;
                                    const remarksColumnBgColor = `bg-${baseColor}-100`;

                                    return [
                                        <td
                                            key={`date-${checklist.id}`}
                                            className={`text-center px-2 py-2 border-r border-gray-100 text-xs ${dateColumnBgColor}`}
                                        >
                                            {checklistDate
                                                ? new Date(
                                                      checklistDate
                                                  ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          month: "2-digit",
                                                          day: "2-digit",
                                                          year: "2-digit",
                                                      }
                                                  )
                                                : "-"}
                                        </td>,
                                        <td
                                            key={`remarks-${checklist.id}`}
                                            className={`text-center px-2 py-2 border-r border-gray-100 text-xs ${remarksColumnBgColor} ${
                                                isComplete ? "bg-green-200" : ""
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                {isComplete && (
                                                    <span className="text-green-600 font-semibold">
                                                        ✓
                                                    </span>
                                                )}
                                                <span>{checklistRemark}</span>
                                            </div>
                                            {/* Show Files button only if checklist requires document */}
                                            {checklist.requires_document && (
                                                <button
                                                    type="button"
                                                    className="ml-2 text-blue-600 underline text-xs"
                                                    onClick={() =>
                                                        onAddFiles(
                                                            account.id,
                                                            step.workOrder,
                                                            step.stepName
                                                        )
                                                    }
                                                >
                                                    Files
                                                </button>
                                            )}
                                            {/* Show Notes button only if checklist does not require document */}
                                            {!checklist.requires_document && (
                                                <button
                                                    type="button"
                                                    className="ml-2 text-gray-600 underline text-xs"
                                                    onClick={() =>
                                                        handleOpenNotesModal({
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
                                                        })
                                                    }
                                                >
                                                    Notes
                                                </button>
                                            )}
                                        </td>,
                                    ];
                                })
                            )
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ChecklistTable;
