import React, { useState, useEffect, useContext } from "react";
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
import { useStateContext } from "../../../../context/contextprovider";
import { useMyWorkOrdersContext } from "../../../../context/MyWorkOrdersContext";

const RefreshIcon = ({ onClick, isRefreshing }) => (
    <svg
        onClick={isRefreshing ? undefined : onClick}
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        className={`size-5 text-gray-600 hover:text-gray-800 cursor-pointer ${
            isRefreshing ? "animate-spin" : ""
        }`}
        style={{ transition: "color 0.2s" }}
        xmlns="http://www.w3.org/2000/svg"
        title="Refresh"
    >
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
    </svg>
);

import { MyWorkOrdersProvider } from "../../../../context/MyWorkOrdersContext";

const MyWorkOrdersContent = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Use new MyWorkOrdersContext for all work order state and fetchers
    const {
        workOrderGroups,
        setWorkOrderGroups,
        workOrdersLoading,
        setWorkOrdersLoading,
        workOrdersError,
        setWorkOrdersError,
        workOrdersCurrentPage,
        setWorkOrdersCurrentPage,
        workOrdersPerPage,
        setWorkOrdersPerPage,
        workOrdersTotal,
        setWorkOrdersTotal,
        workOrdersSortBy,
        setWorkOrdersSortBy,
        workOrdersSortOrder,
        setWorkOrdersSortOrder,
        fetchWorkOrderGroups,
        forceRefreshWorkOrders,
        workOrderGroupsLastFetched,
    } = useMyWorkOrdersContext();
    const handleRefresh = async () => {
        setIsRefreshing(true);
        setWorkOrderGroups([]); // Clear old data to prevent flicker/overlap
        await forceRefreshWorkOrders();
        setIsRefreshing(false);
    };
    const { user } = useStateContext(); // Get current user from context
    const [statusFilter, setStatusFilter] = useState("");
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
    // No local hasLoadedMyWorkOrders; rely on context state

    // Filter states
    const [workOrderNoFilter, setWorkOrderNoFilter] = useState("");
    const [projectFilter, setProjectFilter] = useState("");
    const [dueDateFilter, setDueDateFilter] = useState("");
    const [lastUpdatedFilter, setLastUpdatedFilter] = useState("");

    // Only fetch if not already loaded or stale (10 min), otherwise use cached
    useEffect(() => {
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        if (
            !workOrderGroupsLastFetched ||
            !Array.isArray(workOrderGroups) ||
            workOrderGroups.length === 0 ||
            now - workOrderGroupsLastFetched > tenMinutes
        ) {
            fetchWorkOrderGroups();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchWorkOrderGroups, workOrderGroups, workOrderGroupsLastFetched]);

    // If you want to force refresh on sort change, uncomment below:
    // useEffect(() => {
    //     fetchWorkOrderGroups(true);
    // }, [workOrdersSortBy, workOrdersSortOrder, fetchWorkOrderGroups]);

    const handlePageChange = (newPage) => {
        setWorkOrdersCurrentPage(newPage);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setWorkOrdersCurrentPage(1);
    };

    const handleSortChange = (e) => {
        const [newSortBy, newSortOrder] = e.target.value.split(":");
        setWorkOrdersSortBy(newSortBy);
        setWorkOrdersSortOrder(newSortOrder);
        setWorkOrdersCurrentPage(1);
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
        setWorkOrdersSortBy("created_at");
        setWorkOrdersSortOrder("desc");
        setWorkOrdersCurrentPage(1);
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

    // Client-side filtering function: only show groups assigned to the current user
    const getFilteredWorkOrderGroups = () => {
        // Ensure workOrderGroups is always an array
        const safeWorkOrderGroups = Array.isArray(workOrderGroups)
            ? workOrderGroups
            : [];

        // FIRST: Filter to only show groups where the current user has assigned work orders
        const userFilteredGroups = safeWorkOrderGroups.filter((group) => {
            // Check if any work order in this group is assigned to the current user
            const hasAssignedWorkOrder = (group.work_orders || []).some(
                (wo) => {
                    // Check if assignee_ids array includes the current user's ID
                    if (Array.isArray(wo.assignee_ids) && user?.id) {
                        return wo.assignee_ids.includes(user.id);
                    }
                    return false;
                }
            );

            return hasAssignedWorkOrder;
        });

        // Start with user-filtered groups - NO FALLBACK
        let filtered = [...userFilteredGroups];

        // Filter by work order number (work order group id)
        if (workOrderNoFilter) {
            filtered = filtered.filter((group) => {
                return (
                    (group.work_orders || []).some(
                        (wo) =>
                            String(wo.work_order_group_id || "")
                                .toLowerCase()
                                .includes(workOrderNoFilter.toLowerCase()) ||
                            String(wo.work_order_group_id || "")
                                .padStart(7, "0")
                                .toLowerCase()
                                .includes(workOrderNoFilter.toLowerCase())
                    ) ||
                    String(group.id)
                        .toLowerCase()
                        .includes(workOrderNoFilter.toLowerCase()) ||
                    String(group.id)
                        .padStart(7, "0")
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
                    (acc.property_name || "")
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
                    .sort(
                        (wo1, wo2) =>
                            new Date(wo2.updated_at) - new Date(wo1.updated_at)
                    )[0];
            };

            const latestWO_A = getLatestWO(a);
            const latestWO_B = getLatestWO(b);

            let comparison = 0;

            switch (workOrdersSortBy) {
                case "created_at":
                    const createdA = latestWO_A?.created_at
                        ? new Date(latestWO_A.created_at)
                        : new Date(0);
                    const createdB = latestWO_B?.created_at
                        ? new Date(latestWO_B.created_at)
                        : new Date(0);
                    comparison = createdA - createdB;
                    break;

                case "updated_at":
                    const updatedA = latestWO_A?.updated_at
                        ? new Date(latestWO_A.updated_at)
                        : new Date(0);
                    const updatedB = latestWO_B?.updated_at
                        ? new Date(latestWO_B.updated_at)
                        : new Date(0);
                    comparison = updatedA - updatedB;
                    break;

                case "work_order_deadline":
                    const deadlineA = latestWO_A?.work_order_deadline
                        ? new Date(latestWO_A.work_order_deadline)
                        : new Date(0);
                    const deadlineB = latestWO_B?.work_order_deadline
                        ? new Date(latestWO_B.work_order_deadline)
                        : new Date(0);
                    comparison = deadlineA - deadlineB;
                    break;

                default:
                    // Default to created_at
                    const defaultCreatedA = latestWO_A?.created_at
                        ? new Date(latestWO_A.created_at)
                        : new Date(0);
                    const defaultCreatedB = latestWO_B?.created_at
                        ? new Date(latestWO_B.created_at)
                        : new Date(0);
                    comparison = defaultCreatedA - defaultCreatedB;
                    break;
            }

            // Apply sort order (asc or desc)
            return workOrdersSortOrder === "desc" ? -comparison : comparison;
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
        } catch (err) {
            console.error("Error fetching group details:", err);
        } finally {
            setIsGroupDetailsLoading(false);
        }
    };

    // Create a refresh function for group details
    const refreshGroupDetails = async () => {
        if (groupDetailsData && groupDetailsData.id) {
            setIsGroupDetailsLoading(true);
            try {
                const response = await apiService.get(
                    `/work-order-groups/${groupDetailsData.id}/details`
                );
                setGroupDetailsData(response.data);
            } catch (err) {
                console.error("Error refreshing group details:", err);
            } finally {
                setIsGroupDetailsLoading(false);
            }
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
        // Don't close the group details modal - keep the ChecklistTable visible
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
        const d = new Date(dateString);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const year = d.getFullYear();
        return `${month}/${day}/${year}`;
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

        // Pagination logic
        const rowsPerPage = workOrdersPerPage || 10;
        const currentPage = workOrdersCurrentPage || 1;
        const totalPages = Math.max(
            1,
            Math.ceil(filteredGroups.length / rowsPerPage)
        );
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const currentData = filteredGroups.slice(startIndex, endIndex);

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
                        {currentData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="px-6 py-12 text-center text-gray-500"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <svg
                                            className="w-12 h-12 text-gray-300 mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <p className="text-lg font-medium text-gray-400">
                                            No work orders found on this page
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Try a different page or adjust your
                                            filters
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentData.map((group, idx) => {
                                // Use group.updated_at (group-level) for 'Last Updated' column
                                const groupLastUpdated =
                                    group.updated_at || null;
                                // Find the latest work order in the group (by updated_at or sequence)
                                const latestWO = (group.work_orders || [])
                                    .slice()
                                    .sort(
                                        (a, b) =>
                                            new Date(b.updated_at) -
                                            new Date(a.updated_at)
                                    )[0];

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
                                        >
                                            <td className="px-3 py-2 font-bold text-base text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-70"></div>
                                                    <span className="font-mono tracking-wide">
                                                        {String(
                                                            group.id
                                                        ).padStart(7)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="font-medium">
                                                        {latestWO?.accounts &&
                                                        latestWO.accounts
                                                            .length > 0
                                                            ? latestWO.accounts
                                                                  .map(
                                                                      (acc) =>
                                                                          acc.property_name ||
                                                                          "No Project"
                                                                  )
                                                                  .filter(
                                                                      (
                                                                          v,
                                                                          i,
                                                                          a
                                                                      ) =>
                                                                          a.indexOf(
                                                                              v
                                                                          ) ===
                                                                          i
                                                                  )
                                                                  .join(", ")
                                                            : "No Project"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                    <span className="font-medium">
                                                        {group.due_date
                                                            ? formatDate(
                                                                  group.due_date
                                                              )
                                                            : "-"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    <span className="font-medium">
                                                        {group.updated_at
                                                            ? formatDate(
                                                                  group.updated_at
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
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
                {/* Pagination Footer */}
                <div className="flex items-center justify-between border-t border-blue-gray-50 p-4 mt-4">
                    <span className="font-normal text-sm text-blue-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <ReactPaginate
                        previousLabel={
                            <span className="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen">
                                &#60;
                            </span>
                        }
                        nextLabel={
                            <span className="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen">
                                &#62;
                            </span>
                        }
                        breakLabel={"..."}
                        pageCount={totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={2}
                        onPageChange={(data) =>
                            setWorkOrdersCurrentPage(data.selected + 1)
                        }
                        containerClassName={"flex gap-2"}
                        previousClassName=""
                        nextClassName=""
                        pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                        activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-white rounded-[4px] text-[12px]"
                        pageLinkClassName="w-full h-full flex justify-center items-center"
                        activeLinkClassName="w-full h-full flex justify-center items-center"
                        disabledLinkClassName="text-gray-300 cursor-not-allowed"
                        forcePage={currentPage - 1}
                    />
                </div>
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
                Page {workOrdersCurrentPage} of{" "}
                {Math.ceil(workOrdersTotal / workOrdersPerPage)}
            </Typography>
            <ReactPaginate
                previousLabel={
                    <MdKeyboardArrowLeft className="text-[#404B52]" />
                }
                nextLabel={<MdKeyboardArrowRight className="text-[#404B52]" />}
                breakLabel={"..."}
                pageCount={Math.ceil(workOrdersTotal / workOrdersPerPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={2}
                onPageChange={(data) => {
                    setWorkOrdersCurrentPage(data.selected + 1);
                }}
                containerClassName={"flex gap-2"}
                previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-white rounded-[4px] text-[12px]"
                pageLinkClassName="w-full h-full flex justify-center items-center"
                activeLinkClassName="w-full h-full flex justify-center items-center"
                disabledLinkClassName="text-gray-300 cursor-not-allowed"
                forcePage={workOrdersCurrentPage - 1}
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
                    </div>
                </div>

                {/* Enhanced Inline Filters */}
                <div className="bg-gradient-to-r from-white to-blue-50/30 rounded-xl shadow-sm border border-gray-200/60 mb-4 p-2.5">
                    <div className="flex items-center gap-1.5 text-sm flex-wrap relative">
                        {/* Work Order No Filter */}
                        <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0">
                            <MdSearch className="text-gray-400 text-sm" />
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                WO:
                            </label>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={workOrderNoFilter}
                                onChange={handleWorkOrderNoFilterChange}
                                className="w-16 text-xs border-none outline-none bg-transparent placeholder-gray-400"
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
                        <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                Project:
                            </label>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={projectFilter}
                                onChange={handleProjectFilterChange}
                                className="w-16 text-xs border-none outline-none bg-transparent placeholder-gray-400"
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
                        <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                Status:
                            </label>
                            <select
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                className="text-xs border-none outline-none bg-transparent cursor-pointer"
                            >
                                <option value="">All</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Complete">Complete</option>
                            </select>
                        </div>

                        {/* Due Date Filter */}
                        <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                Due:
                            </label>
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
                        <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                Updated:
                            </label>
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
                        <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0">
                            <MdKeyboardArrowDown className="text-gray-400 text-sm" />
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                Sort:
                            </label>
                            <select
                                value={`${workOrdersSortBy}:${workOrdersSortOrder}`}
                                onChange={handleSortChange}
                                className="text-xs border-none outline-none bg-transparent cursor-pointer"
                            >
                                <option value="created_at:desc">
                                    Newest First
                                </option>
                                <option value="created_at:asc">
                                    Oldest First
                                </option>
                                <option value="work_order_deadline:asc">
                                    Due Soon
                                </option>
                                <option value="work_order_deadline:desc">
                                    Due Later
                                </option>
                                <option value="updated_at:desc">
                                    Recently Updated
                                </option>
                                <option value="updated_at:asc">
                                    Least Recent
                                </option>
                            </select>
                        </div>
                        <RefreshIcon
                            onClick={handleRefresh}
                            isRefreshing={isRefreshing}
                        />
                        {/* Clear Filter Action */}
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
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {workOrdersLoading && (
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
                                            {[...Array(workOrdersPerPage)].map(
                                                (_, i) => (
                                                    <SkeletonTableRow key={i} />
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </SkeletonTheme>
                )}

                {/* Error State */}
                {workOrdersError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="text-red-600 font-medium">Error</div>
                        <p className="text-red-600 mt-1">{workOrdersError}</p>
                    </div>
                )}

                {/* Empty State */}
                {!workOrdersLoading &&
                    !workOrdersError &&
                    getFilteredWorkOrderGroups().length === 0 &&
                    (workOrderGroups || []).length > 0 && (
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
                {!workOrdersLoading &&
                    !workOrdersError &&
                    (workOrderGroups || []).length === 0 && (
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
                {!workOrdersLoading &&
                    getFilteredWorkOrderGroups().length > 0 && (
                        <>
                            {viewMode === "grid"
                                ? renderGridView()
                                : renderTableView()}
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
                    showChecklistTable={true}
                    currentUserId={user?.id}
                    onRefresh={refreshGroupDetails}
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

const MyWorkOrders = (props) => (
    <MyWorkOrdersProvider>
        <MyWorkOrdersContent {...props} />
    </MyWorkOrdersProvider>
);

export default MyWorkOrders;
