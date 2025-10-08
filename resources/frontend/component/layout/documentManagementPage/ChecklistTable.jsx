import apiService from "../../servicesApi/apiService";
import React from "react";
import { UploadFileForChecklistModal } from "./UploadFileForChecklistModal";

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
    setOptimisticCompleted,
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
                        disabled={false}
                        title={
                            isComplete
                                ? "Unmark checklist (make incomplete)"
                                : "Mark checklist as done"
                        }
                        onChange={async (e) => {
                            const newCompletionState = e.target.checked;

                            // Optimistic update
                            setOptimisticCompleted((prev) => ({
                                ...prev,
                                [`${account.id}_${checklist.id}`]:
                                    newCompletionState,
                            }));

                            try {
                                const apiService = await import(
                                    "../../servicesApi/apiService"
                                );
                                await apiService.default.post(
                                    "/account-checklist-status",
                                    {
                                        account_id: account.id,
                                        checklist_id: checklist.id,
                                        is_completed: newCompletionState,
                                    }
                                );
                                if (onRefresh) onRefresh();
                            } catch (err) {
                                alert(
                                    newCompletionState
                                        ? "Failed to mark checklist as complete."
                                        : "Failed to mark checklist as incomplete."
                                );
                                // Revert optimistic update on error
                                setOptimisticCompleted((prev) => {
                                    const copy = { ...prev };
                                    if (newCompletionState) {
                                        delete copy[
                                            `${account.id}_${checklist.id}`
                                        ];
                                    } else {
                                        copy[
                                            `${account.id}_${checklist.id}`
                                        ] = true;
                                    }
                                    return copy;
                                });
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
    hideCompletedChecklists = false, // New prop to hide completed checklists
}) => {
    // ALL HOOKS MUST BE DEFINED AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
    const { isChecklistComplete, setOptimisticCompleted } =
        useChecklistCompletion();
    const [uploadModal, setUploadModal] = React.useState({
        open: false,
        checklist: null,
        step: null,
        sub: null,
    });

    // Scroll position preservation hooks
    const scrollContainerRef = React.useRef(null);
    // Use a unique key for this table (could be improved if multiple tables)
    const SCROLL_KEY = "checklistTableScroll";

    // Restore scroll position on mount
    React.useEffect(() => {
        const saved = localStorage.getItem(SCROLL_KEY);
        if (scrollContainerRef.current && saved) {
            try {
                const { left, top } = JSON.parse(saved);
                scrollContainerRef.current.scrollLeft = left;
                scrollContainerRef.current.scrollTop = top;
            } catch {}
        }
    }, []);

    // Save scroll position on scroll
    const handleScroll = React.useCallback(() => {
        if (scrollContainerRef.current) {
            localStorage.setItem(
                SCROLL_KEY,
                JSON.stringify({
                    left: scrollContainerRef.current.scrollLeft,
                    top: scrollContainerRef.current.scrollTop,
                })
            );
        }
    }, []);

    const handleOpenUploadModal = (checklist, step, sub) => {
        setUploadModal({ open: true, checklist, step, sub });
    };
    const handleCloseUploadModal = () => {
        setUploadModal({ open: false, checklist: null, step: null, sub: null });
    };
    const handleUploadFileForChecklist = async (file, checklist, step, sub) => {
        const accountIds = paginatedAccounts.map((acc) => acc.id);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("checklist_id", checklist.id);
        // Ensure work_order_id is a primitive value (number or string)
        let workOrderId = step.workOrder;
        if (typeof workOrderId === "object" && workOrderId !== null) {
            workOrderId = workOrderId.work_order_id || workOrderId.id || "";
        }
        formData.append("work_order_id", workOrderId);
        formData.append("submilestone_id", sub.id);
        accountIds.forEach((id) => formData.append("account_ids[]", id));
        try {
            await apiService.post(
                "/work-orders/upload-to-all-accounts",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            // Mark checklist as complete for each account (like UploadFilesOnlyModal)
            for (const accountId of accountIds) {
                await apiService.post("/account-checklist-status/bulk", {
                    account_id: accountId,
                    checklist_ids: [checklist.id],
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                });
            }
            alert("File uploaded for all accounts!");
            handleCloseUploadModal();
            if (onRefresh) onRefresh();
        } catch (err) {
            alert("Upload failed.");
        }
    };

    // Helper function to check if user is assigned to a milestone using work_order_account_assignee table
    const isUserAssignedToMilestone = React.useCallback(
        (milestone, workOrder = null) => {
            if (!currentUserId) return true;

            const workOrderId = workOrder
                ? workOrder.work_order_id || workOrder.id
                : null;

            console.log(`Checking assignment for milestone ${milestone.id}:`, {
                currentUserId,
                workOrderId,
                milestoneWorkOrderAssignees:
                    milestone.work_order_account_assignees?.length || 0,
                accountsWithAssignees: accounts.filter(
                    (a) => a.work_order_account_assignees?.length > 0
                ).length,
            });

            // First check for work_order_account_assignee records (new table structure)
            if (
                milestone.work_order_account_assignees &&
                milestone.work_order_account_assignees.length > 0
            ) {
                console.log(
                    `  All milestone assignees for ${milestone.id}:`,
                    milestone.work_order_account_assignees.map((a) => ({
                        id: a.id,
                        employee_id: a.employee_id,
                        submilestone_id: a.submilestone_id,
                        work_order_id: a.work_order_id,
                    }))
                );

                const isAssigned = milestone.work_order_account_assignees.some(
                    (assignee) => {
                        // Include work order context in the match - user must be assigned to this specific work order and submilestone
                        const matches =
                            assignee.employee_id === currentUserId &&
                            assignee.submilestone_id === milestone.id &&
                            (workOrderId
                                ? assignee.work_order_id === workOrderId
                                : true);
                        console.log(
                            `  Milestone-level check: employee_id=${assignee.employee_id}, currentUserId=${currentUserId}, submilestone_id=${assignee.submilestone_id}, milestone.id=${milestone.id}, work_order_id=${assignee.work_order_id}, expected_work_order=${workOrderId}, matches=${matches}`
                        );
                        return matches;
                    }
                );
                console.log(
                    `  Milestone-level assignment result: ${isAssigned}`
                );
                if (isAssigned) return true;
            }

            // Fallback to account-level work_order_account_assignees if available
            if (workOrderId && accounts.length > 0) {
                const accountAssigned = accounts.some((account) => {
                    if (account.work_order_account_assignees) {
                        return account.work_order_account_assignees.some(
                            (assignee) => {
                                const matches =
                                    assignee.employee_id === currentUserId &&
                                    assignee.work_order_id === workOrderId &&
                                    assignee.submilestone_id === milestone.id;
                                console.log(
                                    `  Account-level check (account ${account.id}): employee_id=${assignee.employee_id}, work_order_id=${assignee.work_order_id}, expected_work_order=${workOrderId}, submilestone_id=${assignee.submilestone_id}, milestone.id=${milestone.id}, matches=${matches}`
                                );
                                return matches;
                            }
                        );
                    }
                    return false;
                });
                console.log(
                    `  Account-level assignment result: ${accountAssigned}`
                );
                if (accountAssigned) return true;
            }

            console.log(
                `  No work_order_account_assignee matches found, falling back to legacy system`
            );

            // Legacy fallback: Check if assigned to current user through various assignment methods
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

                const legacyAssigned = hasAssignees.some((assignee) => {
                    const userMatches = assignee.employee_id === currentUserId;
                    const propertyMatches = accountPropertyNames.includes(
                        assignee.property_name
                    );
                    return userMatches && propertyMatches;
                });
                console.log(`  Legacy assignment result: ${legacyAssigned}`);
                if (legacyAssigned) return true;
            }

            const fallbackResult =
                milestone.assigned_to === currentUserId ||
                milestone.assignees?.includes(currentUserId) ||
                milestone.assigned_users?.some(
                    (user) =>
                        user.id === currentUserId || user === currentUserId
                ) ||
                milestone.assignee_id === currentUserId ||
                milestone.user_id === currentUserId ||
                milestone.assigned_user_id === currentUserId;
            console.log(`  Final fallback result: ${fallbackResult}`);
            return fallbackResult;
        },
        [currentUserId, accounts]
    );

    // Helper function to check if user is assigned to a specific account for a submilestone
    const isUserAssignedToAccountSubmilestone = React.useCallback(
        (account, workOrder, submilestone) => {
            if (!currentUserId) return true;

            console.log(
                `Account-specific assignment check for account ${account.id}, submilestone ${submilestone.id}:`,
                {
                    currentUserId,
                    workOrderId: workOrder.work_order_id || workOrder.id,
                    accountAssigneesCount:
                        account.work_order_account_assignees?.length || 0,
                }
            );

            // Check work_order_account_assignee table records
            if (
                account.work_order_account_assignees &&
                account.work_order_account_assignees.length > 0
            ) {
                const isAssigned = account.work_order_account_assignees.some(
                    (assignee) => {
                        const matches =
                            assignee.employee_id === currentUserId &&
                            assignee.work_order_id ===
                                (workOrder.work_order_id || workOrder.id) &&
                            assignee.submilestone_id === submilestone.id &&
                            assignee.account_id === account.id;
                        console.log(`  Account assignment check:`, {
                            employee_id: assignee.employee_id,
                            expected_employee: currentUserId,
                            work_order_id: assignee.work_order_id,
                            expected_work_order:
                                workOrder.work_order_id || workOrder.id,
                            submilestone_id: assignee.submilestone_id,
                            expected_submilestone: submilestone.id,
                            account_id: assignee.account_id,
                            expected_account: account.id,
                            matches,
                        });
                        return matches;
                    }
                );
                console.log(
                    `  Account-specific assignment result: ${isAssigned}`
                );
                if (isAssigned) return true;
            }

            // Fallback to general milestone assignment
            const fallbackResult = isUserAssignedToMilestone(
                submilestone,
                workOrder
            );
            console.log(
                `  Fallback to general milestone assignment: ${fallbackResult}`
            );
            return fallbackResult;
        },
        [currentUserId, isUserAssignedToMilestone]
    );

    // Memoized filtered steps based on user assignment and completed checklist filter
    const filteredSteps = React.useMemo(() => {
        console.log("=== FILTERING STEPS FOR USER ===", {
            currentUserId,
            accountsCount: accounts.length,
        });
        console.log(
            "All steps:",
            steps.map((s) => ({
                name: s.stepName,
                workOrder: s.workOrder?.work_order_id || s.workOrder?.id,
            }))
        );

        const result = (steps || [])
            .map((step, originalStepIndex) => {
                console.log(
                    `Processing step ${originalStepIndex} (${step.stepName}):`,
                    {
                        workOrder:
                            step.workOrder?.work_order_id || step.workOrder?.id,
                        subMilestonesCount: step.subMilestones?.length || 0,
                    }
                );

                // Filter submilestones to only show those where the user is assigned to the SPECIFIC work order for this step
                const filteredSubMilestones = step.subMilestones.filter(
                    (milestone) => {
                        // Check if user is assigned to this specific milestone for this specific work order
                        if (
                            !milestone.work_order_account_assignees ||
                            milestone.work_order_account_assignees.length === 0
                        ) {
                            console.log(
                                `  Milestone ${milestone.id}: No work_order_account_assignees data`
                            );
                            return false;
                        }

                        const stepWorkOrderId =
                            step.workOrder?.work_order_id || step.workOrder?.id;
                        const isAssignedToThisWorkOrder =
                            milestone.work_order_account_assignees.some(
                                (assignee) =>
                                    assignee.employee_id === currentUserId &&
                                    assignee.submilestone_id === milestone.id &&
                                    assignee.work_order_id === stepWorkOrderId
                            );

                        console.log(
                            `  Milestone ${milestone.id} (work_order: ${stepWorkOrderId}): assigned = ${isAssignedToThisWorkOrder}`
                        );
                        return isAssignedToThisWorkOrder;
                    }
                );

                console.log(
                    `  Filtered submilestones: ${
                        filteredSubMilestones.length
                    }/${step.subMilestones?.length || 0}`
                );

                const processedStep = {
                    ...step,
                    originalStepIndex, // Preserve original step index before filtering
                    subMilestones: filteredSubMilestones
                        .map((milestone) => {
                            let filteredChecklists = milestone.checklists || [];

                            if (hideCompletedChecklists) {
                                filteredChecklists = filteredChecklists.filter(
                                    (checklist) => {
                                        // Check if this checklist is completed for ALL accounts
                                        const isCompletedForAllAccounts =
                                            accounts.every((account) => {
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

                                                if (
                                                    checklist.requires_document
                                                ) {
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
                                            });

                                        // Only show checklist if it's NOT completed for all accounts
                                        return !isCompletedForAllAccounts;
                                    }
                                );
                            }

                            return {
                                ...milestone,
                                checklists: filteredChecklists,
                            };
                        })
                        .filter(
                            (milestone) =>
                                (milestone.checklists || []).length > 0
                        ),
                };

                console.log(
                    `  Final step result: ${processedStep.subMilestones.length} submilestones with checklists`
                );
                return processedStep;
            })
            // Only show steps where the user has at least one assigned submilestone
            .filter((step) => {
                const hasAssignedSubmilestones = step.subMilestones.length > 0;
                console.log(
                    `Step ${step.stepName} has assigned submilestones: ${hasAssignedSubmilestones}`
                );
                return hasAssignedSubmilestones;
            });

        // Ensure we always have at least one step to maintain table structure
        // If all steps are filtered out by the hideCompletedChecklists filter,
        // we'll show a minimal structure to keep the account column visible
        if (result.length === 0 && steps.length > 0) {
            // Return the first step with minimal structure to maintain the account column
            const firstStep = steps[0];
            return [
                {
                    ...firstStep,
                    subMilestones: [
                        {
                            id: "placeholder",
                            name: "No Active Checklists",
                            checklists: [],
                        },
                    ],
                },
            ];
        }

        return result;
    }, [steps, accounts, currentUserId, hideCompletedChecklists]);

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
        console.log("=== FILTERING ACCOUNTS ===");

        return accounts.filter((account) => {
            console.log(
                `Checking account ${account.id} (${account.account_name})`
            );

            // Check if this account has any work order assignments that match the filtered steps
            for (let stepIdx = 0; stepIdx < filteredSteps.length; stepIdx++) {
                const step = filteredSteps[stepIdx];
                const stepWorkOrderId =
                    step.workOrder?.work_order_id || step.workOrder?.id;

                // Check if this account has work order assignments for this specific work order
                const hasAssignmentForThisWorkOrder =
                    account.work_order_account_assignees?.some(
                        (assignee) =>
                            assignee.employee_id === currentUserId &&
                            assignee.work_order_id === stepWorkOrderId
                    );

                if (hasAssignmentForThisWorkOrder) {
                    console.log(
                        `  Account ${account.id} has assignment for work order ${stepWorkOrderId} in step ${step.stepName}`
                    );
                    return true;
                }
            }

            console.log(
                `  Account ${account.id} has NO assignments for any filtered work orders`
            );
            return false;
        });
    }, [accounts, filteredSteps, currentUserId]);

    // Pagination
    const totalCount = filteredAccounts.length;
    const paginatedAccounts = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAccounts.slice(start, start + itemsPerPage);
    }, [filteredAccounts, currentPage, itemsPerPage]);

    // Calculate total columns for styling
    const totalColumns = React.useMemo(() => {
        const cols = filteredSteps.reduce(
            (sum, step) =>
                sum +
                step.subMilestones.reduce(
                    (subSum, sub) => subSum + (sub.checklists?.length || 0) * 2,
                    0
                ),
            0
        );
        // Ensure we always have at least 1 column to maintain table structure
        return Math.max(cols, 1);
    }, [filteredSteps]);

    // Check if we have accounts but no visible checklists due to filtering
    const hasAccountsButNoChecklists =
        accounts.length > 0 && totalColumns <= 1 && hideCompletedChecklists;

    // Debug: Log final results
    console.log("FINAL RESULTS:", {
        filteredSteps: filteredSteps.length,
        filteredAccounts: filteredAccounts.length,
        paginatedAccounts: paginatedAccounts.length,
        totalColumns,
        hasAccountsButNoChecklists,
    });

    // Debug: Log data structure to verify work_order_account_assignees
    if (accounts.length > 0) {
        console.log("Sample account data structure:", {
            firstAccount: accounts[0],
            hasWorkOrderAccountAssignees:
                !!accounts[0]?.work_order_account_assignees,
            workOrderAccountAssigneesCount:
                accounts[0]?.work_order_account_assignees?.length || 0,
        });
    }
    if (steps.length > 0 && steps[0]?.subMilestones?.length > 0) {
        console.log("Sample submilestone data structure:", {
            firstSubmilestone: steps[0].subMilestones[0],
            hasWorkOrderAccountAssignees:
                !!steps[0].subMilestones[0]?.work_order_account_assignees,
            workOrderAccountAssigneesCount:
                steps[0].subMilestones[0]?.work_order_account_assignees
                    ?.length || 0,
        });
    }

    // Early return for no accounts (but not when filter is just hiding checklists)
    if (filteredAccounts.length === 0 && !hasAccountsButNoChecklists) {
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

    // Show message when filter hides all checklists but accounts exist
    if (hasAccountsButNoChecklists) {
        return (
            <div className="shadow-lg rounded-lg border border-gray-200 bg-white h-full flex items-center justify-center">
                <div className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                        <svg
                            className="w-12 h-12 text-green-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">
                            All Checklists Completed!
                        </p>
                        <p className="text-sm text-gray-500">
                            All checklists assigned to you have been completed.
                            Uncheck "Hide Completed Checklists" to view them.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
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
                                                    {checklist.requires_document && (
                                                        <span
                                                            role="button"
                                                            tabIndex={0}
                                                            title="Upload file for all accounts"
                                                            className="ml-2 cursor-pointer text-white hover:text-blue-200"
                                                            onClick={() =>
                                                                handleOpenUploadModal(
                                                                    checklist,
                                                                    step,
                                                                    sub
                                                                )
                                                            }
                                                            onKeyPress={(e) => {
                                                                if (
                                                                    e.key ===
                                                                        "Enter" ||
                                                                    e.key ===
                                                                        " "
                                                                ) {
                                                                    handleOpenUploadModal(
                                                                        checklist,
                                                                        step,
                                                                        sub
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {/* Upload Icon */}
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4m0 0l-4 4m4-4v12"
                                                                />
                                                            </svg>
                                                        </span>
                                                    )}
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
                                                className="font-medium text-gray text-sm truncate"
                                                title={account.account_name}
                                            >
                                                {account.account_name}
                                            </span>
                                        </div>
                                    </td>
                                    {filteredSteps.map((step, stepIdx) =>
                                        step.subMilestones.map((sub, subIdx) =>
                                            (sub.checklists || []).map(
                                                (checklist, checklistIdx) => {
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

                                                    // Check if previous checklists in this milestone are complete (for sequential logic)
                                                    const isPreviousChecklistComplete =
                                                        (checklistIndex) => {
                                                            if (
                                                                checklistIndex ===
                                                                0
                                                            )
                                                                return true; // First checklist is always accessible

                                                            // Check all previous checklists in the same milestone
                                                            for (
                                                                let i = 0;
                                                                i <
                                                                checklistIndex;
                                                                i++
                                                            ) {
                                                                const prevChecklist =
                                                                    sub
                                                                        .checklists[
                                                                        i
                                                                    ];
                                                                const prevUploadedDoc =
                                                                    (
                                                                        account.uploaded_documents ||
                                                                        []
                                                                    ).find(
                                                                        (doc) =>
                                                                            doc.file_title ===
                                                                            prevChecklist.name
                                                                    );
                                                                const prevAccountChecklistStatus =
                                                                    (
                                                                        account.account_checklist_statuses ||
                                                                        []
                                                                    ).find(
                                                                        (
                                                                            status
                                                                        ) =>
                                                                            status.checklist_id ===
                                                                            prevChecklist.id
                                                                    );
                                                                const prevIsComplete =
                                                                    isChecklistComplete(
                                                                        account.id,
                                                                        prevChecklist.id,
                                                                        prevUploadedDoc,
                                                                        prevAccountChecklistStatus,
                                                                        prevChecklist.requires_document
                                                                    );

                                                                if (
                                                                    !prevIsComplete
                                                                )
                                                                    return false;
                                                            }
                                                            return true;
                                                        };

                                                    // Determine if action buttons should be shown based on sequential/non-sequential logic
                                                    const originalStepIdx =
                                                        step.originalStepIndex;
                                                    let showActionButtons = false;

                                                    // STEP 1 is NON-SEQUENTIAL: Show all action buttons simultaneously
                                                    if (originalStepIdx === 0) {
                                                        showActionButtons = true;
                                                        console.log(
                                                            `Step 1 (non-sequential): Always show action buttons for checklist ${checklist.name}`
                                                        );
                                                    } else {
                                                        // STEPS 2+ are SEQUENTIAL: Must complete previous steps and checklists in order
                                                        console.log(
                                                            `Step ${
                                                                originalStepIdx +
                                                                1
                                                            } (sequential): Checking prerequisites for checklist ${
                                                                checklist.name
                                                            }`
                                                        );

                                                        // Check if ALL previous steps are completed (regardless of who they're assigned to)
                                                        let allPreviousStepsCompleted = true;

                                                        for (
                                                            let prevOriginalStepIdx = 0;
                                                            prevOriginalStepIdx <
                                                            originalStepIdx;
                                                            prevOriginalStepIdx++
                                                        ) {
                                                            const prevOriginalStep =
                                                                steps[
                                                                    prevOriginalStepIdx
                                                                ];
                                                            if (
                                                                !prevOriginalStep
                                                            )
                                                                continue;

                                                            // Check if this previous step has any submilestones that need to be completed for this account
                                                            let stepHasAssignments = false;
                                                            let allStepSubmilestonesComplete = true;

                                                            for (const prevSub of prevOriginalStep.subMilestones ||
                                                                []) {
                                                                // Check if this submilestone has ANY assignments for this specific work order and account
                                                                const prevStepWorkOrderId =
                                                                    prevOriginalStep
                                                                        .workOrder
                                                                        ?.work_order_id ||
                                                                    prevOriginalStep
                                                                        .workOrder
                                                                        ?.id;
                                                                const hasAssignmentsForThisWorkOrder =
                                                                    prevSub.work_order_account_assignees?.some(
                                                                        (
                                                                            assignee
                                                                        ) =>
                                                                            assignee.submilestone_id ===
                                                                                prevSub.id &&
                                                                            assignee.work_order_id ===
                                                                                prevStepWorkOrderId &&
                                                                            // Check if this assignment affects the current account
                                                                            (assignee.account_id ===
                                                                                account.id ||
                                                                                account.work_order_account_assignees?.some(
                                                                                    (
                                                                                        accountAssignee
                                                                                    ) =>
                                                                                        accountAssignee.work_order_id ===
                                                                                        prevStepWorkOrderId
                                                                                ))
                                                                    );

                                                                if (
                                                                    hasAssignmentsForThisWorkOrder
                                                                ) {
                                                                    stepHasAssignments = true;
                                                                    // Check if all checklists in this submilestone are completed for this account
                                                                    const prevChecklists =
                                                                        prevSub.checklists ||
                                                                        [];
                                                                    const prevCompletedCount =
                                                                        prevChecklists.filter(
                                                                            (
                                                                                prevChecklist
                                                                            ) => {
                                                                                const prevUploadedDoc =
                                                                                    (
                                                                                        account.uploaded_documents ||
                                                                                        []
                                                                                    ).find(
                                                                                        (
                                                                                            doc
                                                                                        ) =>
                                                                                            doc.file_title ===
                                                                                            prevChecklist.name
                                                                                    );
                                                                                const prevAccountChecklistStatus =
                                                                                    (
                                                                                        account.account_checklist_statuses ||
                                                                                        []
                                                                                    ).find(
                                                                                        (
                                                                                            status
                                                                                        ) =>
                                                                                            status.checklist_id ===
                                                                                            prevChecklist.id
                                                                                    );
                                                                                return isChecklistComplete(
                                                                                    account.id,
                                                                                    prevChecklist.id,
                                                                                    prevUploadedDoc,
                                                                                    prevAccountChecklistStatus,
                                                                                    prevChecklist.requires_document
                                                                                );
                                                                            }
                                                                        ).length;

                                                                    if (
                                                                        prevCompletedCount !==
                                                                        prevChecklists.length
                                                                    ) {
                                                                        allStepSubmilestonesComplete = false;
                                                                        console.log(
                                                                            `  Previous step ${
                                                                                prevOriginalStepIdx +
                                                                                1
                                                                            } incomplete: ${prevCompletedCount}/${
                                                                                prevChecklists.length
                                                                            } checklists done in submilestone ${
                                                                                prevSub.id
                                                                            } for account ${
                                                                                account.id
                                                                            }`
                                                                        );
                                                                        break; // No need to check more submilestones if one is incomplete
                                                                    }
                                                                }
                                                            }

                                                            // If this step has assignments but they're not all complete, block access
                                                            if (
                                                                stepHasAssignments &&
                                                                !allStepSubmilestonesComplete
                                                            ) {
                                                                allPreviousStepsCompleted = false;
                                                                console.log(
                                                                    `  Blocking due to incomplete previous step ${
                                                                        prevOriginalStepIdx +
                                                                        1
                                                                    } for account ${
                                                                        account.id
                                                                    }`
                                                                );
                                                                break;
                                                            }
                                                        }

                                                        if (
                                                            allPreviousStepsCompleted
                                                        ) {
                                                            // Check if all previous submilestones in current step are completed
                                                            let allPreviousSubmilestonesCompleted = true;
                                                            for (
                                                                let prevSubIdx = 0;
                                                                prevSubIdx <
                                                                subIdx;
                                                                prevSubIdx++
                                                            ) {
                                                                const prevSub =
                                                                    step
                                                                        .subMilestones[
                                                                        prevSubIdx
                                                                    ];
                                                                const prevChecklists =
                                                                    prevSub.checklists ||
                                                                    [];
                                                                const prevCompletedCount =
                                                                    prevChecklists.filter(
                                                                        (
                                                                            prevChecklist
                                                                        ) => {
                                                                            const prevUploadedDoc =
                                                                                (
                                                                                    account.uploaded_documents ||
                                                                                    []
                                                                                ).find(
                                                                                    (
                                                                                        doc
                                                                                    ) =>
                                                                                        doc.file_title ===
                                                                                        prevChecklist.name
                                                                                );
                                                                            const prevAccountChecklistStatus =
                                                                                (
                                                                                    account.account_checklist_statuses ||
                                                                                    []
                                                                                ).find(
                                                                                    (
                                                                                        status
                                                                                    ) =>
                                                                                        status.checklist_id ===
                                                                                        prevChecklist.id
                                                                                );
                                                                            return isChecklistComplete(
                                                                                account.id,
                                                                                prevChecklist.id,
                                                                                prevUploadedDoc,
                                                                                prevAccountChecklistStatus,
                                                                                prevChecklist.requires_document
                                                                            );
                                                                        }
                                                                    ).length;

                                                                if (
                                                                    prevCompletedCount !==
                                                                    prevChecklists.length
                                                                ) {
                                                                    allPreviousSubmilestonesCompleted = false;
                                                                    console.log(
                                                                        `  Previous submilestone ${prevSub.id} incomplete: ${prevCompletedCount}/${prevChecklists.length} checklists done`
                                                                    );
                                                                    break;
                                                                }
                                                            }

                                                            // Check if all previous checklists in current submilestone are completed
                                                            const allPreviousChecklistsCompleted =
                                                                isPreviousChecklistComplete(
                                                                    checklistIdx
                                                                );

                                                            showActionButtons =
                                                                allPreviousSubmilestonesCompleted &&
                                                                allPreviousChecklistsCompleted;
                                                            console.log(
                                                                `  Sequential check result: allPreviousSubmilestonesCompleted=${allPreviousSubmilestonesCompleted}, allPreviousChecklistsCompleted=${allPreviousChecklistsCompleted}, showActionButtons=${showActionButtons}`
                                                            );
                                                        } else {
                                                            console.log(
                                                                `  Previous steps not completed, blocking action buttons`
                                                            );
                                                        }
                                                    }

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
                                                                    setOptimisticCompleted={
                                                                        setOptimisticCompleted
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
            {uploadModal.open && (
                <UploadFileForChecklistModal
                    checklist={uploadModal.checklist}
                    step={uploadModal.step}
                    sub={uploadModal.sub}
                    onUpload={handleUploadFileForChecklist}
                    onClose={handleCloseUploadModal}
                />
            )}
        </div>
    );
};

export default ChecklistTable;
