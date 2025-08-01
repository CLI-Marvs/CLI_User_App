import React, { useState, useRef, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
    Card,
    CardFooter,
    Typography,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Button,
} from "@material-tailwind/react";
import FilterIcon from "../../../../../../public/Images/filterIcon.svg";
import File from "../../../../../../public/Images/fileIcon.svg";
import { motion, AnimatePresence } from "framer-motion";
import View from "../../../../../../public/Images/view.svg";
import Edit from "../../../../../../public/Images/Subtract.svg";
import Delete from "../../../../../../public/Images/Trash_light.svg";
import Profile from "../../../../../../public/Images/Profile.svg";
import { useDocumentManagementContext } from "../../../../context/DocumentManagement/DocumentManagementContext";
import CreateWorkOrderModal from "../../../layout/documentManagementPage/CreateWorkOrders";
import apiService from "../../../../component/servicesApi/apiService";
import EditWorkOrderModal from "../../../layout/documentManagementPage/EditWorkOrderModal";
import WorkOrderDeletionModal from "../../../layout/documentManagementPage/WorkOrderDeletionModal";
import WorkOrderGroupDetailsModal from "../../../layout/documentManagementPage/WorkOrderGroupDetailsModal";

const TABLE_HEAD = [
    { head: "Work Order Group" },
    { head: "Status" },
    { head: "Date Created" },
    { head: "Due Date" },
    { head: "Actions" },
];

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
    >
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
    </svg>
);

const FileIcon = () => {
    return <img src={File} className="size-5" />;
};

const EditIcon = () => {
    return <img src={Edit} className="size-5" />;
};

const DeleteIcon = () => {
    return <img src={Delete} className="size-6" />;
};

const ProfileIcon = () => {
    return <img src={Profile} className="size-4" />;
};

