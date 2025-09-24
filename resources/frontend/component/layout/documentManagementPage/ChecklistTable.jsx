import React from "react";

// Helper component for action buttons
const ActionButtons = ({
    account,
    step,
    checklist,
    isComplete,
    onAddFiles,
    handleOpenNotesModal,
    onRefresh,
    showActionButtons,
}) => {
    if (!showActionButtons) return null;

    return (
        <>
            {checklist.requires_document ? (
                <div className="flex items-center gap-2">
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
                                checklist,
                                onRefresh
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
                    <span
                        role="button"
                        tabIndex={0}
                        title="Add/View Notes"
                        className={`inline-flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                            isComplete ? "text-green-700" : "text-gray-700"
                        }`}
                        onClick={() =>
                            handleOpenNotesModal({
                                accountId: account.id,
                                workOrder: step.workOrder,
                                workOrderType: step.stepName,
                                checklistId: checklist.id,
                                checklistName: checklist.name,
                                onRefresh,
                            })
                        }
                        onKeyPress={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                handleOpenNotesModal({
                                    accountId: account.id,
                                    workOrder: step.workOrder,
                                    workOrderType: step.stepName,
                                    checklistId: checklist.id,
                                    checklistName: checklist.name,
                                    onRefresh,
                                });
                            }
                        }}
                    >
                        {/* Uniform Notes Icon (Sticky Note style, no border) */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 2v14H7V5h10zm-2 4H9v2h6V9zm0 4H9v2h6v-2z" />
                        </svg>
                    </span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={!!isComplete}
                        disabled={!!isComplete}
                        onChange={async (e) => {
                            if (e.target.checked && !isComplete) {
                                if (
                                    typeof window.setOptimisticCompleted ===
                                    "function"
                                ) {
                                    window.setOptimisticCompleted((prev) => ({
                                        ...prev,
                                        [`${account.id}_${checklist.id}`]: true,
                                    }));
                                }
                                try {
                                    const apiService = await import(
                                        "../../servicesApi/apiService"
                                    );
                                    await apiService.default.post(
                                        "/account-checklist-status",
                                        {
                                            account_id: account.id,
                                            checklist_id: checklist.id,
                                            is_completed: true,
                                        }
                                    );
                                    if (onRefresh) onRefresh();
                                } catch (err) {
                                    alert(
                                        "Failed to mark checklist as complete."
                                    );
                                    if (
                                        typeof window.setOptimisticCompleted ===
                                        "function"
                                    ) {
                                        window.setOptimisticCompleted(
                                            (prev) => {
                                                const copy = { ...prev };
                                                delete copy[
                                                    `${account.id}_${checklist.id}`
                                                ];
                                                return copy;
                                            }
                                        );
                                    }
                                }
                            }
                        }}
                        className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer mr-1"
                    />
                    <span
                        role="button"
                        tabIndex={0}
                        title="Add/View Notes"
                        className={`inline-flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                            isComplete ? "text-green-700" : "text-gray-700"
                        }`}
                        onClick={() =>
                            handleOpenNotesModal({
                                accountId: account.id,
                                workOrder: step.workOrder,
                                workOrderType: step.stepName,
                                checklistId: checklist.id,
                                checklistName: checklist.name,
                                onRefresh,
                            })
                        }
                        onKeyPress={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                handleOpenNotesModal({
                                    accountId: account.id,
                                    workOrder: step.workOrder,
                                    workOrderType: step.stepName,
                                    checklistId: checklist.id,
                                    checklistName: checklist.name,
                                    onRefresh,
                                });
                            }
                        }}
                    >
                        {/* Uniform Notes Icon (Sticky Note style, no border) */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 2v14H7V5h10zm-2 4H9v2h6V9zm0 4H9v2h6v-2z" />
                        </svg>
                    </span>
                </div>
            )}
        </>
    );
};

// Helper hook for checklist completion status
const useChecklistCompletion = () => {
    const [optimisticCompleted, setOptimisticCompleted] = React.useState({});

    const isChecklistComplete = React.useCallback(
        (
            accountId,
            checklistId,
            uploadedDoc,
            accountChecklistStatus,
            requiresDocument
        ) => {
            if (optimisticCompleted[`${accountId}_${checklistId}`]) return true;
            if (requiresDocument) {
                return (
                    uploadedDoc ||
                    (accountChecklistStatus &&
                        accountChecklistStatus.is_completed)
                );
            } else {
                return (
                    accountChecklistStatus &&
                    accountChecklistStatus.is_completed
                );
            }
        },
        [optimisticCompleted]
    );

    return { isChecklistComplete, setOptimisticCompleted };
};

