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
    hideCompletedChecklists = false,
}) => {
    const { isChecklistComplete, setOptimisticCompleted } =
        useChecklistCompletion();
    const [uploadModal, setUploadModal] = React.useState({
        open: false,
        checklist: null,
        step: null,
        sub: null,
    });
    const [bulkUpdating, setBulkUpdating] = React.useState({});

    const scrollContainerRef = React.useRef(null);
    const SCROLL_KEY = "checklistTableScroll";

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

    // New function to handle bulk toggle for all accounts under a checklist
    const handleBulkToggleChecklist = async (
        checklist,
        stepIdx,
        subIdx,
        checklistIdx
    ) => {
        const key = `${stepIdx}-${subIdx}-${checklistIdx}`;

        if (bulkUpdating[key]) return; // Prevent double-clicks

        // Determine current state: if ALL are checked, we'll uncheck. Otherwise, we'll check all.
        const allChecked = paginatedAccounts.every((account) => {
            const uploadedDoc = (account.uploaded_documents || []).find(
                (doc) => doc.file_title === checklist.name
            );
            const accountChecklistStatus = (
                account.account_checklist_statuses || []
            ).find((status) => status.checklist_id === checklist.id);
            return isChecklistComplete(
                account.id,
                checklist.id,
                uploadedDoc,
                accountChecklistStatus,
                checklist.requires_document
            );
        });

        const newCompletionState = !allChecked;
        const accountIds = paginatedAccounts.map((acc) => acc.id);

        // Optimistic update
        setBulkUpdating((prev) => ({ ...prev, [key]: true }));
        const optimisticUpdates = {};
        accountIds.forEach((accountId) => {
            optimisticUpdates[`${accountId}_${checklist.id}`] =
                newCompletionState;
        });
        setOptimisticCompleted((prev) => ({
            ...prev,
            ...optimisticUpdates,
        }));

        try {
            await apiService.post("/account-checklist-status/bulk-accounts", {
                account_ids: accountIds,
                checklist_id: checklist.id,
                is_completed: newCompletionState,
            });

            if (onRefresh) onRefresh();
        } catch (err) {
            console.error("Bulk toggle failed:", err);
            alert(
                `Failed to ${
                    newCompletionState ? "check" : "uncheck"
                } all items. Please try again.`
            );

            // Revert optimistic update
            setOptimisticCompleted((prev) => {
                const copy = { ...prev };
                accountIds.forEach((accountId) => {
                    const key = `${accountId}_${checklist.id}`;
                    if (newCompletionState) {
                        delete copy[key];
                    } else {
                        copy[key] = true;
                    }
                });
                return copy;
            });
        } finally {
            setBulkUpdating((prev) => {
                const copy = { ...prev };
                delete copy[key];
                return copy;
            });
        }
    };

    const isUserAssignedToMilestone = React.useCallback(
        (milestone, workOrder = null) => {
            // If no currentUserId, hide everything (be strict)
            if (!currentUserId) {
                return false;
            }

            const workOrderId = workOrder
                ? workOrder.work_order_id || workOrder.id
                : null;

            // Priority 1: Check work_order_account_assignees (most specific)
            if (
                milestone.work_order_account_assignees &&
                milestone.work_order_account_assignees.length > 0
            ) {
                const isAssigned = milestone.work_order_account_assignees.some(
                    (assignee) => {
                        const matches =
                            assignee.employee_id === currentUserId &&
                            assignee.submilestone_id === milestone.id &&
                            (workOrderId
                                ? assignee.work_order_id === workOrderId
                                : true);
                        return matches;
                    }
                );

                // If user is assigned, show it
                if (isAssigned) return true;

                // Check if user has assignment for this work order but with null submilestone_id
                // This happens when work orders are created without specific submilestones
                // If user has null submilestone assignment, they are assigned to ALL submilestones in that work order
                if (workOrderId) {
                    const hasNullSubmilestoneAssignment =
                        milestone.work_order_account_assignees.some(
                            (assignee) =>
                                assignee.employee_id === currentUserId &&
                                assignee.submilestone_id === null &&
                                assignee.work_order_id === workOrderId
                        );

                    if (hasNullSubmilestoneAssignment) {
                        // User is assigned to entire work order (all submilestones)
                        return true;
                    }
                }

                // Check if there are any assigned employees (non-null employee_id)
                const hasAssignedEmployees =
                    milestone.work_order_account_assignees.some(
                        (assignee) =>
                            assignee.employee_id !== null &&
                            assignee.submilestone_id !== null
                    );

                // If there are assigned employees but current user is not one of them, return false
                // Don't fall through to other checks because work_order_account_assignees is the source of truth
                if (hasAssignedEmployees) {
                    return false;
                }

                // All assignees have employee_id = null (unassigned), continue to fallback checks
            }

            // Priority 2: Check account-level assignments (from accounts array passed as prop)
            // This is used when work_order_account_assignees is not available on the milestone itself
            if (workOrderId && accounts.length > 0) {
                const accountAssigned = accounts.some((account) => {
                    // Only check accounts that are currently on this submilestone
                    if (account.current_submilestone_id !== milestone.id) {
                        return false;
                    }

                    if (account.work_order_account_assignees) {
                        return account.work_order_account_assignees.some(
                            (assignee) => {
                                const matches =
                                    assignee.employee_id === currentUserId &&
                                    assignee.work_order_id === workOrderId &&
                                    assignee.submilestone_id === milestone.id;
                                return matches;
                            }
                        );
                    }
                    return false;
                });

                if (accountAssigned) return true;
            }

            // Priority 3: Check legacy milestone_assignees (project_milestone_assignees table)
            // IMPORTANT: Only show if there are accounts CURRENTLY on this submilestone that match
            const hasAssignees = milestone.milestone_assignees;

            if (hasAssignees && hasAssignees.length > 0) {
                // Get property names of accounts that are CURRENTLY on this submilestone
                const currentSubmilestoneAccountPropertyNames = accounts
                    .filter(
                        (account) =>
                            account.current_submilestone_id === milestone.id
                    )
                    .map(
                        (account) =>
                            account.property_name ||
                            account.project ||
                            account.account_name
                    )
                    .filter(Boolean);

                const legacyAssigned = hasAssignees.some((assignee) => {
                    const userMatches = assignee.employee_id === currentUserId;
                    const propertyMatches =
                        currentSubmilestoneAccountPropertyNames.includes(
                            assignee.property_name
                        );
                    return userMatches && propertyMatches;
                });

                if (legacyAssigned) return true;

                // If milestone_assignees exists but user not found, don't show
                return false;
            }

            // Priority 4: Fallback checks - only if no specific assignment arrays exist
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

            // If no assignment information at all, hide it
            return fallbackResult;
        },
        [currentUserId, accounts]
    );

    const isUserAssignedToAccountSubmilestone = React.useCallback(
        (account, workOrder, submilestone) => {
            if (!currentUserId) return false;

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
                        return matches;
                    }
                );
                if (isAssigned) return true;
            }

            const fallbackResult = isUserAssignedToMilestone(
                submilestone,
                workOrder
            );
            return fallbackResult;
        },
        [currentUserId, isUserAssignedToMilestone]
    );

    const filteredSteps = React.useMemo(() => {
        const result = (steps || [])
            .map((step, originalStepIndex) => {
                const processedSubMilestones = step.subMilestones.map(
                    (milestone) => {
                        const isUserAssigned = isUserAssignedToMilestone(
                            milestone,
                            step.workOrder
                        );

                        let filteredChecklists = milestone.checklists || [];

                        if (hideCompletedChecklists) {
                            filteredChecklists = filteredChecklists.filter(
                                (checklist) => {
                                    const isCompletedForAllAccounts =
                                        accounts.every((account) => {
                                            const uploadedDoc = (
                                                account.uploaded_documents || []
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

                                            if (checklist.requires_document) {
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

                                    return !isCompletedForAllAccounts;
                                }
                            );
                        }

                        return {
                            ...milestone,
                            checklists: filteredChecklists,
                            isUserAssigned,
                        };
                    }
                );

                const processedStep = {
                    ...step,
                    originalStepIndex,
                    // CRITICAL: Filter by BOTH having checklists AND being assigned
                    subMilestones: processedSubMilestones.filter(
                        (milestone) => {
                            const hasChecklists =
                                (milestone.checklists || []).length > 0;
                            const result =
                                hasChecklists && milestone.isUserAssigned;
                            return result;
                        }
                    ),
                };
                return processedStep;
            })
            .filter((step) => {
                const hasAssignedSubmilestones = step.subMilestones.length > 0;
                return hasAssignedSubmilestones;
            });

        if (result.length === 0 && steps.length > 0) {
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
    }, [
        steps,
        accounts,
        currentUserId,
        hideCompletedChecklists,
        isUserAssignedToMilestone,
    ]);

    const subMilestoneStepMap = React.useMemo(() => {
        const map = {};
        filteredSteps.forEach((step, stepIndex) => {
            step.subMilestones.forEach((subMilestone) => {
                map[subMilestone.id] = stepIndex;
            });
        });
        return map;
    }, [filteredSteps]);

    const filteredAccounts = React.useMemo(() => {
        return accounts.filter((account) => {
            // Show accounts where user is assigned to ANY submilestone in the work order
            // Not just the current submilestone
            for (let stepIdx = 0; stepIdx < filteredSteps.length; stepIdx++) {
                const step = filteredSteps[stepIdx];

                const stepWorkOrderIds = step.workOrders || [
                    step.workOrder?.work_order_id || step.workOrder?.id,
                ];

                for (const stepWorkOrderId of stepWorkOrderIds) {
                    // Check if user is assigned to this work order for ANY submilestone
                    const hasAssignmentForWorkOrder =
                        account.work_order_account_assignees?.some(
                            (assignee) =>
                                assignee.employee_id === currentUserId &&
                                assignee.work_order_id === stepWorkOrderId
                        );

                    if (hasAssignmentForWorkOrder) {
                        return true;
                    }
                }
            }
            return false;
        });
    }, [accounts, filteredSteps, currentUserId]);

    const totalCount = filteredAccounts.length;
    const paginatedAccounts = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAccounts.slice(start, start + itemsPerPage);
    }, [filteredAccounts, currentPage, itemsPerPage]);

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
        return Math.max(cols, 1);
    }, [filteredSteps]);

    const hasAccountsButNoChecklists =
        accounts.length > 0 && totalColumns <= 1 && hideCompletedChecklists;

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
                        <tr style={{ display: "none" }}></tr>
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
                                                <div className="flex items-center justify-center gap-1">
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
                                                    {checklist.requires_document ? (
                                                        <span
                                                            role="button"
                                                            tabIndex={0}
                                                            title="Upload file for all accounts"
                                                            className="cursor-pointer text-white hover:text-blue-200"
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
                                                    ) : (
                                                        <span
                                                            role="button"
                                                            tabIndex={0}
                                                            title={
                                                                paginatedAccounts.every(
                                                                    (
                                                                        account
                                                                    ) => {
                                                                        const uploadedDoc =
                                                                            (
                                                                                account.uploaded_documents ||
                                                                                []
                                                                            ).find(
                                                                                (
                                                                                    doc
                                                                                ) =>
                                                                                    doc.file_title ===
                                                                                    checklist.name
                                                                            );
                                                                        const accountChecklistStatus =
                                                                            (
                                                                                account.account_checklist_statuses ||
                                                                                []
                                                                            ).find(
                                                                                (
                                                                                    status
                                                                                ) =>
                                                                                    status.checklist_id ===
                                                                                    checklist.id
                                                                            );
                                                                        return isChecklistComplete(
                                                                            account.id,
                                                                            checklist.id,
                                                                            uploadedDoc,
                                                                            accountChecklistStatus,
                                                                            checklist.requires_document
                                                                        );
                                                                    }
                                                                )
                                                                    ? "Uncheck all checkboxes"
                                                                    : "Check all checkboxes"
                                                            }
                                                            className={`cursor-pointer transition-all duration-150 ${
                                                                bulkUpdating[
                                                                    `${stepIdx}-${subIdx}-${cIdx}`
                                                                ]
                                                                    ? "opacity-50 cursor-not-allowed"
                                                                    : "hover:text-blue-200"
                                                            }`}
                                                            onClick={() => {
                                                                if (
                                                                    !bulkUpdating[
                                                                        `${stepIdx}-${subIdx}-${cIdx}`
                                                                    ]
                                                                ) {
                                                                    handleBulkToggleChecklist(
                                                                        checklist,
                                                                        stepIdx,
                                                                        subIdx,
                                                                        cIdx
                                                                    );
                                                                }
                                                            }}
                                                            onKeyPress={(e) => {
                                                                if (
                                                                    (e.key ===
                                                                        "Enter" ||
                                                                        e.key ===
                                                                            " ") &&
                                                                    !bulkUpdating[
                                                                        `${stepIdx}-${subIdx}-${cIdx}`
                                                                    ]
                                                                ) {
                                                                    handleBulkToggleChecklist(
                                                                        checklist,
                                                                        stepIdx,
                                                                        subIdx,
                                                                        cIdx
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="w-4 h-4 text-white"
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
                                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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

                                                    const isPreviousChecklistComplete =
                                                        (checklistIndex) => {
                                                            if (
                                                                checklistIndex ===
                                                                0
                                                            )
                                                                return true;

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

                                                    const originalStepIdx =
                                                        step.originalStepIndex;
                                                    let showActionButtons = false;

                                                    if (originalStepIdx === 0) {
                                                        showActionButtons =
                                                            sub.isUserAssigned;
                                                    } else {
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

                                                            let stepHasAssignments = false;
                                                            let allStepSubmilestonesComplete = true;

                                                            for (const prevSub of prevOriginalStep.subMilestones ||
                                                                []) {
                                                                const prevStepWorkOrderId =
                                                                    prevOriginalStep
                                                                        .workOrder
                                                                        ?.work_order_id ||
                                                                    prevOriginalStep
                                                                        .workOrder
                                                                        ?.id;

                                                                // Check for assignments to this work order and submilestone
                                                                // Handle both specific submilestone_id and null submilestone_id (applies to all)
                                                                const hasAssignmentsForThisWorkOrder =
                                                                    prevSub.work_order_account_assignees?.some(
                                                                        (
                                                                            assignee
                                                                        ) =>
                                                                            (assignee.submilestone_id ===
                                                                                prevSub.id ||
                                                                                assignee.submilestone_id ===
                                                                                    null) &&
                                                                            assignee.work_order_id ===
                                                                                prevStepWorkOrderId &&
                                                                            (assignee.account_id ===
                                                                                account.id ||
                                                                                account.work_order_account_assignees?.some(
                                                                                    (
                                                                                        accountAssignee
                                                                                    ) =>
                                                                                        accountAssignee.work_order_id ===
                                                                                            prevStepWorkOrderId &&
                                                                                        accountAssignee.account_id ===
                                                                                            account.id
                                                                                ))
                                                                    );

                                                                if (
                                                                    hasAssignmentsForThisWorkOrder
                                                                ) {
                                                                    stepHasAssignments = true;
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
                                                                        break;
                                                                    }
                                                                }
                                                            }

                                                            if (
                                                                stepHasAssignments &&
                                                                !allStepSubmilestonesComplete
                                                            ) {
                                                                allPreviousStepsCompleted = false;
                                                                break;
                                                            }
                                                        }

                                                        if (
                                                            allPreviousStepsCompleted
                                                        ) {
                                                            // Check if this work order has specific submilestone assignments (non-NULL)
                                                            // If all assignments are NULL, skip cross-user sequential logic
                                                            const hasSpecificAssignments =
                                                                step.subMilestones?.some(
                                                                    (
                                                                        checkSub
                                                                    ) =>
                                                                        checkSub.work_order_account_assignees?.some(
                                                                            (
                                                                                assignee
                                                                            ) =>
                                                                                assignee.submilestone_id !==
                                                                                null
                                                                        )
                                                                );

                                                            if (
                                                                hasSpecificAssignments
                                                            ) {
                                                                // For steps beyond STEP 1, enforce sequential submilestone completion
                                                                // Find the first incomplete submilestone in this step (across ALL assignees)
                                                                let firstIncompleteSubIdx =
                                                                    -1;

                                                                for (
                                                                    let checkSubIdx = 0;
                                                                    checkSubIdx <
                                                                    step
                                                                        .subMilestones
                                                                        .length;
                                                                    checkSubIdx++
                                                                ) {
                                                                    const checkSub =
                                                                        step
                                                                            .subMilestones[
                                                                            checkSubIdx
                                                                        ];
                                                                    const checkChecklists =
                                                                        checkSub.checklists ||
                                                                        [];

                                                                    // Check if this submilestone has ANY incomplete checklists
                                                                    // across all accounts (not just current user's)
                                                                    let hasIncompleteChecklists = false;

                                                                    // If submilestone has checklists, check completion
                                                                    if (
                                                                        checkChecklists.length >
                                                                        0
                                                                    ) {
                                                                        const checkCompletedCount =
                                                                            checkChecklists.filter(
                                                                                (
                                                                                    checkChecklist
                                                                                ) => {
                                                                                    const checkUploadedDoc =
                                                                                        (
                                                                                            account.uploaded_documents ||
                                                                                            []
                                                                                        ).find(
                                                                                            (
                                                                                                doc
                                                                                            ) =>
                                                                                                doc.file_title ===
                                                                                                checkChecklist.name
                                                                                        );
                                                                                    const checkAccountChecklistStatus =
                                                                                        (
                                                                                            account.account_checklist_statuses ||
                                                                                            []
                                                                                        ).find(
                                                                                            (
                                                                                                status
                                                                                            ) =>
                                                                                                status.checklist_id ===
                                                                                                checkChecklist.id
                                                                                        );
                                                                                    return isChecklistComplete(
                                                                                        account.id,
                                                                                        checkChecklist.id,
                                                                                        checkUploadedDoc,
                                                                                        checkAccountChecklistStatus,
                                                                                        checkChecklist.requires_document
                                                                                    );
                                                                                }
                                                                            ).length;

                                                                        hasIncompleteChecklists =
                                                                            checkCompletedCount !==
                                                                            checkChecklists.length;
                                                                    }

                                                                    // If this submilestone has incomplete checklists, it's the first incomplete
                                                                    if (
                                                                        hasIncompleteChecklists
                                                                    ) {
                                                                        firstIncompleteSubIdx =
                                                                            checkSubIdx;
                                                                        break;
                                                                    }
                                                                }

                                                                // Show buttons ONLY if this submilestone IS the first incomplete one
                                                                // This ensures sequential order regardless of who is assigned
                                                                const isFirstIncomplete =
                                                                    firstIncompleteSubIdx ===
                                                                        -1 ||
                                                                    subIdx ===
                                                                        firstIncompleteSubIdx;

                                                                if (
                                                                    isFirstIncomplete
                                                                ) {
                                                                    const allPreviousChecklistsCompleted =
                                                                        isPreviousChecklistComplete(
                                                                            checklistIdx
                                                                        );

                                                                    showActionButtons =
                                                                        allPreviousChecklistsCompleted &&
                                                                        sub.isUserAssigned;
                                                                }
                                                            } else {
                                                                // NULL assignments (old behavior): Apply per-user sequential logic only
                                                                const allPreviousChecklistsCompleted =
                                                                    isPreviousChecklistComplete(
                                                                        checklistIdx
                                                                    );

                                                                showActionButtons =
                                                                    allPreviousChecklistsCompleted &&
                                                                    sub.isUserAssigned;
                                                            }
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
