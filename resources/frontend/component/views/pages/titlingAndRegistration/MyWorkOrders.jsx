import React, { useState, useEffect } from "react";
import apiService from "../../../servicesApi/apiService";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card, CardFooter, Typography } from "@material-tailwind/react";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const MyWorkOrders = () => {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [totalWorkOrders, setTotalWorkOrders] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [viewMode, setViewMode] = useState("table");

    useEffect(() => {
        const fetchWorkOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.get("/my-workorders", {
                    params: {
                        page: currentPage,
                        per_page: perPage,
                        status: statusFilter,
                        sortBy: sortBy,
                        sortOrder: sortOrder,
                    },
                });
                console.log("Response:", response.data);
                setWorkOrders(response.data.data);
                setTotalWorkOrders(response.data.total);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching work orders:", err);
                setError("Failed to fetch work orders. Please try again.");
                setLoading(false);
            }
        };

        fetchWorkOrders();
    }, [currentPage, perPage, statusFilter, sortBy, sortOrder]);

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

    const handleWorkOnOrder = (workOrderId) => {
        // Navigate to work order details/work page
        // Replace with your actual navigation logic
        console.log("Working on order:", workOrderId);
        // Example: navigate(`/work-orders/${workOrderId}/work`);
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

    const renderGridView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {workOrders.map((order) => (
                <div
                    key={order.work_order_id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150 flex flex-col h-[280px]"
                >
                    {/* Header */}
                    <div
                        className={`px-3 py-2 border-b border-gray-100 rounded-t-xl ${getHeaderBackgroundColor(
                            order.status
                        )}`}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">
                                WO #{order.work_order_id}
                            </h3>
                            <div className="flex items-center space-x-1">
                                {getStatusBadge(order.status)}
                                {getPriorityBadge(order.priority)}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-3 py-2 text-xs flex-1 text-gray-700 space-y-1">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            <InfoItem
                                label="Type"
                                value={order.work_order_type?.type_name}
                            />
                            <InfoItem
                                label="Created By"
                                value={order.created_by?.fullname}
                            />
                            <InfoItem
                                label="Assignee"
                                value={order.assignee?.fullname}
                            />

                            <InfoItem
                                label="Deadline"
                                value={
                                    <span
                                        className={`${
                                            isOverdue(order.work_order_deadline)
                                                ? "text-red-600 font-medium"
                                                : "text-gray-800"
                                        }`}
                                    >
                                        {formatDate(order.work_order_deadline)}
                                        {isOverdue(order.work_order_deadline) &&
                                            " (Overdue)"}
                                    </span>
                                }
                            />
                            <InfoItem
                                label="Accounts"
                                value={
                                    order.accounts?.length
                                        ? order.accounts
                                              .map((acc) => acc.account_name)
                                              .join(", ")
                                        : "N/A"
                                }
                                className="col-span-2"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                        <div className="flex justify-end">
                            {canWorkOnOrder(order.status) && (
                                <button
                                    onClick={() =>
                                        handleWorkOnOrder(order.work_order_id)
                                    }
                                    className="px-2.5 py-1 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                                >
                                    Process
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Compact InfoItem component
    const InfoItem = ({ label, value, className = "" }) => (
        <div className={className}>
            <span className="block text-[11px] text-gray-500 font-medium">
                {label}:
            </span>
            <p className="mt-0.5 text-[13px] text-gray-800 truncate">
                {value || "N/A"}
            </p>
        </div>
    );

    const renderTableView = () => (
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
                                    <Typography
                                        variant="small"
                                        className="!font-semibold text-white leading-none"
                                    >
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {workOrders.map((order) => (
                            <tr
                                key={order.work_order_id}
                                className="hover:bg-gray-50"
                            >
                                <td className="p-4 border-b border-gray-300">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-bold"
                                    >
                                        WO #{order.work_order_id}
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal opacity-70"
                                    >
                                        {order.description || "No description"}
                                    </Typography>
                                </td>
                                <td className="p-4 border-b border-gray-300">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {order.work_order_type?.type_name ||
                                            "N/A"}
                                    </Typography>
                                </td>
                                <td className="p-4 border-b border-gray-300">
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="p-4 border-b border-gray-300">
                                    {getPriorityBadge(order.priority)}
                                </td>
                                <td className="p-4 border-b border-gray-300">
                                    <Typography
                                        variant="small"
                                        className={`font-normal ${
                                            isOverdue(order.work_order_deadline)
                                                ? "text-red-600 font-semibold"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        {formatDate(order.work_order_deadline)}
                                    </Typography>
                                </td>
                                <td className="p-4 border-b border-gray-300">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {order.created_by?.fullname || "N/A"}
                                    </Typography>
                                </td>
                                <td className="p-4 border-b border-gray-300 text-right">
                                    {canWorkOnOrder(order.status) && (
                                        <button
                                            onClick={() =>
                                                handleWorkOnOrder(
                                                    order.work_order_id
                                                )
                                            }
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Process
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );

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

    const showDevOverlay = false;

    return (
        <div className="min-h-screen bg-gray-50">
            {showDevOverlay && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-black/40 via-black/50 to-black/60 backdrop-blur-sm rounded-lg">
                    <div className="relative bg-white rounded-2xl shadow-2xl px-10 py-8 text-center max-w-md mx-4 transform transition-all duration-300 hover:scale-105">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r gradient-btn5 rounded-full blur-lg opacity-30 animate-pulse"></div>
                                <div className="relative bg-gradient-to-r gradient-btn5 p-3 rounded-full">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                            Under Development
                        </h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            This section is currently under development.
                        </p>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div
                                className="bg-gradient-to-r gradient-btn5 h-2 rounded-full animate-pulse transition-all duration-1000"
                                style={{ width: "30%" }}
                            ></div>
                        </div>

                        {/* Status text */}
                        <p className="text-sm text-gray-500">30% Complete</p>

                        {/* Subtle border glow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-sm -z-10"></div>
                    </div>
                </div>
            )}
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

                {/* Filters */}
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label
                                htmlFor="statusFilter"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Filter by Status
                            </label>
                            <select
                                id="statusFilter"
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Complete">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="sortOrder"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Sort By
                            </label>
                            <select
                                id="sortOrder"
                                value={`${sortBy}:${sortOrder}`}
                                onChange={handleSortChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="created_at:desc">
                                    Created At (Newest First)
                                </option>
                                <option value="created_at:asc">
                                    Created At (Oldest First)
                                </option>
                                <option value="work_order_deadline:asc">
                                    Deadline (Soonest First)
                                </option>
                                <option value="work_order_deadline:desc">
                                    Deadline (Latest First)
                                </option>
                                <option value="priority:desc">
                                    Priority (High to Low)
                                </option>
                                <option value="priority:asc">
                                    Priority (Low to High)
                                </option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">
                                    {totalWorkOrders}
                                </span>{" "}
                                total work orders
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && workOrders.length === 0 && (
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
                {!loading && !error && workOrders.length === 0 && (
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
                            {statusFilter
                                ? "No work orders match your current filter."
                                : "You have no work orders assigned to you."}
                        </p>
                    </div>
                )}

                {/* Content */}
                {workOrders.length > 0 && (
                    <>
                        {viewMode === "grid"
                            ? renderGridView()
                            : renderTableView()}

                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyWorkOrders;
