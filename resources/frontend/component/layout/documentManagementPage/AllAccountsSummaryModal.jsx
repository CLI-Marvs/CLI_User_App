import React, { useMemo, useState, useEffect, Fragment } from "react";
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

    // Use EXACT same logic as WorkOrderGroupDetailsModal
    const { columnHeaders, tableRows, filteredRows, totalPages, steps } =
        useMemo(() => {
            // Return empty structure if no data (same as WorkOrderGroupDetailsModal)
            if (!allAccountsData || !allAccountsData.work_orders)
                return {
                    columnHeaders: [],
                    tableRows: [],
                    filteredRows: [],
                    totalPages: 0,
                    steps: [],
                };

            // 1. Gather all steps (work orders) and sort by sequence - EXACT SAME LOGIC
            const steps = [...allAccountsData.work_orders]
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

            // 2. Create an account map to collect unique accounts - SAME LOGIC
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
                            // Merge work order IDs if account exists in multiple work orders
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

            // 3. Build table rows - EXACT SAME LOGIC AS WorkOrderGroupDetailsModal
            const tableRows = Object.values(accountMap).map((account) => {
                const stepData = steps.map((step) => {
                    return step.subMilestones.map((sub) => {
                        const items = sub.checklists || [];
                        if (!items || items.length === 0) return 0;

                        const uploadedDocs = account.uploaded_documents || [];
                        const accountChecklistStatuses =
                            account.account_checklist_statuses || [];

                        const completedCount = items.filter((item) => {
                            // Check if document is uploaded
                            const hasUploadedDoc = uploadedDocs.some(
                                (doc) => doc.file_title === item.name
                            );

                            // Check if checklist status is marked complete
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

                // Build checklistInfos for current step indicator - SAME AS WorkOrderGroupDetailsModal
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
                    checklistInfos: checklistInfos, // Add checklistInfos for current step indicator
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
                };
            });

            // 4. Apply filters - SAME LOGIC AS WorkOrderGroupDetailsModal
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

                const statusMatch =
                    statusFilter === "All" ||
                    String(row.status || "")
                        .toLowerCase()
                        .includes(statusFilter.toLowerCase());

                const buyerMatch =
                    buyerFilter === "All" ||
                    (row.accountName || "")
                        .toLowerCase()
                        .includes(buyerFilter.toLowerCase());

                return searchMatch && statusMatch && buyerMatch;
            });

            const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

            return {
                columnHeaders: [], // Not needed for this implementation
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
            itemsPerPage,
        ]);

    // Paginated data - SAME AS WorkOrderGroupDetailsModal
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredRows.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredRows, currentPage, itemsPerPage]);

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
        // Show the uploaded documents for this account
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

    // Get unique statuses for filter
    const getUniqueStatuses = () => {
        if (!tableRows || tableRows.length === 0) return [];
        const statuses = new Set(
            tableRows.map((row) => String(row.status || "")).filter(Boolean)
        );
        return Array.from(statuses);
    };

    // Get unique buyers for filter
    const getUniqueBuyers = () => {
        if (!tableRows || tableRows.length === 0) return [];
        const buyers = new Set(
            tableRows.map((row) => row.accountName).filter(Boolean)
        );
        return Array.from(buyers).slice(0, 20); // Limit for performance
    };

    // Status badge function (similar to WorkOrderGroupDetailsModal)
    const getStatusBadge = (status) => {
        // Ensure status is a string before calling toLowerCase
        const statusStr = String(status || "").toLowerCase();
        const baseClasses =
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";

        if (statusStr === "complete") {
            return (
                <span className={`${baseClasses} bg-gray-300 text-gray-600`}>
                    {/* Grey oblong for completed status */}●
                </span>
            );
        } else if (statusStr === "in progress") {
            return (
                <span
                    className={`${baseClasses} bg-yellow-100 text-yellow-800`}
                >
                    In Progress
                </span>
            );
        } else if (statusStr === "not started") {
            return (
                <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
                    Not Started
                </span>
            );
        } else {
            return (
                <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
                    {status || "Unknown"}
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
                className="bg-transparent shadow-none"
            >
                <div className="bg-white rounded-lg shadow-xl w-[99vw] h-[99vh] mx-auto">
                    <DialogHeader className="flex items-center justify-between pb-4 border-b border-gray-200 bg-gradient-to-r from-custom-bluegreen to-custom-lightgreen text-white rounded-t-lg">
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

                    <DialogBody className="p-0 h-[calc(99vh-120px)] overflow-hidden flex flex-col">
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
                            <div className="h-full flex flex-col overflow-hidden">
                                {/* Enhanced Control Bar */}
                                <div className="flex-shrink-0">
                                    <EnhancedControlBar
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        statusFilter={statusFilter}
                                        setStatusFilter={setStatusFilter}
                                        buyerFilter={buyerFilter}
                                        setBuyerFilter={setBuyerFilter}
                                        stepAssigneeFilter={stepAssigneeFilter}
                                        setStepAssigneeFilter={
                                            setStepAssigneeFilter
                                        }
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        totalPages={totalPages}
                                        itemsPerPage={itemsPerPage}
                                        setItemsPerPage={setItemsPerPage}
                                        filteredItemsCount={filteredRows.length}
                                        totalItemsCount={tableRows.length}
                                        onRefresh={handleRefresh}
                                        isRefreshing={isRefreshing}
                                        hideStatusFilter={false}
                                        hideBuyerFilter={false}
                                        hideStepVisibility={true}
                                        hideStepAssigneeFilter={true}
                                        hideCompletedChecklistsFilter={false}
                                        hideCompletedChecklists={
                                            hideCompletedChecklists
                                        }
                                        setHideCompletedChecklists={
                                            setHideCompletedChecklists
                                        }
                                        statusOptions={getUniqueStatuses()}
                                        buyerOptions={getUniqueBuyers()}
                                    />
                                </div>

                                {/* Milestone Table */}
                                <div className="flex-1 overflow-hidden">
                                    <div className="overflow-auto h-full">
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
                                                    {steps.map((step, idx) => {
                                                        // Check if this step is the current step for any account (excluding completed accounts)
                                                        // Use the EXACT same logic as original WorkOrderGroupDetailsModal, but with completion check
                                                        const isCurrentStepForAnyAccount =
                                                            paginatedData.some(
                                                                (row) => {
                                                                    // Skip completed accounts (this is the key addition)
                                                                    const isAccountComplete =
                                                                        String(
                                                                            row.status ||
                                                                                ""
                                                                        ).toLowerCase() ===
                                                                        "complete";
                                                                    if (
                                                                        isAccountComplete
                                                                    )
                                                                        return false;

                                                                    // Use the simple logic from WorkOrderGroupDetailsModal
                                                                    return step.subMilestones.some(
                                                                        (sub) =>
                                                                            sub.id ===
                                                                            row.currentSubMilestoneId
                                                                    );
                                                                }
                                                            );

                                                        return (
                                                            <th
                                                                key={idx}
                                                                colSpan={
                                                                    step
                                                                        .subMilestones
                                                                        .length *
                                                                    2
                                                                }
                                                                className={`text-center px-2 py-2 font-medium border-x border-white min-w-[100px] relative ${
                                                                    isCurrentStepForAnyAccount
                                                                        ? "bg-blue-600 border-2 border-blue-800 shadow-lg ring-2 ring-blue-300 ring-opacity-50 z-30"
                                                                        : "bg-custom-bluegreen"
                                                                }`}
                                                                style={{
                                                                    backgroundColor:
                                                                        isCurrentStepForAnyAccount
                                                                            ? "#2563eb"
                                                                            : "var(--tw-bg-opacity, 1)",
                                                                }}
                                                            >
                                                                <span
                                                                    className={`text-xs font-semibold uppercase tracking-wide ${
                                                                        isCurrentStepForAnyAccount
                                                                            ? "text-white"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {
                                                                        step.stepName
                                                                    }
                                                                </span>
                                                                {isCurrentStepForAnyAccount && (
                                                                    <>
                                                                        <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white rounded-full animate-pulse border border-blue-200 shadow-sm"></div>
                                                                        <div className="absolute top-0.5 right-0.5 px-1 py-0.5 bg-white text-blue-800 text-[8px] rounded font-bold shadow-sm leading-none">
                                                                            CURRENT
                                                                        </div>
                                                                    </>
                                                                )}
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
                                                    {steps.map((step, idx) =>
                                                        step.subMilestones.map(
                                                            (milestone, i) => (
                                                                <th
                                                                    key={`${idx}-${i}`}
                                                                    colSpan={2}
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
                                                    {steps.map((step, idx) =>
                                                        step.subMilestones.map(
                                                            (milestone, i) => (
                                                                <React.Fragment
                                                                    key={`${idx}-${i}-dates`}
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
                                                {paginatedData.map((row) => (
                                                    <WorkOrderMilestoneRow
                                                        key={row.key}
                                                        row={row}
                                                        steps={steps}
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
                                                                "All"
                                                        }
                                                        hideNotesColumn={true}
                                                        hideActionsColumn={true}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogBody>

                    <DialogFooter className="border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between w-full">
                            <Typography
                                variant="small"
                                color="gray"
                                className="font-normal"
                            >
                                {filteredRows.length > 0 && (
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
                                )}
                            </Typography>
                            <Button
                                variant="text"
                                color="gray"
                                onClick={onClose}
                                className="font-medium"
                            >
                                Close
                            </Button>
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