const WorkOrderView = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [workOrderFilterOption, setWorkOrderFilterOption] = useState("All");
    const workOrderFilterOptions = [
        { label: "All", value: "all" },
        { label: "In Progress", value: "Pending" },
        { label: "Complete", value: "complete" },
    ];
    const [tableRows, setTableRows] = useState([]);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const dropdownRef = useRef(null);
    const [filterAssignee, setFilterAssignee] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedWorkOrderForView, setSelectedWorkOrderForView] =
        useState(null);
    const toggleFilterBox = () => setIsFilterVisible((prev) => !prev);
    const [tableRowsData, setTableRowsData] = useState([]);
    // Use DocumentManagementContext for work order functionality
    const {
        workOrderGroups,
        fetchWorkOrderGroups,
        workOrders,
        fetchWorkOrders,
        workOrdersLoading,
    } = useDocumentManagementContext();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedWorkOrderForEdit, setSelectedWorkOrderForEdit] =
        useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedWorkOrderForDelete, setSelectedWorkOrderForDelete] =
        useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] =
        useState(false);
    const [selectedGroupForDetails, setSelectedGroupForDetails] =
        useState(null);
    const [groupDetailsData, setGroupDetailsData] = useState(null);
    const [isGroupDetailsLoading, setIsGroupDetailsLoading] = useState(false);

    useEffect(() => {
        fetchWorkOrderGroups();
    }, [fetchWorkOrderGroups]);

    useEffect(() => {
        // Handle different possible data structures
        let processedData = [];

        if (Array.isArray(workOrderGroups)) {
            processedData = workOrderGroups;
        } else if (
            workOrderGroups &&
            workOrderGroups.data &&
            Array.isArray(workOrderGroups.data)
        ) {
            processedData = workOrderGroups.data;
        } else if (workOrderGroups && typeof workOrderGroups === "object") {
            // If it's an object, try to extract array data
            const keys = Object.keys(workOrderGroups);
            if (keys.length > 0) {
                // Try common data property names
                if (workOrderGroups.groups)
                    processedData = workOrderGroups.groups;
                else if (workOrderGroups.workOrderGroups)
                    processedData = workOrderGroups.workOrderGroups;
                else processedData = Object.values(workOrderGroups);
            }
        }

        setTableRowsData(processedData);
    }, [workOrderGroups]);

    const handleRefreshAndClearFilters = async () => {
        setIsRefreshing(true);
        setSearchQuery("");
        setFilterAssignee("");
        setFilterStatus("");
        setWorkOrderFilterOption("All");
        setIsFilterVisible(false);
        setCurrentPage(1);
        try {
            await fetchWorkOrderGroups();
        } finally {
            setTimeout(() => setIsRefreshing(false), 600);
        }
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsFilterVisible(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    // Filter groups based on search and filter criteria
    const filteredGroups = (
        Array.isArray(tableRowsData) ? tableRowsData : []
    ).filter((group) => {
        const groupIdString = String(group.id || "");

        const searchMatch =
            searchQuery === "" ||
            groupIdString.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (group.work_orders || []).some((wo) =>
                (wo.work_order || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );

        const statusFilterMatch =
            workOrderFilterOption === "All" ||
            (group.status || "").toLowerCase().replace(/\s+/g, "_") ===
                workOrderFilterOption.toLowerCase().replace(/\s+/g, "_");

        return searchMatch && statusFilterMatch;
    });

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = filteredGroups.slice(startIndex, endIndex);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredGroups.length / rowsPerPage)
    );

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleApplyFiltersFromDropdown = () => {
        setIsFilterVisible(false);
        setCurrentPage(1);
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        fetchWorkOrderGroups();
    };

    const handleCreateWorkOrder = () => {
        console.log("New Work Order to be created:");
    };

    const handleOpenViewModal = (workOrderGroup) => {
        // Get the first work order from the group for the view modal
        const firstWorkOrder = workOrderGroup.work_orders?.[0];
        setSelectedWorkOrderForView(firstWorkOrder);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedWorkOrderForView(null);
    };

    const handleSoftDeleteWorkOrder = async (workOrderId, reason) => {
        setIsDeleting(true);
        try {
            await apiService.patch(`/work-orders/${workOrderId}/soft-delete`);
            fetchWorkOrderGroups();
        } catch (error) {
            console.error("Failed to soft delete work order:", error);
            alert(
                `Failed to delete work order: ${
                    error.message || "Please try again."
                }`
            );
            throw error;
        } finally {
            setIsDeleting(false);
        }
    };

    // Soft delete entire work order group
    const handleSoftDeleteWorkOrderGroup = async (groupId, reason) => {
        setIsDeleting(true);
        try {
            await apiService.patch(
                `/work-orders/work-order-groups/${groupId}/soft-delete`,
                {
                    reason,
                }
            );
            fetchWorkOrderGroups();
        } catch (error) {
            console.error("Failed to soft delete work order group:", error);
            alert(
                `Failed to delete work order group: ${
                    error.message || "Please try again."
                }`
            );
            throw error;
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenDeleteModal = (groupData) => {
        setSelectedWorkOrderForDelete(groupData);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedWorkOrderForDelete(null);
    };

    const confirmDeleteHandler = async (reason) => {
        if (selectedWorkOrderForDelete) {
            try {
                await handleSoftDeleteWorkOrderGroup(
                    selectedWorkOrderForDelete.id,
                    reason
                );
            } catch (error) {
                console.log(
                    "confirmDeleteHandler: Deletion API call failed. Modal will not show confirmation."
                );
            }
        }
    };

    // Handlers for WorkOrderGroupDetailsModal
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

    const handleCloseGroupDetailsModal = () => {
        setIsGroupDetailsModalOpen(false);
        setGroupDetailsData(null);
        setSelectedGroupForDetails(null);
    };

    // Helper function for status badge (required by WorkOrderGroupDetailsModal)
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

    // Placeholder function for adding files (required by WorkOrderGroupDetailsModal)
    const handleAddFiles = (accountId, workOrder, stepName) => {
        handleCloseGroupDetailsModal();
    };

    return (
        <div className="w-[calc(100%-20px)] mx-1 pt-1">
            <div className="relative flex items-center gap-1.5 mb-2 w-full">
                <div className="flex-shrink-0">
                    <Menu>
                        <MenuHandler>
                            <Button
                                variant="text"
                                size="sm"
                                className="bg-[#EFEFEF] text-gray-700 text-sm rounded-[10px] flex items-center justify-between gap-1 px-4 h-[47px] w-[100px] min-w-[120px] max-w-[150px] font-normal shadow-none border-none hover:bg-custom-grayF1 focus:bg-custom-grayF1 active:bg-custom-grayF1 transition-none"
                                style={{
                                    transition: "none",
                                    boxShadow: "none",
                                    border: "none",
                                }}
                            >
                                <span className="truncate text-left flex-1 normal-case">
                                    {workOrderFilterOption}
                                </span>
                                <svg
                                    className="w-4 h-4 flex-shrink-0 text-gray-500"
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
                            </Button>
                        </MenuHandler>
                        <MenuList className="z-50 flex flex-col justify-center min-h-[120px] min-w-[100px]">
                            {workOrderFilterOptions.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    onClick={() => {
                                        setWorkOrderFilterOption(option.label);
                                        setCurrentPage(1);
                                    }}
                                    className={`flex items-center justify-center h-9 w-full p-4 ${
                                        workOrderFilterOption === option.label
                                            ? "bg-custom-lightestgreen text-gray-900"
                                            : "text-gray-700"
                                    }`}
                                    style={{ fontWeight: "normal" }}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                </div>

                <div className="relative flex-1">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                    </svg>

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="h-[47px] w-full bg-custom-grayF1 rounded-[10px] pl-9 pr-20 text-sm"
                        placeholder="Search Work Order Group, ID"
                    />

                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <RefreshIcon
                            onClick={handleRefreshAndClearFilters}
                            isRefreshing={isRefreshing}
                        />
                    </div>
                    <AnimatePresence>
                        {isFilterVisible && (
                            <motion.div
                                ref={dropdownRef}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-[110%] left-0 mt-1 p-4 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-full max-w-sm"
                            >
                                <Typography
                                    variant="h6"
                                    color="blue-gray"
                                    className="mb-3 text-center"
                                >
                                    Filter Work Orders
                                </Typography>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label
                                            htmlFor="filterStatus"
                                            className="text-sm font-medium text-gray-700 block mb-1"
                                        >
                                            Status
                                        </label>
                                        <select
                                            id="filterStatus"
                                            value={filterStatus}
                                            onChange={(e) =>
                                                setFilterStatus(e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-custom-bluegreen focus:border-custom-bluegreen"
                                        >
                                            <option value="">
                                                All Statuses
                                            </option>
                                            <option value="Pending">
                                                In Progress
                                            </option>
                                            <option value="Complete">
                                                Complete
                                            </option>
                                        </select>
                                    </div>
                                    <Button
                                        onClick={handleApplyFiltersFromDropdown}
                                        size="sm"
                                        className="mt-2 gradient-btn w-full"
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                    <button
                        onClick={handleOpenCreateModal}
                        className="h-[47px] w-[190px] gradient-btn5 font-semibold text-white text-sm rounded-[10px] flex items-center justify-center gap-2"
                    >
                        <FileIcon />
                        Create Work Orders
                    </button>
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateWorkOrderModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseCreateModal}
                    onCreateWorkOrder={handleCreateWorkOrder}
                />
            )}

            {selectedWorkOrderForDelete && (
                <WorkOrderDeletionModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onSubmit={confirmDeleteHandler}
                    workOrderName={
                        selectedWorkOrderForDelete.work_order ||
                        selectedWorkOrderForDelete.workOrder
                    }
                    isDeleting={isDeleting}
                    workOrderDetails={selectedWorkOrderForDelete}
                />
            )}

            <Card className="w-full overflow-hidden rounded-md border-0 bg-white backdrop-blur-sm">
                <table className="w-full table-fixed bg-white rounded-md shadow-inner">
                    <colgroup>
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "21%" }} />
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
                                        Status
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
                                        Date Created
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
                                        Due Date
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
                        {!workOrdersLoading && currentData.length === 0 ? (
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
                                            No work orders found
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Create a new work order to get
                                            started
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentData
                                .filter(
                                    (group) =>
                                        group &&
                                        typeof group === "object" &&
                                        group.id !== undefined &&
                                        group.id !== null
                                )
                                .map((group, idx) => (
                                    <React.Fragment key={group.id}>
                                        {/* Main Group Row */}
                                        <tr
                                            className={`transition-all duration-200 ease-in-out ${
                                                idx % 2 === 0
                                                    ? "bg-gradient-to-r from-slate-50 to-gray-50"
                                                    : "bg-white"
                                            } hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group cursor-pointer`}
                                            onClick={() =>
                                                handleOpenGroupDetailsModal(
                                                    group
                                                )
                                            }
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
                                                    <span
                                                        className={`font-medium px-2 py-1 rounded-full text-xs ${
                                                            group.status ===
                                                            "Complete"
                                                                ? "bg-green-100 text-green-800"
                                                                : group.status ===
                                                                  "In Progress"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : group.status ===
                                                                  "Overdue"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {group.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                    <span className="font-medium">
                                                        {group.created_at
                                                            ? new Date(
                                                                  group.created_at
                                                              )
                                                                  .toISOString()
                                                                  .slice(0, 10)
                                                            : "-"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    {(() => {
                                                        return (
                                                            <span className="font-medium">
                                                                {group.due_date
                                                                    ? typeof group.due_date ===
                                                                      "string"
                                                                        ? group.due_date.slice(
                                                                              0,
                                                                              10
                                                                          )
                                                                        : (() => {
                                                                              // Add 1 day to counteract timezone offset
                                                                              const d =
                                                                                  new Date(
                                                                                      group.due_date
                                                                                  );
                                                                              d.setDate(
                                                                                  d.getDate() +
                                                                                      1
                                                                              );
                                                                              const year =
                                                                                  d.getFullYear();
                                                                              const month =
                                                                                  String(
                                                                                      d.getMonth() +
                                                                                          1
                                                                                  ).padStart(
                                                                                      2,
                                                                                      "0"
                                                                                  );
                                                                              const day =
                                                                                  String(
                                                                                      d.getDate()
                                                                                  ).padStart(
                                                                                      2,
                                                                                      "0"
                                                                                  );
                                                                              return `${year}-${month}-${day}`;
                                                                          })()
                                                                    : "-"}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedWorkOrderForEdit(
                                                                group
                                                                    .work_orders?.[0]
                                                            );
                                                            setIsEditModalOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="p-1 text-slate-500 hover:text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 rounded-lg transition-all duration-200"
                                                        title="Edit Work Order"
                                                    >
                                                        <EditIcon />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenDeleteModal(
                                                                group
                                                            );
                                                        }}
                                                        disabled={isDeleting}
                                                        className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete Work Order Group"
                                                    >
                                                        <DeleteIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))
                        )}
                    </tbody>
                </table>

                {isEditModalOpen && selectedWorkOrderForEdit && (
                    <EditWorkOrderModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        workOrder={selectedWorkOrderForEdit}
                        onWorkOrderUpdated={() => {
                            setIsEditModalOpen(false);
                            fetchWorkOrderGroups();
                        }}
                    />
                )}

                <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4 mt-4">
                    <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                    >
                        Page {currentPage} of {totalPages}
                    </Typography>
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
                        onPageChange={(data) =>
                            setCurrentPage(data.selected + 1)
                        }
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
            </Card>

            {/* Delete Confirmation Modal
            {isDeleteModalOpen && selectedWorkOrderForDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this work order?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedWorkOrderForDelete(null);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() =>
                                    confirmDeleteHandler(
                                        selectedWorkOrderForDelete
                                    )
                                }
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Work Order Group Details Modal */}
            {isGroupDetailsModalOpen && (
                <WorkOrderGroupDetailsModal
                    isOpen={isGroupDetailsModalOpen}
                    onClose={handleCloseGroupDetailsModal}
                    group={groupDetailsData}
                    onAddFiles={handleAddFiles}
                    getStatusBadge={getStatusBadge}
                    isLoading={isGroupDetailsLoading}
                    onRefresh={async () => {
                        if (!selectedGroupForDetails && !groupDetailsData?.id)
                            return;
                        setIsGroupDetailsLoading(true);
                        try {
                            const groupId =
                                selectedGroupForDetails?.id ||
                                groupDetailsData.id;
                            const response = await apiService.get(
                                `/work-order-groups/${groupId}/details`
                            );
                            setGroupDetailsData(response.data);
                        } catch (err) {
                            console.error(
                                "Error refreshing group details:",
                                err
                            );
                        } finally {
                            setIsGroupDetailsLoading(false);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default WorkOrderView;
