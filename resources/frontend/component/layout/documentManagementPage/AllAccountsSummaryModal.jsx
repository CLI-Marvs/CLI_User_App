import React, { useMemo, useState, useEffect, Fragment } from "react";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import WorkOrderMilestoneRow from "./WorkOrderMilestoneRow";
import EnhancedControlBar from "./EnhancedControlBar";
import NotesAndUpdatesModal from "./NotesAndUpdatesModal";
import AddFilesModal from "./AddFilesModal";
import AccountFilesModal from "./AccountFilesModal";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    IconButton,
} from "@material-tailwind/react";
import apiService from "../../../../frontend/component/servicesApi/apiService";

const AllAccountsSummaryModal = ({ isOpen, onClose, currentUserId }) => {
    // State declarations
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [selectedAccountForNotes, setSelectedAccountForNotes] =
        useState(null);
    const [filesModalOpen, setFilesModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedAccountInfo, setSelectedAccountInfo] = useState({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [allAccountsData, setAllAccountsData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Filter states
    const [buyerFilter, setBuyerFilter] = useState("All");
    const [stepAssigneeFilter, setStepAssigneeFilter] = useState("All");
    const [hideCompletedChecklists, setHideCompletedChecklists] =
        useState(false);

    // EnhancedControlBar expects onChange handlers for each filter
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };
    const handleBuyerFilterChange = (value) => {
        setBuyerFilter(value);
        setCurrentPage(1);
    };
    const handleStepAssigneeFilterChange = (value) => {
        setStepAssigneeFilter(value);
        setCurrentPage(1);
    };
    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };
    const handleHideCompletedChecklistsChange = (checked) => {
        setHideCompletedChecklists(checked);
        setCurrentPage(1);
    };

    // Fetch all accounts data from all work order groups
    const fetchAllAccountsData = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.get(
                "/work-order-groups/all-accounts-summary"
            );
            setAllAccountsData(response.data);
        } catch (error) {
            console.error("Error fetching all accounts summary:", error);
            setAllAccountsData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchAllAccountsData();
        }
    }, [isOpen]);

    // Refresh data
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchAllAccountsData();
        setIsRefreshing(false);
    };

    // Filtering logic
    const { columnHeaders, tableRows, filteredRows, totalPages, steps } =
        useMemo(() => {
            if (!allAccountsData || !allAccountsData.work_orders)
                return {
                    columnHeaders: [],
                    tableRows: [],
                    filteredRows: [],
                    totalPages: 0,
                    steps: [],
                };

            // 1. Gather all steps (work orders) and sort by sequence
            let steps = [...allAccountsData.work_orders]
                .sort(
                    (a, b) =>
                        (a.work_order_type?.sequence ?? 0) -
                        (b.work_order_type?.sequence ?? 0)
                )
                .map((wo) => ({
                    id: wo.work_order_type_id,
                    workOrderId: wo.work_order_id,
                    stepName: wo.work_order_type?.type_name || `Step`,
                    sequence: wo.work_order_type?.sequence ?? 0,
                    subMilestones:
                        allAccountsData.submilestonesByType?.[
                            wo.work_order_type_id
                        ] || [],
                    workOrder: wo,
                }));

            // 2. Apply buyer filter to subMilestones (column filtering)
            // NOTE: We do NOT filter by assignee here - we show all columns
            steps = steps.map((step) => {
                let filteredSubMilestones = step.subMilestones;

                // Buyer filter only
                if (buyerFilter !== "All") {
                    filteredSubMilestones = filteredSubMilestones.filter(
                        (milestone) => {
                            if (
                                !milestone.checklists ||
                                milestone.checklists.length === 0
                            )
                                return false;
                            const hasBuyerRelatedChecklist =
                                milestone.checklists.some(
                                    (checklist) =>
                                        checklist.is_buyer_related === true
                                );
                            const hasNonBuyerRelatedChecklist =
                                milestone.checklists.some(
                                    (checklist) =>
                                        checklist.is_buyer_related === false
                                );
                            if (buyerFilter === "Buyer Related")
                                return hasBuyerRelatedChecklist;
                            else if (buyerFilter === "Non-buyer")
                                return hasNonBuyerRelatedChecklist;
                            return true;
                        }
                    );
                }
                return {
                    ...step,
                    subMilestones: filteredSubMilestones,
                };
            });

            // 3. Create an account map to collect unique accounts
            const accountMap = {};
            allAccountsData.work_orders.forEach((workOrder) => {
                if (workOrder.accounts && Array.isArray(workOrder.accounts)) {
                    workOrder.accounts.forEach((account) => {
                        if (!accountMap[account.id]) {
                            accountMap[account.id] = {
                                ...account,
                                workOrderIds: [workOrder.work_order_id],
                            };
                        } else {
                            if (
                                !accountMap[account.id].workOrderIds.includes(
                                    workOrder.work_order_id
                                )
                            ) {
                                accountMap[account.id].workOrderIds.push(
                                    workOrder.work_order_id
                                );
                            }
                        }
                    });
                }
            });

            // 4. Build table rows using filtered steps/subMilestones
            const tableRows = Object.values(accountMap).map((account) => {
                // Store assignee information for this account
                const accountAssignees = new Set();

                // UPDATED: Collect all assignees for this specific account across ALL work orders and submilestones
                allAccountsData.work_orders.forEach((wo) => {
                    // Only check if this account is part of this work order
                    const accountInWorkOrder =
                        wo.accounts &&
                        wo.accounts.some((acc) => acc.id === account.id);

                    if (accountInWorkOrder) {
                        const submilestones =
                            allAccountsData.submilestonesByType?.[
                                wo.work_order_type_id
                            ] || [];
                        submilestones.forEach((milestone) => {
                            // Check work_order_account_assignees for this specific account
                            (
                                milestone.work_order_account_assignees || []
                            ).forEach((assignee) => {
                                // UPDATED LOGIC: Include assignees that either:
                                // 1. Have no account_id (general assignees for the work order)
                                // 2. Have account_id that matches this account
                                if (!assignee.account_id || assignee.account_id === account.id) {
                                    accountAssignees.add(assignee.employee_id);
                                }
                            });
                        });
                    }
                });

                const stepData = steps.map((step) => {
                    return step.subMilestones.map((sub) => {
                        const items = sub.checklists || [];
                        if (!items || items.length === 0) return 0;
                        const uploadedDocs = account.uploaded_documents || [];
                        const accountChecklistStatuses =
                            account.account_checklist_statuses || [];
                        const completedCount = items.filter((item) => {
                            const hasUploadedDoc = uploadedDocs.some(
                                (doc) => doc.file_title === item.name
                            );
                            const hasStatusComplete =
                                accountChecklistStatuses.some((status) => {
                                    return (
                                        status.checklist_id === item.id &&
                                        (status.is_completed === true ||
                                            status.status === "complete")
                                    );
                                });
                            return hasUploadedDoc || hasStatusComplete;
                        }).length;
                        return items.length > 0
                            ? Math.round((completedCount / items.length) * 100)
                            : 0;
                    });
                });

                // checklistInfos for current step indicator
                const checklistInfos = steps.flatMap((step) => {
                    return step.subMilestones.map((sub) => {
                        const items = sub.checklists || [];
                        const uploadedDocs = account.uploaded_documents || [];
                        const accountChecklistStatuses =
                            account.account_checklist_statuses || [];
                        const completedChecklists = [];
                        const pendingChecklists = [];
                        items.forEach((item) => {
                            const hasUploadedDoc = uploadedDocs.some(
                                (doc) => doc.file_title === item.name
                            );
                            const hasStatusComplete =
                                accountChecklistStatuses.some((status) => {
                                    return (
                                        status.checklist_id === item.id &&
                                        (status.is_completed === true ||
                                            status.status === "complete")
                                    );
                                });
                            if (hasUploadedDoc || hasStatusComplete) {
                                completedChecklists.push({
                                    id: item.id,
                                    name: item.name,
                                    completedVia: hasUploadedDoc
                                        ? "document"
                                        : "remarks",
                                });
                            } else {
                                pendingChecklists.push({
                                    id: item.id,
                                    name: item.name,
                                });
                            }
                        });
                        const progressPercentage =
                            items.length > 0
                                ? Math.round(
                                      (completedChecklists.length /
                                          items.length) *
                                          100
                                  )
                                : 0;
                        return {
                            subMilestoneId: sub.id,
                            stepName: step.stepName,
                            milestoneName: sub.name,
                            progressPercentage,
                            completedChecklists,
                            pendingChecklists,
                        };
                    });
                });

                return {
                    key: account.id,
                    accountName: account.account_name,
                    contractNo: account.contract_no,
                    propertyName: account.property_name,
                    unitNo: account.unit_no,
                    financing: account.financing,
                    psd: account.psd,
                    status: account.checklist_status || "In Progress",
                    stepData: stepData,
                    currentSubMilestoneId: account.current_submilestone_id,
                    checklistInfos: checklistInfos,
                    remarks: account.remarks || "-",
                    notesData: {
                        accountId: account.id,
                        accountName: account.account_name,
                        workOrder: allAccountsData.work_orders.find((wo) =>
                            account.workOrderIds.includes(wo.work_order_id)
                        ),
                        workOrderType: allAccountsData.work_orders.find((wo) =>
                            account.workOrderIds.includes(wo.work_order_id)
                        )?.work_order_type,
                    },
                    uploadedDocuments: account.uploaded_documents || [],
                    assignedEmployeeIds: Array.from(accountAssignees),
                    workOrderIds: account.workOrderIds || [],
                };
            });

            // 5. Apply row filters (search, status, assignee)
            const filteredRows = tableRows.filter((row) => {
                const searchMatch =
                    searchTerm === "" ||
                    (row.accountName || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (row.propertyName || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (row.unitNo || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (row.contractNo || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());

                // Handle status filtering for both boolean and string values
                let statusMatch = true;
                if (statusFilter !== "All") {
                    if (statusFilter.toLowerCase() === "complete") {
                        statusMatch =
                            row.status === true ||
                            String(row.status || "")
                                .toLowerCase()
                                .includes("complete");
                    } else if (
                        statusFilter.toLowerCase().includes("progress")
                    ) {
                        statusMatch =
                            row.status === false ||
                            String(row.status || "")
                                .toLowerCase()
                                .includes("progress");
                    } else {
                        statusMatch = String(row.status || "")
                            .toLowerCase()
                            .includes(statusFilter.toLowerCase());
                    }
                }

                // UPDATED: Simplified assignee filtering - show all accounts handled by this assignee
                let assigneeMatch = true;
                if (stepAssigneeFilter && stepAssigneeFilter !== "All") {
                    const selectedAssigneeId = parseInt(stepAssigneeFilter);
                    
                    // Simply check if the selected assignee is in the account's assignee list
                    assigneeMatch = row.assignedEmployeeIds && 
                                    row.assignedEmployeeIds.includes(selectedAssigneeId);
                }

                return searchMatch && statusMatch && assigneeMatch;
            });

            const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
            return {
                columnHeaders: [],
                tableRows,
                filteredRows,
                totalPages,
                steps,
            };
        }, [
            allAccountsData,
            searchTerm,
            statusFilter,
            buyerFilter,
            stepAssigneeFilter,
            itemsPerPage,
        ]);

    // Validate pagination when totalPages changes
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    // Column visibility and assignee filter states
    const [showStepView, setShowStepView] = useState(true);
    const [visibleSteps, setVisibleSteps] = useState(new Set());
    const [availableAssignees, setAvailableAssignees] = useState([]);

    // Update visibleSteps when steps change
    useEffect(() => {
        if (steps && steps.length > 0) {
            setVisibleSteps(new Set(steps.map((step) => step.id)));
        }
    }, [steps]);

    // Extract available assignees from allAccountsData
    useEffect(() => {
        if (!allAccountsData || !allAccountsData.work_orders) {
            setAvailableAssignees([]);
            return;
        }
        const assigneeMap = {};
        allAccountsData.work_orders.forEach((wo) => {
            const submilestones =
                allAccountsData.submilestonesByType?.[wo.work_order_type_id] ||
                [];
            submilestones.forEach((milestone) => {
                (milestone.work_order_account_assignees || []).forEach(
                    (assignee) => {
                        if (!assigneeMap[assignee.employee_id]) {
                            const name =
                                assignee.employee?.name ||
                                assignee.employee?.full_name ||
                                assignee.employee?.fullname ||
                                assignee.user?.name ||
                                assignee.user?.full_name ||
                                assignee.user?.fullname ||
                                assignee.user?.username ||
                                assignee.name ||
                                assignee.full_name ||
                                assignee.fullname ||
                                assignee.username ||
                                assignee.employee_name ||
                                assignee.display_name ||
                                assignee.email ||
                                (assignee.employee?.firstname &&
                                assignee.employee?.lastname
                                    ? `${assignee.employee.firstname} ${assignee.employee.lastname}`.trim()
                                    : null) ||
                                (assignee.user?.firstname &&
                                assignee.user?.lastname
                                    ? `${assignee.user.firstname} ${assignee.user.lastname}`.trim()
                                    : null) ||
                                (assignee.firstname && assignee.lastname
                                    ? `${assignee.firstname} ${assignee.lastname}`.trim()
                                    : null) ||
                                `Assignee ${assignee.employee_id}`;

                            assigneeMap[assignee.employee_id] = {
                                id: assignee.employee_id,
                                name,
                            };
                        }
                    }
                );
            });
        });
        setAvailableAssignees(Object.values(assigneeMap));
    }, [allAccountsData]);

    // Handlers for EnhancedControlBar
    const handleStepViewToggle = (checked) => {
        setShowStepView(checked);
    };
    const handleStepVisibilityToggle = (stepId) => {
        setVisibleSteps((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(stepId)) {
                newSet.delete(stepId);
            } else {
                newSet.add(stepId);
            }
            return newSet;
        });
    };
    const handleToggleAllSteps = (checked) => {
        if (checked) {
            setVisibleSteps(new Set(steps.map((step) => step.id)));
        } else {
            setVisibleSteps(new Set());
        }
    };

    // Paginated data with validation
    const paginatedData = useMemo(() => {
        const validCurrentPage = Math.min(
            Math.max(1, currentPage),
            totalPages || 1
        );
        const startIndex = (validCurrentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredRows.slice(startIndex, endIndex);
    }, [filteredRows, currentPage, itemsPerPage, totalPages]);

    // Handle file management
    const handleAddFiles = (
        accountId,
        workOrder,
        stepName,
        checklist,
        onRefresh
    ) => {
        setSelectedAccountInfo({
            accountId,
            workOrder,
            stepName,
            checklist,
            onRefresh: () => {
                handleRefresh();
                if (onRefresh) onRefresh();
            },
        });
        setFilesModalOpen(true);
    };

    const handleOpenNotesModal = (noteData) => {
        setSelectedAccountForNotes(noteData);
        setIsNotesModalOpen(true);
    };

    const handleShowFilesModal = (row) => {
        const uploadedDocs = row.uploadedDocuments || [];
        setSelectedFiles(uploadedDocs);
        setSelectedAccountInfo({
            accountId: row.key,
            accountName: row.accountName,
            contractNo: row.contractNo,
            propertyName: row.propertyName,
            unitNo: row.unitNo,
        });
    };

    // Status badge function
    const getStatusBadge = (status) => {
        const baseClasses =
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";

        if (status === true || status === "true") {
            return (
                <span className={`${baseClasses} bg-green-100 text-green-800`}>
                    Complete
                </span>
            );
        } else if (status === false || status === "false") {
            return (
                <span
                    className={`${baseClasses} bg-yellow-100 text-yellow-800`}
                >
                    In Progress
                </span>
            );
        }

        const statusStr = String(status || "")
            .toLowerCase()
            .trim();

        if (
            statusStr.includes("complete") ||
            statusStr === "completed" ||
            statusStr === "done" ||
            statusStr === "finished" ||
            statusStr === "closed" ||
            statusStr === "resolved"
        ) {
            return (
                <span className={`${baseClasses} bg-green-100 text-green-800`}>
                    Complete
                </span>
            );
        } else if (
            statusStr.includes("progress") ||
            statusStr === "ongoing" ||
            statusStr === "active" ||
            statusStr === "working" ||
            statusStr.includes("in-progress")
        ) {
            return (
                <span
                    className={`${baseClasses} bg-yellow-100 text-yellow-800`}
                >
                    In Progress
                </span>
            );
        } else if (
            statusStr.includes("not started") ||
            statusStr === "pending" ||
            statusStr === "new" ||
            statusStr === "waiting" ||
            statusStr === "queued"
        ) {
            return (
                <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
                    Not Started
                </span>
            );
        } else {
            return (
                <span
                    className={`${baseClasses} bg-yellow-100 text-yellow-800`}
                >
                    In Progress
                </span>
            );
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <Dialog
                open={isOpen}
                handler={onClose}
                size="xxl"
                className="bg-transparent shadow-none fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen"
            >
                <div
                    className="bg-white shadow-xl w-screen h-screen mx-0 flex flex-col"
                    style={{
                        position: "relative",
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                    }}
                >
                    <DialogHeader
                        className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-gray-200 bg-gradient-to-r from-custom-bluegreen to-custom-lightgreen text-white"
                        style={{
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z"
                                />
                            </svg>
                            <div>
                                <Typography
                                    variant="h4"
                                    className="text-white font-semibold"
                                >
                                    All Accounts Summary
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="text-blue-100 font-normal mt-1"
                                >
                                    Overview of all accounts across all work
                                    order groups
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {allAccountsData?.summary && (
                                <div className="text-right text-blue-100 text-sm mr-4">
                                    <div>
                                        {allAccountsData.summary.total_accounts}{" "}
                                        Accounts
                                    </div>
                                    <div>
                                        {allAccountsData.summary.total_groups}{" "}
                                        Groups
                                    </div>
                                    <div>
                                        {
                                            allAccountsData.summary
                                                .total_work_orders
                                        }{" "}
                                        Work Orders
                                    </div>
                                </div>
                            )}
                            <IconButton
                                variant="text"
                                color="white"
                                onClick={onClose}
                                className="hover:bg-white hover:bg-opacity-20"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </IconButton>
                        </div>
                    </DialogHeader>

                    <DialogBody
                        className="p-0 flex-1 overflow-hidden flex flex-col"
                        style={{ minHeight: 0 }}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-96">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-bluegreen mx-auto mb-4"></div>
                                    <Typography
                                        color="gray"
                                        className="text-lg"
                                    >
                                        Loading all accounts data...
                                    </Typography>
                                </div>
                            </div>
                        ) : !allAccountsData ||
                          !tableRows ||
                          tableRows.length === 0 ? (
                            <div className="flex items-center justify-center h-96">
                                <div className="text-center">
                                    <svg
                                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                    </svg>
                                    <Typography
                                        variant="h6"
                                        color="gray"
                                        className="mb-2"
                                    >
                                        No Accounts Found
                                    </Typography>
                                    <Typography color="gray">
                                        There are no accounts in any work order
                                        groups yet.
                                    </Typography>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex-1 flex flex-col overflow-hidden"
                                style={{ minHeight: 0 }}
                            >
                                {/* Enhanced Control Bar */}
                                <div className="flex-shrink-0">
                                    <EnhancedControlBar
                                        searchTerm={searchTerm}
                                        onSearchChange={handleSearchChange}
                                        itemsPerPage={itemsPerPage}
                                        onItemsPerPageChange={
                                            handleItemsPerPageChange
                                        }
                                        statusFilter={statusFilter}
                                        onStatusFilterChange={
                                            handleStatusFilterChange
                                        }
                                        buyerFilter={buyerFilter}
                                        onBuyerFilterChange={
                                            handleBuyerFilterChange
                                        }
                                        stepAssigneeFilter={stepAssigneeFilter}
                                        onStepAssigneeFilterChange={
                                            handleStepAssigneeFilterChange
                                        }
                                        showStepView={showStepView}
                                        onStepViewToggle={handleStepViewToggle}
                                        availableAssignees={availableAssignees}
                                        availableSteps={steps}
                                        visibleSteps={visibleSteps}
                                        onStepVisibilityToggle={
                                            handleStepVisibilityToggle
                                        }
                                        onToggleAllSteps={handleToggleAllSteps}
                                        onRefresh={handleRefresh}
                                        isRefreshing={isRefreshing}
                                        hideItemsPerPage={false}
                                        hideStatusFilter={false}
                                        hideBuyerFilter={false}
                                        hideStepViewToggle={false}
                                        hideAssigneeFilter={false}
                                        hideStepVisibility={false}
                                        hideStepAssigneeFilter={false}
                                        hideCompletedChecklists={
                                            hideCompletedChecklists
                                        }
                                        onHideCompletedChecklistsChange={
                                            handleHideCompletedChecklistsChange
                                        }
                                        hideCompletedChecklistsFilter={true}
                                        stepAssigneeFilterLabel="Accounts by:"
                                    />
                                </div>

                                {/* Milestone Table */}
                                <div
                                    className="flex-1 p-6 bg-white overflow-hidden"
                                    style={{ minHeight: 0 }}
                                >
                                    <div
                                        className="w-full h-full overflow-auto bg-white rounded-lg border border-gray-200 shadow-sm"
                                        style={{
                                            maxHeight: "100%",
                                            maxWidth: "100%",
                                        }}
                                    >
                                        <table className="w-full text-left border-separate border-spacing-0 bg-white min-w-max">
                                            <thead className="sticky top-0 z-50 bg-custom-bluegreen">
                                                {/* Row 1: Step headers */}
                                                <tr className="bg-custom-bluegreen text-white">
                                                    <th
                                                        className="px-3 py-2 font-medium sticky left-0 bg-custom-bluegreen z-50 border-r border-white min-w-[180px] shadow-lg"
                                                        style={{
                                                            backgroundColor:
                                                                "#175D5F",
                                                        }}
                                                        rowSpan={3}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex flex-col items-center justify-center w-full">
                                                                <svg
                                                                    className="w-4 h-4 mb-1"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                                                </svg>
                                                                <span className="text-xs font-semibold text-center block">
                                                                    ACCOUNT NAME
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </th>
                                                    {[...steps]
                                                        .filter(
                                                            (step) =>
                                                                visibleSteps.has(
                                                                    step.id
                                                                ) &&
                                                                step.subMilestones &&
                                                                step
                                                                    .subMilestones
                                                                    .length > 0
                                                        )
                                                        .map((step, idx) => {
                                                            return (
                                                                <th
                                                                    key={
                                                                        step.id
                                                                    }
                                                                    colSpan={
                                                                        step
                                                                            .subMilestones
                                                                            .length *
                                                                        2
                                                                    }
                                                                    className="text-center px-2 py-2 font-medium border-x border-white min-w-[100px] bg-custom-bluegreen"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "var(--tw-bg-opacity, 1)",
                                                                    }}
                                                                >
                                                                    <span className="text-xs font-semibold uppercase tracking-wide">
                                                                        {
                                                                            step.stepName
                                                                        }
                                                                    </span>
                                                                </th>
                                                            );
                                                        })}
                                                    <th
                                                        className="px-2 py-2 font-medium border-l border-white min-w-[80px] bg-custom-bluegreen"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--tw-bg-opacity, 1)",
                                                        }}
                                                        rowSpan={3}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            <svg
                                                                className="w-3 h-3"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                />
                                                            </svg>
                                                            <span className="text-xs font-semibold">
                                                                STATUS
                                                            </span>
                                                        </div>
                                                    </th>
                                                </tr>

                                                {/* Row 2: Sub-milestone headers */}
                                                <tr className="bg-custom-bluegreen text-white">
                                                    {[...steps]
                                                        .filter((step) =>
                                                            visibleSteps.has(
                                                                step.id
                                                            )
                                                        )
                                                        .map((step, idx) =>
                                                            step.subMilestones.map(
                                                                (
                                                                    milestone,
                                                                    i
                                                                ) => (
                                                                    <th
                                                                        key={`${step.id}-${milestone.id}`}
                                                                        colSpan={
                                                                            2
                                                                        }
                                                                        className="text-center px-2 py-1 font-medium border-x border-y border-white min-w-[180px] bg-custom-bluegreen"
                                                                        style={{
                                                                            backgroundColor:
                                                                                "var(--tw-bg-opacity, 1)",
                                                                        }}
                                                                    >
                                                                        <span
                                                                            className="text-xs font-medium block"
                                                                            title={
                                                                                milestone.name
                                                                            }
                                                                        >
                                                                            {
                                                                                milestone.name
                                                                            }
                                                                        </span>
                                                                    </th>
                                                                )
                                                            )
                                                        )}
                                                </tr>

                                                {/* Row 3: Date sub-headers */}
                                                <tr className="bg-custom-bluegreen text-white">
                                                    {[...steps]
                                                        .filter((step) =>
                                                            visibleSteps.has(
                                                                step.id
                                                            )
                                                        )
                                                        .map((step, idx) =>
                                                            step.subMilestones.map(
                                                                (
                                                                    milestone,
                                                                    i
                                                                ) => (
                                                                    <React.Fragment
                                                                        key={`${step.id}-${milestone.id}-dates`}
                                                                    >
                                                                        <th
                                                                            className="text-center px-1 py-1 font-medium border-x border-white min-w-[90px] bg-custom-bluegreen"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "var(--tw-bg-opacity, 1)",
                                                                            }}
                                                                        >
                                                                            <span className="text-xs font-medium">
                                                                                Date
                                                                                Created
                                                                            </span>
                                                                        </th>
                                                                        <th
                                                                            className="text-center px-1 py-1 font-medium border-x border-white min-w-[90px] bg-custom-bluegreen"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "var(--tw-bg-opacity, 1)",
                                                                            }}
                                                                        >
                                                                            <span className="text-xs font-medium">
                                                                                Date
                                                                                Completed
                                                                            </span>
                                                                        </th>
                                                                    </React.Fragment>
                                                                )
                                                            )
                                                        )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((row) => {
                                                    const filteredStepData =
                                                        steps
                                                            .filter((step) =>
                                                                visibleSteps.has(
                                                                    step.id
                                                                )
                                                            )
                                                            .map(
                                                                (
                                                                    step,
                                                                    stepIdx
                                                                ) => {
                                                                    return step.subMilestones.map(
                                                                        (
                                                                            sub,
                                                                            subIdx
                                                                        ) => {
                                                                            const originalStepIdx =
                                                                                steps.findIndex(
                                                                                    (
                                                                                        s
                                                                                    ) =>
                                                                                        s.id ===
                                                                                        step.id
                                                                                );
                                                                            if (
                                                                                row
                                                                                    .stepData[
                                                                                    originalStepIdx
                                                                                ] &&
                                                                                typeof row
                                                                                    .stepData[
                                                                                    originalStepIdx
                                                                                ][
                                                                                    subIdx
                                                                                ] !==
                                                                                    "undefined"
                                                                            ) {
                                                                                return row
                                                                                    .stepData[
                                                                                    originalStepIdx
                                                                                ][
                                                                                    subIdx
                                                                                ];
                                                                            }
                                                                            return null;
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                    const filteredChecklistInfos =
                                                        row.checklistInfos.filter(
                                                            (info) => {
                                                                return steps
                                                                    .filter(
                                                                        (
                                                                            step
                                                                        ) =>
                                                                            visibleSteps.has(
                                                                                step.id
                                                                            )
                                                                    )
                                                                    .some(
                                                                        (
                                                                            step
                                                                        ) =>
                                                                            step.subMilestones.some(
                                                                                (
                                                                                    sub
                                                                                ) =>
                                                                                    sub.id ===
                                                                                    info.subMilestoneId
                                                                            )
                                                                    );
                                                            }
                                                        );
                                                    return (
                                                        <WorkOrderMilestoneRow
                                                            key={row.key}
                                                            row={{
                                                                ...row,
                                                                stepData:
                                                                    filteredStepData,
                                                                checklistInfos:
                                                                    filteredChecklistInfos,
                                                            }}
                                                            steps={steps.filter(
                                                                (step) =>
                                                                    visibleSteps.has(
                                                                        step.id
                                                                    )
                                                            )}
                                                            getStatusBadge={
                                                                getStatusBadge
                                                            }
                                                            currentChecklistInfo={
                                                                row.currentChecklistInfo
                                                            }
                                                            onMilestoneProgression={() => {}}
                                                            isFiltered={
                                                                searchTerm.trim() !==
                                                                    "" ||
                                                                statusFilter !==
                                                                    "All" ||
                                                                buyerFilter !==
                                                                    "All" ||
                                                                stepAssigneeFilter !==
                                                                    "All"
                                                            }
                                                            hideNotesColumn={
                                                                true
                                                            }
                                                            hideActionsColumn={
                                                                true
                                                            }
                                                        />
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogBody>

                    <DialogFooter
                        className="flex-shrink-0 border-t bg-white p-2"
                        style={{ minHeight: "60px" }}
                    >
                        <div className="flex items-center justify-between w-full">
                            <Typography
                                variant="small"
                                color="gray"
                                className="font-normal text-xs"
                            >
                                {filteredRows.length > 0 ? (
                                    <>
                                        Showing{" "}
                                        {(currentPage - 1) * itemsPerPage + 1}{" "}
                                        to{" "}
                                        {Math.min(
                                            currentPage * itemsPerPage,
                                            filteredRows.length
                                        )}{" "}
                                        of {filteredRows.length} accounts
                                        {tableRows &&
                                            filteredRows.length !==
                                                tableRows.length && (
                                                <>
                                                    {" "}
                                                    (filtered from{" "}
                                                    {tableRows.length} total)
                                                </>
                                            )}
                                    </>
                                ) : (
                                    "No accounts to display"
                                )}
                            </Typography>
                            <div className="flex items-center gap-4">
                                {filteredRows && filteredRows.length > 0 && (
                                    <ReactPaginate
                                        previousLabel={
                                            <MdKeyboardArrowLeft className="text-[#404B52]" />
                                        }
                                        nextLabel={
                                            <MdKeyboardArrowRight className="text-[#404B52]" />
                                        }
                                        breakLabel={"..."}
                                        pageCount={totalPages}
                                        marginPagesDisplayed={2}
                                        pageRangeDisplayed={2}
                                        onPageChange={(data) => {
                                            setCurrentPage(data.selected + 1);
                                        }}
                                        containerClassName={"flex gap-2"}
                                        previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                                        nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                                        pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                                        activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-white rounded-[4px] text-[12px]"
                                        pageLinkClassName="w-full h-full flex justify-center items-center"
                                        activeLinkClassName="w-full h-full flex justify-center items-center"
                                        disabledLinkClassName="text-gray-300 cursor-not-allowed"
                                        forcePage={Math.max(
                                            0,
                                            Math.min(
                                                currentPage - 1,
                                                totalPages - 1
                                            )
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    </DialogFooter>
                </div>
            </Dialog>

            {/* Notes Modal */}
            {isNotesModalOpen && selectedAccountForNotes && (
                <NotesAndUpdatesModal
                    isOpen={isNotesModalOpen}
                    onClose={() => {
                        setIsNotesModalOpen(false);
                        setSelectedAccountForNotes(null);
                    }}
                    accountId={selectedAccountForNotes.accountId}
                    workOrderId={
                        selectedAccountForNotes.workOrder?.work_order_id
                    }
                    workOrderType={selectedAccountForNotes.workOrderType}
                    checklistId={selectedAccountForNotes.checklistId}
                    checklistName={selectedAccountForNotes.checklistName}
                    addNoteLogType={selectedAccountForNotes.addNoteLogType}
                    onRefresh={() => {
                        handleRefresh();
                        if (selectedAccountForNotes.onRefresh) {
                            selectedAccountForNotes.onRefresh();
                        }
                    }}
                />
            )}

            {/* Files Modal */}
            {filesModalOpen && selectedAccountInfo.accountId && (
                <AddFilesModal
                    isOpen={filesModalOpen}
                    onClose={() => {
                        setFilesModalOpen(false);
                        setSelectedAccountInfo({});
                    }}
                    accountId={selectedAccountInfo.accountId}
                    workOrder={selectedAccountInfo.workOrder}
                    stepName={selectedAccountInfo.stepName}
                    checklist={selectedAccountInfo.checklist}
                    onRefresh={() => {
                        handleRefresh();
                        if (selectedAccountInfo.onRefresh) {
                            selectedAccountInfo.onRefresh();
                        }
                    }}
                />
            )}

            {/* Account Files Modal */}
            {selectedFiles.length > 0 && (
                <AccountFilesModal
                    isOpen={selectedFiles.length > 0}
                    onClose={() => setSelectedFiles([])}
                    files={selectedFiles}
                    accountInfo={selectedAccountInfo}
                />
            )}
        </>
    );
};

export default AllAccountsSummaryModal;