const ChecklistTable = ({
    steps = [],
    accounts = [],
    onAddFiles,
    handleOpenNotesModal,
    currentUserId,
    onRefresh,
    currentPage = 1,
    itemsPerPage = 25,
}) => {
    const { isChecklistComplete, setOptimisticCompleted } =
        useChecklistCompletion();

    // Memoized filtered steps based on user assignment
    const filteredSteps = React.useMemo(() => {
        return (steps || [])
            .map((step) => ({
                ...step,
                subMilestones: step.subMilestones.filter((milestone) => {
                    if (!currentUserId) return true;

                    // Check if assigned to current user through various assignment methods
                    const hasAssignees = milestone.milestone_assignees;

                    if (hasAssignees && hasAssignees.length > 0) {
                        const accountPropertyNames = accounts
                            .map(
                                (account) =>
                                    account.property_name ||
                                    account.project ||
                                    account.account_name
                            )
                            .filter(Boolean);

                        return hasAssignees.some((assignee) => {
                            const userMatches =
                                assignee.employee_id === currentUserId;
                            const propertyMatches =
                                accountPropertyNames.includes(
                                    assignee.property_name
                                );
                            return userMatches && propertyMatches;
                        });
                    }

                    return (
                        milestone.assigned_to === currentUserId ||
                        milestone.assignees?.includes(currentUserId) ||
                        milestone.assigned_users?.some(
                            (user) =>
                                user.id === currentUserId ||
                                user === currentUserId
                        ) ||
                        milestone.assignee_id === currentUserId ||
                        milestone.user_id === currentUserId ||
                        milestone.assigned_user_id === currentUserId
                    );
                }),
            }))
            .filter((step) => step.subMilestones.length > 0);
    }, [steps, accounts, currentUserId]);

    // Memoized mapping of sub-milestone IDs to their parent step index
    const subMilestoneStepMap = React.useMemo(() => {
        const map = {};
        filteredSteps.forEach((step, stepIndex) => {
            step.subMilestones.forEach((subMilestone) => {
                map[subMilestone.id] = stepIndex;
            });
        });
        return map;
    }, [filteredSteps]);

    // Memoized filtered accounts based on assignment and completion
    const filteredAccounts = React.useMemo(() => {
        return accounts.filter((account) => {
            // Get the current step index for this account
            const currentStepIndex =
                subMilestoneStepMap[account.current_submilestone_id];

            for (let stepIdx = 0; stepIdx < filteredSteps.length; stepIdx++) {
                const step = filteredSteps[stepIdx];

                for (const sub of step.subMilestones) {
                    // Check if assigned to user
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

                    // For the first step, always show
                    if (stepIdx === 0) return true;

                    // Show if this is the account's current step
                    if (stepIdx === currentStepIndex) return true;

                    // Show if all checklists in this sub-milestone are completed
                    const checklists = sub.checklists || [];
                    if (checklists.length > 0) {
                        const uploadedDocs = account.uploaded_documents || [];
                        const completedCount = checklists.filter(
                            (checklist) => {
                                const hasUploadedDoc = uploadedDocs.some(
                                    (doc) => doc.file_title === checklist.name
                                );
                                const accountChecklistStatus = (
                                    account.account_checklist_statuses || []
                                ).find(
                                    (status) =>
                                        status.checklist_id === checklist.id
                                );
                                const hasCompletedStatus =
                                    accountChecklistStatus &&
                                    accountChecklistStatus.is_completed;
                                return hasUploadedDoc || hasCompletedStatus;
                            }
                        ).length;

                        if (completedCount === checklists.length) return true;
                    }
                }
            }
            return false;
        });
    }, [accounts, filteredSteps, currentUserId, subMilestoneStepMap]);

    // Pagination
    const totalCount = filteredAccounts.length;
    const paginatedAccounts = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAccounts.slice(start, start + itemsPerPage);
    }, [filteredAccounts, currentPage, itemsPerPage]);

    // Calculate total columns for styling
    const totalColumns = React.useMemo(() => {
        return filteredSteps.reduce(
            (sum, step) =>
                sum +
                step.subMilestones.reduce(
                    (subSum, sub) => subSum + (sub.checklists?.length || 0) * 2,
                    0
                ),
            0
        );
    }, [filteredSteps]);

    // Early return for no accounts
    if (filteredAccounts.length === 0) {
        return (
            <div className="shadow-lg rounded-lg border border-gray-200 bg-white h-full flex items-center justify-center">
                <div className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                        <svg
                            className="w-12 h-12 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-1.009-5.927-2.613M15 17.927C16.578 16.772 18 13.942 18 12.073c0-1.441-.396-2.798-1.087-3.961M6 21V3a1 1 0 011-1h10a1 1 0 011 1v18l-6-2-6 2z"
                            />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">
                            No results found
                        </p>
                        <p className="text-sm text-gray-500">
                            No accounts match your current search or filter
                            criteria.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <div
                className={`shadow-lg rounded-lg border border-gray-200 bg-white h-full overflow-x-auto overflow-y-auto ${
                    totalColumns <= 4 ? "max-w-fit" : ""
                }`}
            >
                <table className="text-left border-separate border-spacing-0 bg-white table-auto min-w-max">
                    <thead className="sticky top-0 z-50 bg-custom-bluegreen">
                        {/* Row 1: Step Names */}
                        <tr>
                            <th
                                className="px-4 py-2.5 font-bold text-sm text-center bg-custom-bluegreen text-white sticky left-0 z-50 min-w-[220px] align-bottom"
                                rowSpan={2}
                                style={{
                                    border: "none",
                                    verticalAlign: "bottom",
                                    height: "100%",
                                }}
                            >
                                <div
                                    className="flex items-end justify-center h-full w-full min-h-[72px]"
                                    style={{ height: "100%" }}
                                >
                                    <span className="font-semibold tracking-wide leading-tight w-full text-center">
                                        Account Name
                                    </span>
                                </div>
                            </th>
                            {filteredSteps.map((step, idx) => {
                                const colSpan =
                                    step.subMilestones.reduce(
                                        (sum, sub) =>
                                            sum + (sub.checklists?.length || 0),
                                        0
                                    ) * 2;
                                return (
                                    <th
                                        key={idx}
                                        colSpan={colSpan}
                                        className={`text-center px-3 py-2.5 font-bold text-sm border-white border min-w-[140px] transition-all duration-200 text-white ${
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
                                );
                            })}
                        </tr>
                        {/* Row 2: SubMilestone Names */}
                        <tr style={{ display: "none" }}></tr>
                        {/* Row 3: Checklist Names */}
                        <tr className="bg-custom-bluegreen">
                            {filteredSteps.map((step, stepIdx) =>
                                step.subMilestones.map((sub, subIdx) =>
                                    (sub.checklists || []).map(
                                        (checklist, cIdx) => (
                                            <th
                                                key={`${stepIdx}-${subIdx}-${cIdx}`}
                                                colSpan={2}
                                                className={`text-center px-2 py-2.5 font-medium border-white border min-w-[200px] transition-all duration-200 text-white ${
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
                        <tr className="bg-custom-bluegreen">
                            <th
                                className="px-4 py-1.5 font-medium sticky left-0 bg-custom-bluegreen z-60 border-white border text-white shadow-lg align-middle text-center"
                                rowSpan={2}
                                style={{ border: "none" }}
                            ></th>
                            {filteredSteps.map((step, stepIdx) =>
                                step.subMilestones.map((sub, subIdx) =>
                                    (sub.checklists || []).map(
                                        (checklist, cIdx) => [
                                            <th
                                                key={`date-${stepIdx}-${subIdx}-${cIdx}`}
                                                className={`text-center px-2 py-1.5 font-medium border-white border min-w-[100px] w-[100px] transition-all duration-200 hover:bg-opacity-90 text-white ${
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
                                                className={`text-center px-2 py-1.5 font-medium border-white border min-w-[100px] w-[100px] transition-all duration-200 hover:bg-opacity-90 text-white ${
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
                        <tr style={{ display: "none" }}></tr>
                    </thead>
                    <tbody>
                        {paginatedAccounts.map((account, rowIdx) => {
                            // Get the current step index for this account
                            const currentStepIndex =
                                subMilestoneStepMap[
                                    account.current_submilestone_id
                                ];

                            return (
                                <tr
                                    key={account.id}
                                    className={`${
                                        rowIdx % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                    } hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100`}
                                >
                                    <td className="px-4 py-1.5 font-semibold text-gray-900 sticky left-0 bg-inherit z-40 border-r border-gray-200 shadow-sm min-w-[220px] max-w-[220px]">
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
                                        step.subMilestones.map((sub) =>
                                            (sub.checklists || []).map(
                                                (checklist) => {
                                                    const uploadedDoc = (
                                                        account.uploaded_documents ||
                                                        []
                                                    ).find(
                                                        (doc) =>
                                                            doc.file_title ===
                                                            checklist.name
                                                    );
                                                    const accountChecklistStatus =
                                                        (
                                                            account.account_checklist_statuses ||
                                                            []
                                                        ).find(
                                                            (status) =>
                                                                status.checklist_id ===
                                                                checklist.id
                                                        );
                                                    const isComplete =
                                                        isChecklistComplete(
                                                            account.id,
                                                            checklist.id,
                                                            uploadedDoc,
                                                            accountChecklistStatus,
                                                            checklist.requires_document
                                                        );
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

                                                    // For STEP 1 (first step), always show action buttons; for others, only current step
                                                    const showActionButtons =
                                                        stepIdx === 0 ||
                                                        stepIdx ===
                                                            currentStepIndex;

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
                                                                <ActionButtons
                                                                    account={
                                                                        account
                                                                    }
                                                                    step={step}
                                                                    checklist={
                                                                        checklist
                                                                    }
                                                                    isComplete={
                                                                        isComplete
                                                                    }
                                                                    onAddFiles={
                                                                        onAddFiles
                                                                    }
                                                                    handleOpenNotesModal={
                                                                        handleOpenNotesModal
                                                                    }
                                                                    onRefresh={
                                                                        onRefresh
                                                                    }
                                                                    showActionButtons={
                                                                        showActionButtons
                                                                    }
                                                                />
                                                            </div>
                                                        </td>,
                                                    ];
                                                }
                                            )
                                        )
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ChecklistTable;
