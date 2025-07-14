import React, { useState, useEffect } from "react";
import apiService from "../../../servicesApi/apiService";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card, CardFooter, Typography } from "@material-tailwind/react";
import ReactPaginate from "react-paginate";
import {
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
    MdKeyboardArrowDown,
    MdSearch,
    MdClear,
} from "react-icons/md";
import { BsArrowsFullscreen } from "react-icons/bs";
import ProcessWorkOrderModal from "../../../layout/documentManagementPage/ProcessWorkOrderModal";
import _ from "lodash";
import AddFilesModal from "../../../layout/documentManagementPage/AddFilesModal";
import WorkOrderGroupDetailsModal from "../../../layout/documentManagementPage/WorkOrderGroupDetailsModal";

const MyWorkOrders = () => {
    const [workOrderGroups, setWorkOrderGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(6);
    const [totalWorkOrders, setTotalWorkOrders] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [viewMode, setViewMode] = useState("table");
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [selectedWorkOrderData, setSelectedWorkOrderData] = useState(null);
    const [selectedStepName, setSelectedStepName] = useState("");
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] =
        useState(false);
    const [groupDetailsData, setGroupDetailsData] = useState(null);
    const [isGroupDetailsLoading, setIsGroupDetailsLoading] = useState(null);

    // Filter states
    const [workOrderNoFilter, setWorkOrderNoFilter] = useState("");
    const [projectFilter, setProjectFilter] = useState("");
    const [dueDateFilter, setDueDateFilter] = useState("");
    const [lastUpdatedFilter, setLastUpdatedFilter] = useState("");

    useEffect(() => {
        const fetchWorkOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.get("/my-workorders", {
                    params: {
                        page: currentPage,
                        per_page: perPage,
                        sortBy: sortBy,
                        sortOrder: sortOrder,
                    },
                });
                console.log(response.data);
                // Group by work_order_group_id
                const grouped = Object.values(
                    (response.data.data || []).reduce((acc, wo) => {
                        const groupId = wo.work_order_group_id || "ungrouped";
                        if (!acc[groupId]) {
                            acc[groupId] = {
                                id: groupId,
                                work_orders: [],
                            };
                        }
                        acc[groupId].work_orders.push(wo);
                        return acc;
                    }, {})
                );
                setWorkOrderGroups(grouped);
                setTotalWorkOrders(response.data.total);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching work orders:", err);
                setError("Failed to fetch work orders. Please try again.");
                setLoading(false);
            }
        };

        fetchWorkOrders();
    }, [currentPage, perPage, sortBy, sortOrder]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        const [newSortBy, newSortOrder] = e.target.value.split(":");
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setCurrentPage(1);
    };

    const handleWorkOrderNoFilterChange = (e) => {
        setWorkOrderNoFilter(e.target.value);
    };

    const handleProjectFilterChange = (e) => {
        setProjectFilter(e.target.value);
    };

    const handleDueDateFilterChange = (e) => {
        setDueDateFilter(e.target.value);
    };

    const handleLastUpdatedFilterChange = (e) => {
        setLastUpdatedFilter(e.target.value);
    };

    const clearAllFilters = () => {
        setStatusFilter("");
        setWorkOrderNoFilter("");
        setProjectFilter("");
        setDueDateFilter("");
        setLastUpdatedFilter("");
        setSortBy("created_at");
        setSortOrder("desc");
        setCurrentPage(1);
    };

    const hasActiveFilters = () => {
        return (
            statusFilter ||
            workOrderNoFilter ||
            projectFilter ||
            dueDateFilter ||
            lastUpdatedFilter
        );
    };

    // Client-side filtering function
    const getFilteredWorkOrderGroups = () => {
        let filtered = [...workOrderGroups];

        // Filter by work order number (work order group id)
        if (workOrderNoFilter) {
            filtered = filtered.filter((group) => {
                // Check if any work order in the group has a matching work_order_group_id
                return (
                    (group.work_orders || []).some(
                        (wo) =>
                            String(wo.work_order_group_id || "")
                                .toLowerCase()
                                .includes(workOrderNoFilter.toLowerCase()) ||
                            String(wo.work_order_group_id || "")
                                .padStart(7, "1000-")
                                .toLowerCase()
                                .includes(workOrderNoFilter.toLowerCase())
                    ) ||
                    // Also check the group id itself as fallback
                    String(group.id)
                        .toLowerCase()
                        .includes(workOrderNoFilter.toLowerCase()) ||
                    String(group.id)
                        .padStart(7, "1000-")
                        .toLowerCase()
                        .includes(workOrderNoFilter.toLowerCase())
                );
            });
        }

        // Filter by project
        if (projectFilter) {
            filtered = filtered.filter((group) => {
                const latestWO = (group.work_orders || [])
                    .slice()
                    .sort(
                        (a, b) =>
                            new Date(b.updated_at) - new Date(a.updated_at)
                    )[0];

                if (!latestWO?.accounts) return false;

                return latestWO.accounts.some((acc) =>
                    (acc.property_name || acc.project || acc.account_name || "")
                        .toLowerCase()
                        .includes(projectFilter.toLowerCase())
                );
            });
        }

        // Filter by status
        if (statusFilter) {
            filtered = filtered.filter((group) =>
                (group.work_orders || []).some(
                    (wo) => wo.status === statusFilter
                )
            );
        }

        // Filter by due date
        if (dueDateFilter) {
            const now = new Date();
            const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );
            const weekFromNow = new Date(
                today.getTime() + 7 * 24 * 60 * 60 * 1000
            );
            const monthFromNow = new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                today.getDate()
            );

            filtered = filtered.filter((group) => {
                const latestWO = (group.work_orders || [])
                    .slice()
                    .sort(
                        (a, b) =>
                            new Date(b.updated_at) - new Date(a.updated_at)
                    )[0];

                if (!latestWO?.work_order_deadline) return false;

                const dueDate = new Date(latestWO.work_order_deadline);

                switch (dueDateFilter) {
                    case "overdue":
                        return dueDate < today;
                    case "today":
                        return dueDate.toDateString() === today.toDateString();
                    case "week":
                        return dueDate >= today && dueDate <= weekFromNow;
                    case "month":
                        return dueDate >= today && dueDate <= monthFromNow;
                    default:
                        return true;
                }
            });
        }

        // Filter by last updated
        if (lastUpdatedFilter) {
            const now = new Date();
            const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                today.getDate()
            );

            filtered = filtered.filter((group) => {
                const latestWO = (group.work_orders || [])
                    .slice()
                    .sort(
                        (a, b) =>
                            new Date(b.updated_at) - new Date(a.updated_at)
                    )[0];

                if (!latestWO?.updated_at) return false;

                const updatedDate = new Date(latestWO.updated_at);

                switch (lastUpdatedFilter) {
                    case "today":
                        return (
                            updatedDate.toDateString() === today.toDateString()
                        );
                    case "week":
                        return updatedDate >= weekAgo;
                    case "month":
                        return updatedDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const getLatestWO = (group) => {
                return (group.work_orders || [])
                    .slice()
                    .sort((wo1, wo2) => new Date(wo2.updated_at) - new Date(wo1.updated_at))[0];
            };

            const latestWO_A = getLatestWO(a);
            const latestWO_B = getLatestWO(b);

            let comparison = 0;

            switch (sortBy) {
                case 'created_at':
                    const createdA = latestWO_A?.created_at ? new Date(latestWO_A.created_at) : new Date(0);
                    const createdB = latestWO_B?.created_at ? new Date(latestWO_B.created_at) : new Date(0);
                    comparison = createdA - createdB;
                    break;

                case 'updated_at':
                    const updatedA = latestWO_A?.updated_at ? new Date(latestWO_A.updated_at) : new Date(0);
                    const updatedB = latestWO_B?.updated_at ? new Date(latestWO_B.updated_at) : new Date(0);
                    comparison = updatedA - updatedB;
                    break;

                case 'work_order_deadline':
                    const deadlineA = latestWO_A?.work_order_deadline ? new Date(latestWO_A.work_order_deadline) : new Date(0);
                    const deadlineB = latestWO_B?.work_order_deadline ? new Date(latestWO_B.work_order_deadline) : new Date(0);
                    comparison = deadlineA - deadlineB;
                    break;

                default:
                    // Default to created_at
                    const defaultCreatedA = latestWO_A?.created_at ? new Date(latestWO_A.created_at) : new Date(0);
                    const defaultCreatedB = latestWO_B?.created_at ? new Date(latestWO_B.created_at) : new Date(0);
                    comparison = defaultCreatedA - defaultCreatedB;
                    break;
            }

            // Apply sort order (asc or desc)
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        return filtered;
    };

    const handleProcessClick = (order) => {
        setSelectedWorkOrder(order);
        setIsProcessModalOpen(true);
    };

    const handleCloseProcessModal = (didSubmit) => {
        setIsProcessModalOpen(false);
        setSelectedWorkOrder(null);
        if (didSubmit) {
            setCurrentPage(1);
        }
    };

    const handleOpenGroupDetailsModal = async (group) => {
        setIsGroupDetailsModalOpen(true);
        setIsGroupDetailsLoading(true);
        setGroupDetailsData(null);
        try {
            const response = await apiService.get(
                `/work-order-groups/${group.id}/details`
            );
            setGroupDetailsData(response.data);
            console.log("response", response.data);
        } catch (err) {
            console.error("Error fetching group details:", err);
        } finally {
            setIsGroupDetailsLoading(false);
        }
    };

    const handleCloseGroupDetailsModal = () => {
        setIsGroupDetailsModalOpen(false);
        setGroupDetailsData(null);
    };

    const handleAddFilesFromDetails = (accountId, workOrder, stepName) => {
        setSelectedAccountId(accountId);
        setSelectedWorkOrderData(workOrder);
        setSelectedStepName(stepName);
        setIsAddFilesModalOpen(true);
        handleCloseGroupDetailsModal();
    };

    const TABLE_HEAD = [
        { head: "Work Order" },
        { head: "Type" },
        { head: "Status" },
        { head: "Priority" },
        { head: "Deadline" },
        { head: "Created By" },
        { head: "Actions" },
    ];

    const SkeletonGridCard = () => (
        <div className="bg-white border border-gray-200 rounded-xl shadow flex flex-col h-[330px]">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <Skeleton width={100} height={20} />
                    <div className="flex items-center space-x-1">
                        <Skeleton
                            width={60}
                            height={20}
                            borderRadius="9999px"
                        />
                        <Skeleton
                            width={60}
                            height={20}
                            borderRadius="9999px"
                        />
                    </div>
                </div>
            </div>
            <div className="px-4 py-3 space-y-3 text-sm flex-1">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Skeleton width={50} />
                        <Skeleton width={100} height={15} />
                    </div>
                    <div>
                        <Skeleton width={60} />
                        <Skeleton width={120} height={15} />
                    </div>
                </div>
                <div>
                    <Skeleton width={70} />
                    <Skeleton width={100} height={15} />
                </div>
                <div>
                    <Skeleton width={60} />
                    <Skeleton count={2} />
                </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                <div className="flex justify-end">
                    <Skeleton width={90} height={30} borderRadius="0.375rem" />
                </div>
            </div>
        </div>
    );

    const SkeletonTableRow = () => (
        <tr className="hover:bg-gray-100">
            <td className="p-4 border-b border-gray-300">
                <Skeleton width={80} />
                <Skeleton width={150} />
            </td>
            <td className="p-4 border-b border-gray-300">
                <Skeleton width={100} />
            </td>
            <td className="p-4 border-b border-gray-300">
                <Skeleton width={70} height={20} borderRadius="9999px" />
            </td>
            <td className="p-4 border-b border-gray-300">
                <Skeleton width={70} height={20} borderRadius="9999px" />
            </td>
            <td className="p-4 border-b border-gray-300">
                <Skeleton width={90} />
            </td>
            <td className="p-4 border-b border-gray-300">
                <Skeleton width={50} height={28} borderRadius="0.375rem" />
            </td>
        </tr>
    );
    const getStatusBadge = (status) => {
        const statusColors = {
            Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            Assigned: "bg-blue-100 text-blue-800 border-blue-200",
            "In Progress": "bg-indigo-100 text-indigo-800 border-indigo-200",
            Complete: "bg-green-100 text-green-800 border-green-200",
            Cancelled: "bg-red-100 text-red-800 border-red-200",
        };

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    statusColors[status] ||
                    "bg-gray-100 text-gray-800 border-gray-200"
                }`}
            >
                {status}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityColors = {
            Urgent: "bg-red-100 text-red-800 border-red-300",
            High: "bg-orange-100 text-orange-800 border-orange-300",
            Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
            Low: "bg-gray-100 text-gray-800 border-gray-300",
        };

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    priorityColors[priority] ||
                    "bg-gray-100 text-gray-800 border-gray-300"
                }`}
            >
                {priority}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const isOverdue = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const canWorkOnOrder = (status) => {
        return ["Assigned", "In Progress"].includes(status);
    };

    const getHeaderBackgroundColor = (status) => {
        switch (status) {
            case "Complete":
                return "bg-green-50";
            case "In Progress":
                return "bg-indigo-50";
            case "Pending":
                return "bg-yellow-50";
            case "Assigned":
                return "bg-blue-50";
            case "Cancelled":
                return "bg-red-50";
            default:
                return "bg-gray-50";
        }
    };

    const renderGridView = () => {
        const filteredGroups = getFilteredWorkOrderGroups();

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredGroups.map((group) => (
                    <div
                        key={group.id}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex flex-col"
                    >
                        {/* Header */}
                        <div
                            className={`px-3 py-2 border-b border-gray-100 rounded-t-xl bg-gray-50`}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    WO #{group.id}
                                </h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-1 flex-1">
                            <ul className="space-y-1">
                                {(group.work_orders || []).map((order) => (
                                    <li
                                        key={order.work_order_id}
                                        className="bg-white rounded-lg p-2 border border-gray-100 hover:bg-indigo-50/50"
                                    >
                                        <div className="grid grid-cols-3 gap-x-2">
                                            <div className="col-span-2">
                                                <p className="text-xs font-medium text-gray-800 truncate">
                                                    {
                                                        order.work_order_type
                                                            ?.type_name
                                                    }
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {order.accounts
                                                        ?.map(
                                                            (a) =>
                                                                a.account_name
                                                        )
                                                        .join(", ")}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-end space-x-2">
                                                {getStatusBadge(order.status)}
                                                {canWorkOnOrder(
                                                    order.status
                                                ) && (
                                                    <button
                                                        onClick={() =>
                                                            handleProcessClick(
                                                                order
                                                            )
                                                        }
                                                        className="px-2 py-0.5 text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                                                    >
                                                        Process
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTableView = () => {
        const filteredGroups = getFilteredWorkOrderGroups();

        const toggleGroup = (groupId) => {
            setExpandedGroup((prev) => (prev === groupId ? null : groupId));
        };

        // Helper to prevent row click when clicking on action buttons
        const handleRowClick = (e, groupId) => {
            // Prevent toggle if clicking on a button or its child
            if (
                e.target.closest("button") ||
                e.target.closest("a") ||
                e.target.closest(".ignore-row-toggle")
            ) {
                return;
            }
            toggleGroup(groupId);
        };

        return (
            <Card className="w-full overflow-hidden rounded-md border-0 bg-white backdrop-blur-sm">
                <table className="w-full table-fixed bg-white rounded-md shadow-inner">
                    <colgroup>
                        <col style={{ width: "28%" }} />
                        <col style={{ width: "22%" }} />
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "16%" }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-custom-bluegreen">
                        <tr>
                            <th className="text-white h-[44px] px-3 py-1 first:rounded-tl-2xl">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <Typography
                                        variant="small"
                                        className="!font-bold text-white leading-none tracking-wide uppercase text-xs"
                                    >
                                        Work Order No.
                                    </Typography>
                                </div>
                            </th>
                            <th className="text-white h-[44px] px-3 py-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <Typography
                                        variant="small"
                                        className="!font-bold text-white leading-none tracking-wide uppercase text-xs"
                                    >
                                        Project
                                    </Typography>
                                </div>
                            </th>
                            <th className="text-white h-[44px] px-3 py-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                    <Typography
                                        variant="small"
                                        className="!font-bold text-white leading-none tracking-wide uppercase text-xs"
                                    >
                                        Due Date
                                    </Typography>
                                </div>
                            </th>
                            <th className="text-white h-[44px] px-3 py-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                    <Typography
                                        variant="small"
                                        className="!font-bold text-white leading-none tracking-wide uppercase text-xs"
                                    >
                                        Last Updated
                                    </Typography>
                                </div>
                            </th>
                            <th className="text-white h-[44px] px-3 py-1 last:rounded-tr-2xl text-center">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                                    <Typography
                                        variant="small"
                                        className="!font-bold text-white leading-none tracking-wide uppercase text-xs"
                                    >
                                        Actions
                                    </Typography>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredGroups.map((group, idx) => {
                            // Find the latest work order in the group (by updated_at or sequence)
                            const latestWO = (group.work_orders || [])
                                .slice()
                                .sort(
                                    (a, b) =>
                                        new Date(b.updated_at) -
                                        new Date(a.updated_at)
                                )[0];
                            // --- Restore stepRows for expanded dropdown ---
                            // 1. Gather all steps (work orders) and sort by sequence
                            const steps = (group.work_orders || [])
                                .map((wo) => ({
                                    ...wo,
                                    sequence: wo.work_order_type?.sequence ?? 0,
                                }))
                                .sort((a, b) => a.sequence - b.sequence);

                            // 2. Build a map: accountId -> step with highest sequence
                            const accountLatestStep = {};
                            steps.forEach((step) => {
                                (step.accounts || []).forEach((acc) => {
                                    if (
                                        !accountLatestStep[acc.id] ||
                                        step.sequence >
                                            accountLatestStep[acc.id].sequence
                                    ) {
                                        accountLatestStep[acc.id] = {
                                            stepId: step.work_order_id,
                                            sequence: step.sequence,
                                            stepName:
                                                step.work_order_type
                                                    ?.type_name ||
                                                step.work_order,
                                            workOrder: step,
                                            account: acc,
                                        };
                                    }
                                });
                            });

                            // 3. For each step, filter accounts to only show those whose latest step is this step
                            const stepRows = steps.map((step) => {
                                const filteredAccounts = (
                                    step.accounts || []
                                ).filter(
                                    (acc) =>
                                        accountLatestStep[acc.id]?.stepId ===
                                        step.work_order_id
                                );
                                if (filteredAccounts.length === 0) return null;
                                return filteredAccounts.map((account) => (
                                    <tr
                                        key={account.id}
                                        className="hover:bg-slate-50 transition-colors duration-150"
                                    >
                                        <td className="px-2 py-1.5 font-medium text-gray-900 text-sm">
                                            {account.account_name}
                                        </td>
                                        <td className="px-2 py-1.5 text-gray-700 text-sm">
                                            {step.work_order_type?.type_name ||
                                                step.work_order}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            {getStatusBadge(step.status)}
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedAccountId(
                                                        account.id
                                                    );
                                                    setSelectedWorkOrderData(
                                                        step
                                                    );
                                                    setSelectedStepName(
                                                        step.work_order_type
                                                            ?.type_name ||
                                                            step.work_order
                                                    );
                                                    setIsAddFilesModalOpen(
                                                        true
                                                    );
                                                }}
                                                className="px-2 py-1 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                                            >
                                                Add Files
                                            </button>
                                        </td>
                                    </tr>
                                ));
                            });

                            return (
                                <React.Fragment key={group.id}>
                                    <tr
                                        className={`transition-all duration-200 ease-in-out ${
                                            expandedGroup === group.id
                                                ? "bg-gradient-to-r from-blue-50 to-indigo-50"
                                                : idx % 2 === 0
                                                ? "bg-gradient-to-r from-slate-50 to-gray-50"
                                                : "bg-white"
                                        } hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group cursor-pointer`}
                                        style={{
                                            boxShadow:
                                                expandedGroup === group.id
                                                    ? "0 8px 25px 0 rgba(59, 130, 246, 0.15)"
                                                    : undefined,
                                        }}
                                        onClick={(e) =>
                                            handleRowClick(e, group.id)
                                        }
                                    >
                                        <td className="px-3 py-2 font-bold text-base text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full opacity-70"></div>
                                                <span className="font-mono tracking-wide">
                                                    {String(group.id).padStart(
                                                        7,
                                                        "1000-"
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="font-medium">
                                                    {latestWO?.accounts &&
                                                    latestWO.accounts.length > 0
                                                        ? latestWO.accounts
                                                              .map(
                                                                  (acc) =>
                                                                      acc.property_name ||
                                                                      acc.project ||
                                                                      acc.account_name ||
                                                                      "No Property"
                                                              )
                                                              .filter(
                                                                  (v, i, a) =>
                                                                      a.indexOf(
                                                                          v
                                                                      ) === i
                                                              )
                                                              .join(", ")
                                                        : "No Property"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                <span className="font-medium">
                                                    {latestWO?.work_order_deadline
                                                        ? formatDate(
                                                              latestWO.work_order_deadline
                                                          )
                                                        : "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                <span className="font-medium">
                                                    {latestWO?.updated_at
                                                        ? formatDate(
                                                              latestWO.updated_at
                                                          )
                                                        : "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenGroupDetailsModal(
                                                            group
                                                        );
                                                    }}
                                                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg transition-all duration-200 ignore-row-toggle"
                                                    title="Maximize Details"
                                                >
                                                    <BsArrowsFullscreen
                                                        size={16}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedGroup === group.id && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50"
                                            >
                                                <div className="rounded-md border border-gray-200 overflow-hidden bg-white">
                                                    <table className="w-full table-auto text-left">
                                                        <thead>
                                                            <tr className="border-b border-gray-200 bg-white">
                                                                <th className="px-2 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                                    Account Name
                                                                </th>
                                                                <th className="px-2 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                                    Current Step
                                                                </th>
                                                                <th className="px-2 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                                    Overall
                                                                    Status
                                                                </th>
                                                                <th className="px-2 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                                                                    Action
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {stepRows
                                                                .flat()
                                                                .filter(
                                                                    Boolean
                                                                )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        );
    };

    const renderPagination = () => (
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4 mt-4">
            <Typography
                variant="small"
                color="blue-gray"
                className="font-normal"
            >
                Page {currentPage} of {Math.ceil(totalWorkOrders / perPage)}
            </Typography>
            <ReactPaginate
                previousLabel={
                    <MdKeyboardArrowLeft className="text-[#404B52]" />
                }
                nextLabel={<MdKeyboardArrowRight className="text-[#404B52]" />}
                breakLabel={"..."}
                pageCount={Math.ceil(totalWorkOrders / perPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={2}
                onPageChange={(data) => {
                    handlePageChange(data.selected + 1);
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
        </CardFooter>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                My Work Orders
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage and track your assigned work orders
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-md ${
                                        viewMode === "grid"
                                            ? "bg-indigo-100 text-indigo-600"
                                            : "text-gray-400 hover:text-gray-500"
                                    }`}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`p-2 rounded-md ${
                                        viewMode === "table"
                                            ? "bg-indigo-100 text-indigo-600"
                                            : "text-gray-400 hover:text-gray-500"
                                    }`}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Compact Filters */}
                <div className="bg-gradient-to-r from-white to-blue-50/30 rounded-xl shadow-sm border border-gray-200/60 mb-4 p-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {/* Work Order No Filter */}
                        <div className="flex items-center space-x-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <MdSearch className="text-gray-400 text-sm" />
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">WO:</label>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={workOrderNoFilter}
                                onChange={handleWorkOrderNoFilterChange}
                                className="w-20 text-xs border-none outline-none bg-transparent placeholder-gray-400"
                            />
                            {workOrderNoFilter && (
                                <button
                                    onClick={() => setWorkOrderNoFilter("")}
                                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                >
                                    <MdClear size={12} />
                                </button>
                            )}
                        </div>

                        {/* Project Filter */}
                        <div className="flex items-center space-x-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Project:</label>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={projectFilter}
                                onChange={handleProjectFilterChange}
                                className="w-20 text-xs border-none outline-none bg-transparent placeholder-gray-400"
                            />
                            {projectFilter && (
                                <button
                                    onClick={() => setProjectFilter("")}
                                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                >
                                    <MdClear size={12} />
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center space-x-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Status:</label>
                            <select
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                className="text-xs border-none outline-none bg-transparent cursor-pointer"
                            >
                                <option value="">All</option>
                                <option value="Pending">Pending</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Complete">Complete</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Due Date Filter */}
                        <div className="flex items-center space-x-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Due:</label>
                            <select
                                value={dueDateFilter}
                                onChange={handleDueDateFilterChange}
                                className="text-xs border-none outline-none bg-transparent cursor-pointer"
                            >
                                <option value="">All</option>
                                <option value="overdue">Overdue</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>

                        {/* Last Updated Filter */}
                        <div className="flex items-center space-x-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Updated:</label>
                            <select
                                value={lastUpdatedFilter}
                                onChange={handleLastUpdatedFilterChange}
                                className="text-xs border-none outline-none bg-transparent cursor-pointer"
                            >
                                <option value="">All</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div className="flex items-center space-x-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <MdKeyboardArrowDown className="text-gray-400 text-sm" />
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Sort:</label>
                            <select
                                value={`${sortBy}:${sortOrder}`}
                                onChange={handleSortChange}
                                className="text-xs border-none outline-none bg-transparent cursor-pointer"
                            >
                                <option value="created_at:desc">Newest First</option>
                                <option value="created_at:asc">Oldest First</option>
                                <option value="work_order_deadline:asc">Due Soon</option>
                                <option value="work_order_deadline:desc">Due Later</option>
                                <option value="updated_at:desc">Recently Updated</option>
                                <option value="updated_at:asc">Least Recently Updated</option>
                            </select>
                        </div>

                        {/* Results Count & Actions */}
                        <div className="flex items-center space-x-2 ml-auto">
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all duration-200 hover:scale-105"
                                >
                                    <MdClear size={12} />
                                    <span>Clear</span>
                                </button>
                            )}
                            <div className="flex items-center space-x-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-200">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                <span className="text-xs text-gray-600 font-medium">
                                    {getFilteredWorkOrderGroups().length} 
                                    <span className="text-gray-500 ml-0.5">
                                        result{getFilteredWorkOrderGroups().length !== 1 ? 's' : ''}
                                    </span>
                                    {hasActiveFilters() && <span className="text-blue-600 ml-1">(filtered)</span>}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && workOrderGroups.length === 0 && (
                    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <SkeletonGridCard key={i} />
                                ))}
                            </div>
                        ) : (
                            <Card className="w-full overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-max table-auto text-left">
                                        <thead>
                                            <tr>
                                                {TABLE_HEAD.map(({ head }) => (
                                                    <th
                                                        key={head}
                                                        className="border-b bg-[#175D5F] text-white h-[60px] p-4"
                                                    >
                                                        <Skeleton height={20} />
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...Array(perPage)].map((_, i) => (
                                                <SkeletonTableRow key={i} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </SkeletonTheme>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="text-red-600 font-medium">Error</div>
                        <p className="text-red-600 mt-1">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading &&
                    !error &&
                    getFilteredWorkOrderGroups().length === 0 &&
                    workOrderGroups.length > 0 && (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                No work orders found
                            </h3>
                            <p className="mt-2 text-gray-600">
                                {hasActiveFilters()
                                    ? "No work orders match your current filters."
                                    : "You have no work orders assigned to you."}
                            </p>
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                >
                                    <MdClear className="mr-2" />
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}

                {/* No Data State */}
                {!loading && !error && workOrderGroups.length === 0 && (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No work orders found
                        </h3>
                        <p className="mt-2 text-gray-600">
                            You have no work orders assigned to you.
                        </p>
                    </div>
                )}

                {/* Content */}
                {getFilteredWorkOrderGroups().length > 0 && (
                    <>
                        {viewMode === "grid"
                            ? renderGridView()
                            : renderTableView()}

                        {renderPagination()}
                    </>
                )}

                <ProcessWorkOrderModal
                    isOpen={isProcessModalOpen}
                    onClose={handleCloseProcessModal}
                    workOrder={selectedWorkOrder}
                />
                <WorkOrderGroupDetailsModal
                    isOpen={isGroupDetailsModalOpen}
                    onClose={handleCloseGroupDetailsModal}
                    group={groupDetailsData}
                    onAddFiles={handleAddFilesFromDetails}
                    isLoading={isGroupDetailsLoading}
                    getStatusBadge={getStatusBadge}
                />
                {isAddFilesModalOpen &&
                    selectedAccountId &&
                    selectedWorkOrderData && (
                        <AddFilesModal
                            selectedAccountId={selectedAccountId}
                            onClose={() => setIsAddFilesModalOpen(false)}
                            selectedWorkOrder={selectedStepName}
                            workOrderData={selectedWorkOrderData}
                        />
                    )}
            </div>
        </div>
    );
};

export default MyWorkOrders;
