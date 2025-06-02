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
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import View from "../../../../../../public/Images/view.svg";
import Edit from "../../../../../../public/Images/Subtract.svg";
import Delete from "../../../../../../public/Images/Trash_light.svg";
import Profile from "../../../../../../public/Images/Profile.svg";
import { useStateContext } from "../../../../context/contextprovider";
import CreateWorkOrderModal from "../../../layout/documentManagementPage/CreateWorkOrders";
import ViewWorkOrderModal from "../../../layout/documentManagementPage/ViewWorkOrderModal";
import apiService from "../../../../component/servicesApi/apiService";

const TABLE_HEAD = [
    { head: "Work Order Details" },
    { head: "Assignee" },
    { head: "Status" },
    { head: "Date Created" },
    { head: "Due Date" },
    { head: "Actions" },
];

const FilterSearchIcon = ({ onClick }) => {
    return (
        <img
            src={FilterIcon}
            alt="Filter Icon"
            className="size-5 cursor-pointer"
            onClick={onClick}
        />
    );
};

const RefreshIcon = ({ onClick }) => (
    <svg
        onClick={onClick}
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        className="size-5 text-gray-600 hover:text-gray-800 cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
    </svg>
);

const FileIcon = () => {
    return <img src={File} className="size-5" />;
};

const ViewIcon = () => {
    return <img src={View} className="h-[15px] w-[26.65]" />;
};

const EditIcon = () => {
    return <img src={Edit} className="size-5" />;
};

const DeleteIcon = () => {
    return <img src={Delete} className="size-6" />;
};

const ProfileIcon = () => {
    return <img src={Profile} className="size-6" />;
};

