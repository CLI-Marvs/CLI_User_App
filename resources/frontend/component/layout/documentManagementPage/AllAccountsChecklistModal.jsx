import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    IconButton,
    Button,
    Chip,
} from "@material-tailwind/react";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import apiService from "../../../../../resources/frontend/component/servicesApi/apiService";
import NotesAndUpdatesModal from "./NotesAndUpdatesModal";
import AddFilesModal from "./AddFilesModal";
import WorkOrderGroupDetailsModal from "./WorkOrderGroupDetailsModal";

const AllAccountsChecklistModal = ({ isOpen, onClose, currentUserId }) => {
    const [allAccountsData, setAllAccountsData] = useState(null);
    const [submilestones, setSubmilestones] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modal states
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [selectedAccountForNotes, setSelectedAccountForNotes] =
        useState(null);
    const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [selectedStepName, setSelectedStepName] = useState(null);
    const [selectedChecklist, setSelectedChecklist] = useState(null);

    // Work Order Group Details Modal states
    const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] =
        useState(false);
    const [groupDetailsData, setGroupDetailsData] = useState(null);
    const [isGroupDetailsLoading, setIsGroupDetailsLoading] = useState(false);

    // Pagination and filtering states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [hideCompletedChecklists, setHideCompletedChecklists] =
        useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Fetch submilestone details by IDs
    const fetchSubmilestones = async (submilestoneIds) => {
        try {
            const response = await apiService.post("/submilestones/batch", {
                ids: submilestoneIds,
            });
            if (response.data.success) {
                const submilestoneMap = {};
                response.data.data.forEach((submilestone) => {
                    submilestoneMap[submilestone.id] = submilestone;
                });
                setSubmilestones(submilestoneMap);
            } else {
                console.error("Failed to fetch submilestones:", response.data);
            }
        } catch (error) {
            console.error("Error fetching submilestones:", error);
            // Continue without submilestone data - fallback to existing names
        }
    };

    // Fetch all accounts data using the new dedicated endpoint
    const fetchAllAccountsData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiService.get("/all-accounts-details");
            if (response.data.success) {
                setAllAccountsData(response.data.data);

                // Extract unique submilestone IDs from the data
                const submilestoneIds = new Set();
                const combinedSteps = response.data.data.combined_steps || [];

                combinedSteps.forEach((step) => {
                    if (step.subMilestones && step.subMilestones.length > 0) {
                        step.subMilestones.forEach((submilestone) => {
                            submilestoneIds.add(submilestone.id);
                        });
                    }
                });

                // Fetch submilestone details if we have IDs
                if (submilestoneIds.size > 0) {
                    await fetchSubmilestones(Array.from(submilestoneIds));
                }
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch all accounts data"
                );
            }
        } catch (error) {
            console.error("Error fetching all accounts data:", error);
            console.error("Error details:", error.response?.data);
            setError(
                error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Failed to load all accounts data"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAllAccountsData();
        }
    }, [isOpen]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetchAllAccountsData();
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Process data for Matrix View
    const { matrixColumns, matrixData, summary } = useMemo(() => {
        if (!allAccountsData || !currentUserId) {
            return { matrixColumns: [], matrixData: [], summary: {} };
        }

        const combinedSteps = allAccountsData.combined_steps || [];
        const combinedAccounts = allAccountsData.combined_accounts || [];

        // Generate matrix columns from steps and their submilestones
        const matrixColumns = [];

        combinedSteps.forEach((step) => {
            // Add columns for each submilestone in this step
            if (step.subMilestones && step.subMilestones.length > 0) {
                step.subMilestones.forEach((submilestone) => {
                    // Get submilestone name from backend data or fallback to local data
                    const submilestoneDetails = submilestones[submilestone.id];
                    const milestoneName =
                        submilestoneDetails?.name ||
                        submilestone.name ||
                        submilestone.milestone_name ||
                        submilestone.title ||
                        `Submilestone ${submilestone.id}`;

                    matrixColumns.push({
                        id: submilestone.id,
                        stepId: step.id,
                        work_order_type_id: step.work_order_type_id || step.id,
                        work_order_type_name:
                            step.stepName || `Step ${step.id}`,
                        milestone_name: milestoneName,
                        sequence: step.sequence || 0,
                        checklists: submilestone.checklists || [],
                        step: step, // Reference to parent step
                    });
                });
            }
        });

        // Sort columns by sequence
        matrixColumns.sort((a, b) => a.sequence - b.sequence);

        // Build matrix data for each account, but only include accounts with user assignments
        const matrixData = combinedAccounts
            .map((account) => {
                const row = {
                    accountId: account.id,
                    accountName: account.account_name || "N/A",
                    propertyName: account.property_name || "N/A",
                    unitNo: account.unit_no || "N/A",
                    contractNo: account.contract_no || "N/A",
                    stepData: {},
                    totalAssigned: 0,
                    totalCompleted: 0,
                    hasUserAssignments: false, // Flag to track if user has any assignments to this account
                };

                // For each matrix column (submilestone), check if account has it assigned
                matrixColumns.forEach((col) => {
                    const stepKey = `step_${col.id}`;

                    // Check if this account is assigned to this submilestone AND the current user is assigned to this specific account+submilestone
                    const isAccountAssigned =
                        account.work_order_account_assignees?.some(
                            (assignee) =>
                                assignee.submilestone_id === col.id &&
                                col.step.workOrders?.includes(
                                    assignee.work_order_id
                                )
                        );

                    const isUserAssignedToThisAccountStep =
                        account.work_order_account_assignees?.some(
                            (assignee) =>
                                assignee.submilestone_id === col.id &&
                                assignee.employee_id === currentUserId &&
                                col.step.workOrders?.includes(
                                    assignee.work_order_id
                                )
                        );

                    if (isAccountAssigned && isUserAssignedToThisAccountStep) {
                        // Mark that this account has user assignments
                        row.hasUserAssignments = true;

                        // Calculate completion for this submilestone
                        const checklists = col.checklists || [];
                        const completedChecklists = checklists.filter(
                            (checklist) => {
                                // Check if checklist is completed for this account
                                const hasUploadedDoc =
                                    account.uploaded_documents?.some(
                                        (doc) =>
                                            doc.file_title === checklist.name
                                    );
                                const hasStatusComplete =
                                    account.account_checklist_statuses?.some(
                                        (status) =>
                                            status.checklist_id ===
                                                checklist.id &&
                                            (status.is_completed === true ||
                                                status.status === "complete")
                                    );
                                return hasUploadedDoc || hasStatusComplete;
                            }
                        );

                        row.stepData[stepKey] = {
                            assigned: true,
                            total: checklists.length,
                            completed: completedChecklists.length,
                            percentage:
                                checklists.length > 0
                                    ? Math.round(
                                          (completedChecklists.length /
                                              checklists.length) *
                                              100
                                      )
                                    : 0,
                            status:
                                completedChecklists.length === checklists.length
                                    ? "completed"
                                    : completedChecklists.length > 0
                                    ? "in-progress"
                                    : "pending",
                            workOrder: col.step.workOrder,
                            checklists: checklists,
                            milestone_name: col.milestone_name,
                        };

                        row.totalAssigned++;
                        if (row.stepData[stepKey].status === "completed") {
                            row.totalCompleted++;
                        }
                    } else if (
                        isAccountAssigned &&
                        !isUserAssignedToThisAccountStep
                    ) {
                        // Account is assigned to this step but not to current user - show as assigned but no completion data
                        row.stepData[stepKey] = {
                            assigned: true,
                            total: 0,
                            completed: 0,
                            percentage: 0,
                            status: "user-not-assigned",
                            showBlank: true, // Flag to show blank cell
                        };
                    } else {
                        // Account is not assigned to this step at all
                        row.stepData[stepKey] = {
                            assigned: false,
                            total: 0,
                            completed: 0,
                            percentage: 0,
                            status: "not-assigned",
                        };
                    }
                });

                return row;
            })
            // Filter out accounts that have no user assignments
            .filter((row) => row.hasUserAssignments);

        // Apply filters
        let filteredData = [...matrixData];

        // Search filter
        if (searchTerm && searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filteredData = filteredData.filter(
                (row) =>
                    (row.accountName || "")
                        .toLowerCase()
                        .includes(searchLower) ||
                    (row.propertyName || "")
                        .toLowerCase()
                        .includes(searchLower) ||
                    (row.unitNo || "").toLowerCase().includes(searchLower) ||
                    (row.contractNo || "").toLowerCase().includes(searchLower)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            filteredData = filteredData.filter((row) => {
                if (statusFilter === "completed") {
                    return (
                        row.totalAssigned > 0 &&
                        row.totalCompleted === row.totalAssigned
                    );
                }
                if (statusFilter === "in-progress") {
                    return (
                        row.totalAssigned > 0 &&
                        row.totalCompleted < row.totalAssigned &&
                        row.totalCompleted > 0
                    );
                }
                if (statusFilter === "pending") {
                    return row.totalAssigned > 0 && row.totalCompleted === 0;
                }
                return true;
            });
        }

        // Hide completed if needed
        if (hideCompletedChecklists) {
            filteredData = filteredData.filter((row) => {
                return (
                    row.totalAssigned > 0 &&
                    row.totalCompleted < row.totalAssigned
                );
            });
        }

        return {
            matrixColumns: matrixColumns,
            matrixData: filteredData,
            summary: {
                totalAccounts: matrixData.length, // Now shows accounts with user assignments only
                totalAccountsInSystem: combinedAccounts.length, // Total accounts in system
                totalSteps: matrixColumns.length,
                filteredAccounts: filteredData.length,
            },
        };
    }, [
        allAccountsData,
        submilestones,
        searchTerm,
        statusFilter,
        hideCompletedChecklists,
        currentUserId,
    ]);

    // Paginated data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return matrixData.slice(startIndex, startIndex + itemsPerPage);
    }, [matrixData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(matrixData.length / itemsPerPage);

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return (
                    <svg
                        className="w-5 h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "in-progress":
                return (
                    <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "pending":
                return (
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    </svg>
                );
            default:
                return <span className="text-gray-300">—</span>;
        }
    };

    // Cell click handler - opens WorkOrderGroupDetailsModal for the specific account/step
    const handleCellClick = async (account, step, columnInfo) => {
        if (!step.assigned || step.showBlank) return;

        try {
            setIsGroupDetailsLoading(true);

            // Find the work order group ID that contains this account and step
            let workOrderGroupId = null;

            // Get the account data to find which work order groups it belongs to
            const accountData = allAccountsData?.combined_accounts?.find(
                (acc) => acc.id === account.accountId
            );

            if (accountData?.work_order_account_assignees) {
                // Find the assignee for this specific submilestone and user
                const assignee = accountData.work_order_account_assignees.find(
                    (assignee) =>
                        assignee.submilestone_id === columnInfo.id &&
                        assignee.employee_id === currentUserId
                );

                if (assignee) {
                    const targetWorkOrderId = assignee.work_order_id;

                    // Find which group contains this work order
                    const groups = allAccountsData?.groups || [];
                    for (const group of groups) {
                        const hasWorkOrder = group.work_orders?.some(
                            (wo) =>
                                wo.work_order_id === targetWorkOrderId ||
                                wo.id === targetWorkOrderId
                        );
                        if (hasWorkOrder) {
                            workOrderGroupId = group.id;
                            break;
                        }
                    }
                }
            }

            if (!workOrderGroupId) {
                console.error(
                    "No work order group ID found for step:",
                    step,
                    "column:",
                    columnInfo
                );
                alert("Unable to find work order group details for this step.");
                return;
            }

            // Fetch the work order group details for this specific work order group
            const response = await apiService.get(
                `/work-order-groups/${workOrderGroupId}/details`
            );

            if (response.data) {
                setGroupDetailsData(response.data);
                setIsGroupDetailsModalOpen(true);
            } else {
                console.error(
                    "Failed to fetch work order group details:",
                    response
                );
                alert("Failed to load work order details. Please try again.");
            }
        } catch (error) {
            console.error("Error fetching work order group details:", error);
            alert("Error loading work order details. Please try again.");
        } finally {
            setIsGroupDetailsLoading(false);
        }
    };

    // Handler for opening notes modal
    const handleOpenNotesModal = useCallback((notesData) => {
        setSelectedAccountForNotes(notesData);
        setIsNotesModalOpen(true);
    }, []);

    // Close handlers
    const handleCloseNotesModal = () => {
        setIsNotesModalOpen(false);
        setSelectedAccountForNotes(null);
    };

    const handleCloseAddFilesModal = () => {
        setIsAddFilesModalOpen(false);
        setSelectedAccountId(null);
        setSelectedWorkOrder(null);
        setSelectedStepName(null);
        setSelectedChecklist(null);
    };

    // Work Order Group Details Modal handlers
    const handleCloseGroupDetailsModal = () => {
        setIsGroupDetailsModalOpen(false);
        setGroupDetailsData(null);
    };

    // Refresh function for group details modal
    const refreshGroupDetails = async () => {
        if (!groupDetailsData?.id) return;

        try {
            setIsGroupDetailsLoading(true);
            const response = await apiService.get(
                `/work-order-groups/${groupDetailsData.id}/details`
            );

            if (response.data) {
                setGroupDetailsData(response.data);
                // Also refresh the main accounts data
                await fetchAllAccountsData();
            }
        } catch (error) {
            console.error("Error refreshing group details:", error);
        } finally {
            setIsGroupDetailsLoading(false);
        }
    };

    // Handler for adding files from group details modal
    const handleAddFilesFromDetails = (accountId, workOrder, stepName) => {
        setSelectedAccountId(accountId);
        setSelectedWorkOrder(workOrder);
        setSelectedStepName(stepName);
        setIsAddFilesModalOpen(true);
    };

    // Custom close handler that checks for open child modals
    const handleMainModalClose = () => {
        // Don't close if any child modal is open
        if (
            isGroupDetailsModalOpen ||
            isAddFilesModalOpen ||
            isNotesModalOpen
        ) {
            return;
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <Dialog
                open={isOpen}
                handler={handleMainModalClose}
                size="xxl"
                className="bg-transparent shadow-none fixed inset-0 z-[9990] flex items-center justify-center w-screen h-screen"
                dismiss={{
                    enabled:
                        !isGroupDetailsModalOpen &&
                        !isAddFilesModalOpen &&
                        !isNotesModalOpen,
                    escapeKey:
                        !isGroupDetailsModalOpen &&
                        !isAddFilesModalOpen &&
                        !isNotesModalOpen,
                    referencePress: false,
                    outsidePress:
                        !isGroupDetailsModalOpen &&
                        !isAddFilesModalOpen &&
                        !isNotesModalOpen,
                }}
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
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                            </svg>
                            <div>
                                <Typography
                                    variant="h4"
                                    className="text-white font-semibold"
                                >
                                    Assigned Accounts Overview
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="text-blue-100 font-normal mt-1"
                                >
                                    Complete overview of my assigned accounts
                                    across all work orders
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {summary?.totalAccounts > 0 && (
                                <div className="text-right text-blue-100 text-sm mr-4">
                                    <div>
                                        {summary.totalAccounts} Accounts
                                        assigned
                                    </div>
                                    <div>
                                        {summary.totalAccountsInSystem} Total
                                        Accounts in System
                                    </div>
                                </div>
                            )}
                            <IconButton
                                variant="text"
                                color="white"
                                onClick={handleMainModalClose}
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

                    <DialogBody className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                    <Typography
                                        color="gray"
                                        className="text-lg"
                                    >
                                        Loading all accounts data...
                                    </Typography>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <svg
                                        className="w-16 h-16 text-red-300 mx-auto mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <Typography
                                        variant="h6"
                                        color="red"
                                        className="mb-2"
                                    >
                                        Error Loading Data
                                    </Typography>
                                    <Typography color="gray" className="mb-4">
                                        {error}
                                    </Typography>
                                    <Button
                                        color="blue"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                {/* Filter Controls - NEW MODERN DESIGN */}
                                <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200 shadow-md">
                                    {/* Main Control Bar */}
                                    <div className="px-6 py-4">
                                        {/* Top Row: Search, Primary Filters, Actions */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Enhanced Search */}
                                            <div className="relative flex-1 min-w-[280px] max-w-md">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg
                                                        className="h-5 w-5 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search accounts, properties, contracts..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(
                                                            e.target.value
                                                        );
                                                        setCurrentPage(1);
                                                    }}
                                                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-all duration-200 text-sm bg-white placeholder-gray-400 shadow-sm hover:border-gray-300 hover:shadow-md"
                                                />
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm("");
                                                            setCurrentPage(1);
                                                        }}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Quick Filters Group */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Status Filter */}
                                                <div className="group relative">
                                                    <select
                                                        value={statusFilter}
                                                        onChange={(e) => {
                                                            setStatusFilter(
                                                                e.target.value
                                                            );
                                                            setCurrentPage(1);
                                                        }}
                                                        className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen transition-all duration-200 text-sm bg-white font-medium text-gray-700 hover:border-gray-300 hover:shadow-md cursor-pointer"
                                                    >
                                                        <option value="all">
                                                            All Status
                                                        </option>
                                                        <option value="completed">
                                                            Completed
                                                        </option>
                                                        <option value="in-progress">
                                                            In Progress
                                                        </option>
                                                        <option value="pending">
                                                            Pending
                                                        </option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <svg
                                                            className="h-4 w-4 text-gray-400 group-hover:text-gray-600"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 9l-7 7-7-7"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Hide Completed Checklists */}
                                                <label className="flex items-center gap-2 px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300 hover:shadow-md transition-all duration-200 group">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            hideCompletedChecklists
                                                        }
                                                        onChange={(e) => {
                                                            setHideCompletedChecklists(
                                                                e.target.checked
                                                            );
                                                            setCurrentPage(1);
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                                        Hide Completed
                                                    </span>
                                                </label>

                                                {/* Clear All Filters */}
                                                {(searchTerm ||
                                                    statusFilter !== "all" ||
                                                    hideCompletedChecklists) && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm("");
                                                            setStatusFilter(
                                                                "all"
                                                            );
                                                            setHideCompletedChecklists(
                                                                false
                                                            );
                                                            setCurrentPage(1);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border-2 border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                                                        title="Clear all active filters"
                                                    >
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                        <span className="hidden sm:inline">
                                                            Clear Filters
                                                        </span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 ml-auto">
                                                {/* Refresh Button */}
                                                <button
                                                    onClick={handleRefresh}
                                                    disabled={isRefreshing}
                                                    className={`relative flex items-center justify-center px-4 py-2.5 rounded-lg border-2 font-medium transition-all duration-300 ${
                                                        isRefreshing
                                                            ? "bg-blue-50 border-blue-300 text-blue-600"
                                                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md"
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    title="Refresh data"
                                                >
                                                    <svg
                                                        className={`h-5 w-5 transition-all duration-300 ${
                                                            isRefreshing
                                                                ? "animate-spin"
                                                                : ""
                                                        }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                        />
                                                    </svg>
                                                </button>

                                                {/* Items Per Page */}
                                                <div className="flex items-center gap-2 px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                        Show
                                                    </span>
                                                    <select
                                                        value={itemsPerPage}
                                                        onChange={(e) => {
                                                            setItemsPerPage(
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                )
                                                            );
                                                            setCurrentPage(1);
                                                        }}
                                                        className="appearance-none border-0 px-2 py-0.5 focus:ring-2 focus:ring-custom-lightgreen transition-all duration-200 text-sm bg-transparent font-bold text-gray-700 cursor-pointer"
                                                    >
                                                        <option value={10}>
                                                            10
                                                        </option>
                                                        <option value={25}>
                                                            25
                                                        </option>
                                                        <option value={50}>
                                                            50
                                                        </option>
                                                        <option value={100}>
                                                            100
                                                        </option>
                                                    </select>
                                                    <span className="text-xs font-medium text-gray-500">
                                                        rows
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Matrix Table */}
                                <div className="flex-1 flex flex-col min-h-0 p-0 bg-white overflow-hidden">
                                    {isGroupDetailsLoading && (
                                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                                <Typography
                                                    color="gray"
                                                    className="text-sm"
                                                >
                                                    Loading work order
                                                    details...
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1 min-h-0 overflow-auto bg-white rounded-none border-0 shadow-none">
                                        <table className="w-full border-collapse min-w-max ">
                                            <thead className="sticky top-0 z-20 bg-gray-50">
                                                {/* Work Order Type Headers */}
                                                <tr className="border-b border-gray-200">
                                                    <th
                                                        rowSpan="2"
                                                        className="sticky left-0 z-30 bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[250px]"
                                                    >
                                                        Account Information
                                                    </th>
                                                    {/* Group columns by work order type */}
                                                    {Array.from(
                                                        new Set(
                                                            matrixColumns.map(
                                                                (c) =>
                                                                    c.work_order_type_name
                                                            )
                                                        )
                                                    ).map((typeName) => {
                                                        const typeColumns =
                                                            matrixColumns.filter(
                                                                (c) =>
                                                                    c.work_order_type_name ===
                                                                    typeName
                                                            );
                                                        return (
                                                            <th
                                                                key={typeName}
                                                                colSpan={
                                                                    typeColumns.length
                                                                }
                                                                className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-x border-gray-200 bg-blue-50"
                                                            >
                                                                {typeName}
                                                            </th>
                                                        );
                                                    })}
                                                    <th
                                                        rowSpan="2"
                                                        className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-l border-gray-200 bg-gray-100"
                                                    >
                                                        Progress
                                                    </th>
                                                </tr>
                                                {/* Submilestone Names */}
                                                <tr className="border-b border-gray-200">
                                                    {matrixColumns.map(
                                                        (col) => (
                                                            <th
                                                                key={col.id}
                                                                className="px-1 py-2 text-center text-xs font-medium text-gray-600 border-x border-gray-200 bg-gray-50 min-w-[120px]"
                                                            >
                                                                <div
                                                                    className="truncate"
                                                                    title={
                                                                        col.milestone_name
                                                                    }
                                                                >
                                                                    {
                                                                        col.milestone_name
                                                                    }
                                                                </div>
                                                            </th>
                                                        )
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {paginatedData.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={
                                                                matrixColumns.length +
                                                                2
                                                            }
                                                            className="px-6 py-12 text-center"
                                                        >
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
                                                                        strokeWidth={
                                                                            1
                                                                        }
                                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                    />
                                                                </svg>
                                                                <Typography
                                                                    variant="h6"
                                                                    color="gray"
                                                                    className="mb-2"
                                                                >
                                                                    {searchTerm ||
                                                                    statusFilter !==
                                                                        "all" ||
                                                                    hideCompletedChecklists
                                                                        ? "No Matching Accounts Found"
                                                                        : "No Accounts Found"}
                                                                </Typography>
                                                                <Typography
                                                                    color="gray"
                                                                    className="mb-4"
                                                                >
                                                                    {searchTerm ||
                                                                    statusFilter !==
                                                                        "all" ||
                                                                    hideCompletedChecklists
                                                                        ? "Try adjusting your search or filter criteria."
                                                                        : "There are no accounts available in any work order groups."}
                                                                </Typography>
                                                                {(searchTerm ||
                                                                    statusFilter !==
                                                                        "all" ||
                                                                    hideCompletedChecklists) && (
                                                                    <Button
                                                                        color="blue"
                                                                        variant="text"
                                                                        onClick={() => {
                                                                            setSearchTerm(
                                                                                ""
                                                                            );
                                                                            setStatusFilter(
                                                                                "all"
                                                                            );
                                                                            setHideCompletedChecklists(
                                                                                false
                                                                            );
                                                                            setCurrentPage(
                                                                                1
                                                                            );
                                                                        }}
                                                                        className="mt-2"
                                                                    >
                                                                        Clear
                                                                        All
                                                                        Filters
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    paginatedData.map(
                                                        (row, idx) => (
                                                            <tr
                                                                key={
                                                                    row.accountId
                                                                }
                                                                className={
                                                                    idx % 2 ===
                                                                    0
                                                                        ? "bg-white"
                                                                        : "bg-gray-50"
                                                                }
                                                            >
                                                                <td className="sticky left-0 z-10 bg-white px-3 py-2 whitespace-nowrap border-r border-gray-200">
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {
                                                                                row.accountName
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-gray-700">
                                                                            {
                                                                                row.propertyName
                                                                            }{" "}
                                                                            -
                                                                            Unit{" "}
                                                                            {
                                                                                row.unitNo
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-gray-700">
                                                                            Contract:{" "}
                                                                            {
                                                                                row.contractNo
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                {matrixColumns.map(
                                                                    (col) => {
                                                                        const cellData =
                                                                            row
                                                                                .stepData[
                                                                                `step_${col.id}`
                                                                            ];
                                                                        return (
                                                                            <td
                                                                                key={
                                                                                    col.id
                                                                                }
                                                                                className={`px-1 py-2 text-center border-x border-gray-100 ${
                                                                                    cellData.assigned &&
                                                                                    !cellData.showBlank
                                                                                        ? "cursor-pointer hover:bg-blue-50 hover:shadow-md transition-all duration-200"
                                                                                        : ""
                                                                                }`}
                                                                                title={
                                                                                    cellData.assigned &&
                                                                                    !cellData.showBlank
                                                                                        ? "Click to view work order details"
                                                                                        : ""
                                                                                }
                                                                                onClick={() =>
                                                                                    cellData.assigned &&
                                                                                    !cellData.showBlank &&
                                                                                    handleCellClick(
                                                                                        row,
                                                                                        cellData,
                                                                                        col
                                                                                    )
                                                                                }
                                                                            >
                                                                                {cellData.showBlank ? (
                                                                                    // Account is assigned but user is not assigned to this specific account+step
                                                                                    <span className="text-gray-200">
                                                                                        •
                                                                                    </span>
                                                                                ) : cellData.assigned &&
                                                                                  cellData.status !==
                                                                                      "user-not-assigned" ? (
                                                                                    <div className="flex flex-col items-center">
                                                                                        {getStatusIcon(
                                                                                            cellData.status
                                                                                        )}
                                                                                        <div className="mt-1">
                                                                                            <span
                                                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                                                    cellData.status ===
                                                                                                    "completed"
                                                                                                        ? "bg-green-100 text-green-800"
                                                                                                        : cellData.status ===
                                                                                                          "in-progress"
                                                                                                        ? "bg-blue-100 text-blue-800"
                                                                                                        : "bg-gray-100 text-gray-600"
                                                                                                }`}
                                                                                            >
                                                                                                {
                                                                                                    cellData.percentage
                                                                                                }

                                                                                                %
                                                                                            </span>
                                                                                        </div>
                                                                                        <span className="text-xs text-gray-500 mt-1">
                                                                                            {
                                                                                                cellData.completed
                                                                                            }

                                                                                            /
                                                                                            {
                                                                                                cellData.total
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-gray-300">
                                                                                        —
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        );
                                                                    }
                                                                )}
                                                                <td className="px-3 py-2 text-center border-l border-gray-200">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                                            <div
                                                                                className={`h-2 rounded-full transition-all ${
                                                                                    row.totalAssigned ===
                                                                                    0
                                                                                        ? "bg-gray-400"
                                                                                        : row.totalCompleted ===
                                                                                          row.totalAssigned
                                                                                        ? "bg-green-600"
                                                                                        : row.totalCompleted >
                                                                                          0
                                                                                        ? "bg-blue-600"
                                                                                        : "bg-gray-400"
                                                                                }`}
                                                                                style={{
                                                                                    width: `${
                                                                                        row.totalAssigned >
                                                                                        0
                                                                                            ? (row.totalCompleted /
                                                                                                  row.totalAssigned) *
                                                                                              100
                                                                                            : 0
                                                                                    }%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs text-gray-600">
                                                                            {
                                                                                row.totalCompleted
                                                                            }{" "}
                                                                            /{" "}
                                                                            {
                                                                                row.totalAssigned
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogBody>

                    <DialogFooter className="shrink-0 border-t bg-white p-2">
                        <div className="flex items-center justify-between w-full">
                            <Typography
                                variant="small"
                                color="gray"
                                className="font-normal text-xs"
                            >
                                {matrixData.length > 0 ? (
                                    <>
                                        Showing{" "}
                                        {Math.max(
                                            1,
                                            (currentPage - 1) * itemsPerPage + 1
                                        )}{" "}
                                        to{" "}
                                        {Math.min(
                                            currentPage * itemsPerPage,
                                            matrixData.length
                                        )}{" "}
                                        of {matrixData.length} accounts
                                        {matrixData.length !==
                                            summary.totalAccounts && (
                                            <>
                                                {" "}
                                                (filtered from{" "}
                                                {summary.totalAccounts} total)
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {searchTerm ||
                                        statusFilter !== "all" ||
                                        hideCompletedChecklists
                                            ? `No results found ${
                                                  summary.totalAccounts > 0
                                                      ? `(${summary.totalAccounts} total accounts available)`
                                                      : ""
                                              }`
                                            : "No accounts available"}
                                    </>
                                )}
                            </Typography>
                            <div className="flex items-center gap-4">
                                {totalPages > 1 && (
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
                                        forcePage={currentPage - 1}
                                    />
                                )}
                            </div>
                        </div>
                    </DialogFooter>
                </div>
            </Dialog>

            {/* Notes Modal - Higher z-index */}
            {isNotesModalOpen && selectedAccountForNotes && (
                <div
                    className="fixed inset-0 z-[9996] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <NotesAndUpdatesModal
                        isOpen={isNotesModalOpen}
                        onClose={handleCloseNotesModal}
                        accountId={selectedAccountForNotes.accountId}
                        workOrderId={selectedAccountForNotes.workOrder?.id}
                        workOrderType={selectedAccountForNotes.workOrderType}
                        checklistId={selectedAccountForNotes.checklistId}
                        checklistName={selectedAccountForNotes.checklistName}
                        onRefresh={() => {
                            handleRefresh();
                            if (selectedAccountForNotes.onRefresh) {
                                selectedAccountForNotes.onRefresh();
                            }
                        }}
                    />
                </div>
            )}

            {/* Add Files Modal - Higher z-index */}
            {isAddFilesModalOpen && selectedAccountId && (
                <div
                    className="fixed inset-0 z-[9997] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <AddFilesModal
                        isOpen={isAddFilesModalOpen}
                        onClose={handleCloseAddFilesModal}
                        accountId={selectedAccountId}
                        workOrder={selectedWorkOrder}
                        stepName={selectedStepName}
                        checklist={selectedChecklist}
                        onRefresh={() => {
                            handleRefresh();
                        }}
                    />
                </div>
            )}

            {/* Work Order Group Details Modal - Higher z-index */}
            {isGroupDetailsModalOpen && groupDetailsData && (
                <div
                    className="fixed inset-0 z-[9995] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <WorkOrderGroupDetailsModal
                        isOpen={isGroupDetailsModalOpen}
                        onClose={handleCloseGroupDetailsModal}
                        group={groupDetailsData}
                        getStatusBadge={(status) => {
                            // Simple status badge function - you can customize this
                            const statusClasses = {
                                completed: "bg-green-100 text-green-800",
                                "in-progress": "bg-blue-100 text-blue-800",
                                pending: "bg-gray-100 text-gray-800",
                                overdue: "bg-red-100 text-red-800",
                            };
                            return (
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        statusClasses[status] ||
                                        "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {status}
                                </span>
                            );
                        }}
                        isLoading={isGroupDetailsLoading}
                        showChecklistTable={true}
                        currentUserId={currentUserId}
                        onRefresh={refreshGroupDetails}
                    />
                </div>
            )}
        </>
    );
};

export default AllAccountsChecklistModal;