const WorkOrderView = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [workOrderFilterOption, setWorkOrderFilterOption] = useState("All");
    const workOrderFilterOptions = [
        { label: "All", value: "all" },
        { label: "Unassigned", value: "unassigned" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
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
    const { workOrders, fetchWorkOrders } = useStateContext();

    // useEffect(() => {
    //     const fetchWorkOrders = async () => {
    //         try {
    //             const response = await apiService.get(
    //                 "/work-orders/get-work-orders"
    //             );
    //             setTableRows(response.data);
    //         } catch (error) {
    //             console.error("Failed to fetch work orders:", error);
    //         }
    //     };
    //     fetchWorkOrders();
    // }, []);

    useEffect(() => {
        const TABLE_ROWS = async () => {
            if (!workOrders?.data) return;

            const data = workOrders.data.map((row) => ({
                workOrder: row.work_order,
                workOrderId: row.work_order_id,
                assignee: row.assignee?.fullname || "Unassigned",
                status: row.status,
                dateCreated: new Date(row.created_at)
                    .toISOString()
                    .slice(0, 10),
                dueDate: new Date(row.work_order_deadline)
                    .toISOString()
                    .slice(0, 10),
            }));
            setTableRowsData(data);
        };

        TABLE_ROWS();
    }, [workOrders, fetchWorkOrders]);

    const handleRefreshAndClearFilters = () => {
        setSearchQuery("");
        setFilterAssignee("");
        setFilterStatus("");
        setWorkOrderFilterOption("All");
        setIsFilterVisible(false);
        setCurrentPage(1);
        fetchWorkOrders();
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

    const filteredRows = tableRowsData.filter((row) => {
        const workOrderIdString = String(row.workOrderId || "");
        const rowDateCreatedString = row.dateCreated || "";
        const rowDueDateString = row.dueDate || "";

        const searchMatch =
            searchQuery === "" ||
            row.workOrder.toLowerCase().includes(searchQuery.toLowerCase()) ||
            workOrderIdString
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            row.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rowDateCreatedString.includes(searchQuery) ||
            rowDueDateString.includes(searchQuery);

        const menuFilterMatch =
            workOrderFilterOption === "All" ||
            row.status.toLowerCase().replace(/\s+/g, "_") ===
                workOrderFilterOption.toLowerCase().replace(/\s+/g, "_");

        const assigneeFilterMatch =
            filterAssignee === "" ||
            row.assignee.toLowerCase().includes(filterAssignee.toLowerCase());

        const statusFilterMatch =
            filterStatus === "" ||
            row.status.toLowerCase() === filterStatus.toLowerCase();

        return (
            searchMatch &&
            menuFilterMatch &&
            assigneeFilterMatch &&
            statusFilterMatch
        );
    });

    const indexOfLastRow = Math.min(
        currentPage * rowsPerPage,
        filteredRows.length
    );
    const indexOfFirstRow = Math.max(indexOfLastRow - rowsPerPage, 0);

    const currentData = filteredRows.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

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
        fetchWorkOrders();
    };
    const handleCreateWorkOrder = () => {
        console.log("New Work Order to be created:");
    };

    const handleOpenViewModal = (workOrderFromTable) => {
        const fullWorkOrder = workOrders?.data?.find(
            (wo) => wo.work_order_id === workOrderFromTable.workOrderId
        );
        setSelectedWorkOrderForView(fullWorkOrder || workOrderFromTable);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedWorkOrderForView(null);
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
                                <span className="truncate text-left flex-1">
                                    {workOrderFilterOption}
                                </span>
                                <ChevronDownIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
                            </Button>
                        </MenuHandler>
                        <MenuList className="z-50 flex flex-col justify-center min-h-[120px]">
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
                        placeholder="Search Work Order, ID, Assignee"
                    />

                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <FilterSearchIcon onClick={toggleFilterBox} />
                        <RefreshIcon onClick={handleRefreshAndClearFilters} />
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
                                            htmlFor="filterAssignee"
                                            className="text-sm font-medium text-gray-700 block mb-1"
                                        >
                                            Assignee
                                        </label>
                                        <input
                                            id="filterAssignee"
                                            type="text"
                                            value={filterAssignee}
                                            onChange={(e) =>
                                                setFilterAssignee(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter assignee name"
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-custom-bluegreen focus:border-custom-bluegreen"
                                        />
                                    </div>
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
                                            <option value="In Progress">
                                                In Progress
                                            </option>
                                            <option value="Completed">
                                                Completed
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
            {/* View Work Order Modal */}
            <ViewWorkOrderModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                workOrderData={selectedWorkOrderForView}
            />

            <Card className="w-full overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-fixed w-full text-center">
                        <thead>
                            <tr>
                                {TABLE_HEAD.map(({ head }, index) => (
                                    <th
                                        key={index}
                                        className="border-b bg-[#175D5F] text-white h-[60px] px-4"
                                    >
                                        <Typography
                                            variant="small"
                                            className="!font-semibold text-white"
                                        >
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className="hover:bg-gray-100"
                                    >
                                        <td className="p-4 border-b border-gray-300 text-left">
                                            <Typography
                                                variant="small"
                                                className="font-semibold text-[#175D5F] pl-4"
                                            >
                                                {row.workOrder} <br />
                                                <span className="font font-semibold text-[#067AC5] text-[16px]">
                                                    {row.workOrderId}
                                                </span>
                                            </Typography>
                                        </td>
                                        <td className="p-4 border-b border-gray-300">
                                            <div className="flex items-center justify-left gap-2 pl-5">
                                                <ProfileIcon />
                                                <Typography
                                                    variant="small"
                                                    className="font-normal text-base text-[#175D5F]"
                                                >
                                                    {row.assignee}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-gray-300 text-center">
                                            <Typography
                                                variant="small"
                                                className={`font-semibold px-3 py-1 rounded-full inline-block ${
                                                    row.status === "In Progress"
                                                        ? "bg-[#F5F4DC] text-[#175D5F]"
                                                        : "bg-[#175D5F] text-white"
                                                }`}
                                            >
                                                {row.status}
                                            </Typography>
                                        </td>
                                        <td className="p-4 border-b border-gray-300 text-center">
                                            <Typography
                                                variant="small"
                                                className="font-normal text-base text-[#175D5F]"
                                            >
                                                {row.dateCreated}
                                            </Typography>
                                        </td>
                                        <td className="p-4 border-b border-gray-300 text-center">
                                            <Typography
                                                variant="small"
                                                className="font-normal text-base text-[#175D5F]"
                                            >
                                                {row.dueDate}
                                            </Typography>
                                        </td>
                                        <td className="p-4 border-b border-gray-300 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* View Icon */}
                                                <button
                                                    onClick={() =>
                                                        handleOpenViewModal(row)
                                                    }
                                                >
                                                    <ViewIcon />
                                                </button>

                                                {/* Edit Icon */}
                                                <button>
                                                    <EditIcon />
                                                </button>

                                                {/* Delete Icon */}
                                                <button>
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={TABLE_HEAD.length}
                                        className="p-4 text-center text-gray-500"
                                    >
                                        No work orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Card Footer */}
                <CardFooter className="flex items-center justify-end border-t border-blue-gray-50 p-4 gap-2">
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
                            const selectedPage = data.selected + 1;
                            setCurrentPage(selectedPage);
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
            </Card>
        </div>
    );
};

export default WorkOrderView;
