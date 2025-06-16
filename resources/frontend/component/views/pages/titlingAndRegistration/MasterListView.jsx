import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Checkbox,
    Button,
    IconButton,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
} from "@material-tailwind/react";
import { useState, useEffect, useMemo, useRef } from "react";
import TicketSvg from "../../../../../../public/Images/ticket.svg";
import UploadSvg from "../../../../../../public/Images/csv_icon.svg";
import CheckboxSvg from "../../../../../../public/Images/checkbox.svg";
import Checkbox1Svg from "../../../../../../public/Images/CheckBox1.svg";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Filter from "../../../../../../public/Images/filterIcon.svg";
import DateLogo from "../../../../../../public/Images/Date_range.svg";
import DatePicker from "react-datepicker";
import apiService from "../../../../component/servicesApi/apiService";
import { useStateContext } from "../../../../context/contextprovider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "@mui/material";
import TitlingAndRegistrationMonitor from "../../../layout/documentManagementPage/TitlingAndRegistrationMonitor";

const UploadIcon = ({ onClick, className: propClassName }) => ( // Added className prop and corrected typo
    <img
        src={UploadSvg}
        alt="Upload Icon"
        className={propClassName || 'size-4'} // Use provided className or default
        onClick={onClick}
    />
);

const CheckBoxIcon = ({ onClick }) => (
    <img
        src={CheckboxSvg}
        alt="Checkbox Icon"
        className={`size-4 $(className)`}
        onClick={onClick}
    />
);

const CheckBoxIcon1 = ({ onClick }) => (
    <img
        src={Checkbox1Svg}
        alt="Checkbox Icon"
        className={`size-4 $(className)`}
        onClick={onClick}
    />
);

const UserIcon = () => [
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
    </svg>,
];

const Propertyicon = () => [
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
        />
    </svg>,
];

const FinanceIcon = () => [
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
        />
    </svg>,
];

const DateIcon = () => [
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
        />
    </svg>,
];

const ExpiryIcon = () => [
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
    </svg>,
];

const TABLE_HEAD = [
    {
        head: "Account Name",
        icon: <UserIcon />,
    },
    {
        head: "Property Details",
        icon: <Propertyicon />,
    },
    {
        head: "Financing",
        icon: <FinanceIcon />,
    },
    {
        head: "Takeout Date",
        icon: <DateIcon />,
    },
    {
        head: "DOU Expiry",
        icon: <ExpiryIcon />,
    },
];

const financeColorClasses = {
    Cash: "bg-[#5B9BD5] text-white",
    BPI: "bg-[#AD4747] text-white",
    HDMF: "bg-[#FFCC00] text-black",
};

export default function PaginatedTable() {
    const [tableRows, setTableRows] = useState([]);
    const [checkedRows, setCheckedRows] = useState({});
    const [allRowsChecked, setAllRowsChecked] = useState(false);
    const [rowsPerPage] = useState(5);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [selectedContractNo, setSelectedContractNo] = useState("");
    const [selectedAccountName, setSelectedAccountName] = useState("");
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedFinancing, setSelectedFinancing] = useState("");
    const [selectedDateFilter, setSelectedDateFilter] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [activeFilters, setActiveFilters] = useState([]);
    const [masterList, setMasterList] = useState([]);
    const [lastAddedIds, setLastAddedIds] = useState([]);
    const [filterOption, setFilterOption] = useState("All");
    const [undoStack, setUndoStack] = useState([]);
    const filterOptions = [
        { label: "All", value: "all" },
        { label: "Finished", value: "finished" },
        { label: "Unfinished", value: "unfinished" },
    ];
    const {
        loading,
        setTakenOutMasterListTableRows,
        masterListFilteredRows,
        safeMasterListCurrentPage,
        masterListIndexOfFirstRow,
        masterListCurrentData,
        takenOutMasterListCurrentPage,
        setTakenOutMasterListCurrentpage,
        setTakenOutMasterListAppliedFilters,
        takenOutMasterListSearchQuery,
        setTakenOutMasterListSearchQuery,
        fetchMasterList,
    } = useStateContext();
    const [sortColumn, setSortColumn] = useState("accountname");
    const [sortDirection, setSortDirection] = useState("asc");
    const navigate = useNavigate();
    const isAnyRowChecked = Object.values(checkedRows).some(Boolean);
    const dropdownRef = useRef(null);
    const [isAddingToMasterlist, setIsAddingToMasterlist] = useState(false);
    const [isFileUploading, setIsFileUploading] = useState(false);
    // const [isViewOpen, setIsViewOpen] = useState(false);
    const [showTitlingMonitor, setShowTitlingMonitor] = useState(false);
    const [selectedRowDataForMonitor, setSelectedRowDataForMonitor] =
        useState(null);

    const fetchLocalMasterListData = async () => {
        try {
            const response = await apiService.get("/taken-out-accounts/get-masterlist");
            setMasterList(response.data || []);
        } catch (error) {
            console.error("Failed to fetch local master list data for filtering:", error);
            setMasterList([]); 
            toast.error("Could not refresh filter data for master list status.");
        }
    };

    useEffect(() => {
        fetchMasterList();
        fetchLocalMasterListData(); 
    }, []); 

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            toast.error("No file selected.");
            return;
        }
        setIsFileUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await apiService.post(
                "/upload-taken-out-accounts", 
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Data uploaded successfully!");
                await fetchMasterList(); 
                await fetchLocalMasterListData(); 
            } else {
                toast.error(
                    `Failed to upload data: ${
                        response.data?.message || "Unknown error"
                    }`
                );
            }
        } catch (error) {
            console.error("File upload error:", error);
            toast.error(
                `Failed to upload data: ${error.response?.data?.message || "Unknown error"}`
            );
        } finally {
            setIsFileUploading(false);
            if (event.target) event.target.value = null;
        }
    };

    const handleOpenTitlingMonitor = (
        user,
        contractNumber,
        propertyName,
        unitNumber,
        accountId
    ) => {
        setShowTitlingMonitor(true);
        const data = { user, contractNumber, propertyName, unitNumber, accountId };
        console.log("Opening Titling Monitor with data:", data);
        setSelectedRowDataForMonitor(data);
    };

    const handleCloseTitlingMonitor = () => {
        setShowTitlingMonitor(false);
        setSelectedRowDataForMonitor(null);
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
    }, [dropdownRef, setIsFilterVisible]);

    useEffect(() => {
        if (takenOutMasterListCurrentPage < 1) {
            setTakenOutMasterListCurrentpage(1);
        }
    }, [takenOutMasterListCurrentPage, setTakenOutMasterListCurrentpage]);

    const masterListContracts = useMemo(
        () => new Set(masterList.map((item) => item.contract_no)),
        [masterList]
    );

    function formatDate(date) {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        const filters = [
            selectedContractNo && {
                key: "contractNo",
                label: `Contract No: ${selectedContractNo}`,
            },
            selectedAccountName && {
                key: "accountName",
                label: `Account Name: ${selectedAccountName}`,
            },
            selectedProject && {
                key: "project",
                label: `Project: ${selectedProject}`,
            },
            selectedFinancing && {
                key: "financing",
                label: `Financing: ${selectedFinancing}`,
            },
            selectedDateFilter && {
                key: "dateFilter",
                label: `Date Filter: ${selectedDateFilter}`,
            },
            selectedDate && {
                key: "date",
                label: `Date: ${formatDate(selectedDate)}`,
            },
        ].filter(Boolean);

        setActiveFilters(filters);
    }, [
        selectedContractNo,
        selectedAccountName,
        selectedProject,
        selectedFinancing,
        selectedDateFilter,
        selectedDate,
    ]);

    // const fetchMasterList = async () => {
    //     try {
    //         const response = await apiService.get(
    //             "/taken-out-accounts/get-masterlist"
    //         );
    //         setMasterList(response.data);
    //     } catch (error) {
    //         console.error("Failed to fetch master list:", error);
    //     }
    // };

    // useEffect(() => {
    //     fetchMasterList();
    // }, []);

    const handleUndoAddToMasterList = async (idsToUndo) => {
        if (!idsToUndo || idsToUndo.length === 0) {
            toast.error("Nothing to undo.");
            return;
        }

        try {
            const response = await apiService.patch(
                "/taken-out-accounts/undo-masterlist",
                { ids: idsToUndo }
            );

            if (response.status === 200) {
                setTakenOutMasterListTableRows((prev) =>
                    prev.map((row) =>
                        idsToUndo.includes(row.id)
                            ? { ...row, added_status: false }
                            : row
                    )
                );

                setUndoStack((prev) =>
                    prev.filter(
                        (entry) =>
                            JSON.stringify(entry) !== JSON.stringify(idsToUndo)
                    )
                );

                await fetchMasterList();

                toast.success("Undo successful.");
            } else {
                throw new Error(`Undo failed with status ${response.status}`);
            }
        } catch (error) {
            console.error("Undo Error:", error);
            toast.error("Failed to undo.");
        }
    };

    const handleAddToMasterList = async () => {
        setIsAddingToMasterlist(true);
        try {
            const checkedContractNos = Object.keys(checkedRows).filter(
                (contract_no) => checkedRows[contract_no]
            );

            const selectedIds = masterListFilteredRows
                .filter((row) =>
                    checkedContractNos.includes(row.contract_no.toString())
                )
                .map((row) => row.id);

            if (selectedIds.length === 0) {
                toast.error("No rows selected.");
                return;
            }

            try {
                const response = await apiService.patch(
                    "/taken-out-accounts/add-masterlist",
                    {
                        ids: selectedIds,
                        added_status: true,
                    }
                );

                if (response.status === 200) {
                    setCheckedRows({});
                    await fetchMasterList();
                    await fetchLocalMasterListData();
                }
            } catch (error) {
                toast.error("Error adding to master list");
                console.error("Add Error:", error);
            }
        } finally {
            setIsAddingToMasterlist(false);
        }
    };

    const FilterSearchIcon = () => {
        return (
            <img
                src={Filter}
                alt="Filter Icon"
                className="size-6"
                onClick={toggleFilterBox}
            />
        );
    };

    // const indexOfLastRow = Math.min(
    //     currentPage * rowsPerPage,
    //     tableRows.length
    // );
    // const indexOfFirstRow = Math.max(indexOfLastRow - rowsPerPage, 0);

    // const filteredRows = useMemo(() => {
    //     if (!Array.isArray(tableRows)) return [];

    //     return tableRows.filter((row) => {
    //         const searchQ = takenOutSearchQuery?.trim().toLowerCase() || "";

    //         const matchesSearchQuery =
    //             !takenOutSearchQuery ||
    //             row.accountname?.toLowerCase().includes(searchQ) ||
    //             row.contractno?.toLowerCase().includes(searchQ) ||
    //             row.propertyname?.toLowerCase().includes(searchQ) ||
    //             row.unitno?.toLowerCase().includes(searchQ) ||
    //             row.financingNormalized?.toLowerCase().includes(searchQ) ||
    //             row.takeoutdate?.toLowerCase().includes(searchQ) ||
    //             row.douexpiry?.toLowerCase().includes(searchQ);

    //         const matchesFinancing =
    //             !takenOutAppliedFilters.financing ||
    //             row.financingNormalized.includes(
    //                 takenOutAppliedFilters.financing?.trim().toLowerCase()
    //             );

    //         return matchesSearchQuery && matchesFinancing;
    //     });
    // }, [tableRows, takenOutSearchQuery, takenOutAppliedFilters]);

    const filteredAndSortedData = useMemo(() => {
        if (!masterListFilteredRows) return [];

        let data = [...masterListFilteredRows];
        switch (filterOption) {
            case "All":
                break;
            case "Finished":
                data = data.filter((row) =>
                    masterListContracts.has(row.contractNumber)
                );
                break;
            case "Unfinished":
                data = data.filter(
                    (row) => !masterListContracts?.has(row.contractNumber)
                );
                break;
            default:
                break;
        }

        // data.sort((a, b) => {
        //     const aValue = (a[sortColumn] || "").toString().toLowerCase();
        //     const bValue = (b[sortColumn] || "").toString().toLowerCase();
        //     if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        //     if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        //     return 0;
        // });

        return data;
    }, [
        masterListFilteredRows,
        filterOption,
        masterListContracts,
        sortColumn,
        sortDirection,
    ]);

    const filteredTotalPages = Math.max(
        1,
        Math.ceil(filteredAndSortedData.length / rowsPerPage)
    );

    useEffect(() => {
        if (takenOutMasterListCurrentPage > filteredTotalPages) {
            setTakenOutMasterListCurrentpage(filteredTotalPages);
        }
        if (takenOutMasterListCurrentPage < 1) {
            setTakenOutMasterListCurrentpage(1);
        }
    }, [
        filteredAndSortedData.length,
        filteredTotalPages,
        takenOutMasterListCurrentPage,
        setTakenOutMasterListCurrentpage,
    ]);

    const paginatedData = useMemo(() => {
        const start = (takenOutMasterListCurrentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredAndSortedData.slice(start, end);
    }, [filteredAndSortedData, takenOutMasterListCurrentPage, rowsPerPage]);

    // const currentData = filteredRows.slice(takenOutIndexOfFirstRow, takenOutIndexOfLastRow);

    const toggleFilterBox = () => {
        setIsFilterVisible((prev) => !prev);

        if (!isFilterVisible) {
            setSelectedContractNo("");
            setSelectedAccountName("");
            setSelectedProject("");
            setSelectedFinancing("");
            setSelectedDateFilter("");
            setSelectedDate("");
        }
    };

    const toggleRow = (contract_no) => {
        const selectedRowData = paginatedData.find(
            (row) => row.contractNumber === contract_no
        );
        setSelectedRow(selectedRowData);
        setCheckedRows((prev) => ({
            ...prev,
            [contract_no]: !prev[contract_no],
        }));
    };

    useEffect(() => {
        const selectableRows = masterListCurrentData.filter(
            (row) => !masterListContracts.has(row.contract_no)
        );
        const areAllChecked =
            selectableRows.length > 0 &&
            selectableRows.every((row) => checkedRows[row.contract_no]);
        setAllRowsChecked(areAllChecked);
    }, [checkedRows, masterListCurrentData, masterListContracts]);

    const handleApplyFilters = () => {
        setTakenOutMasterListAppliedFilters({
            contractNo: selectedContractNo,
            accountName: selectedAccountName,
            project: selectedProject,
            financing: selectedFinancing,
            dateFilter: selectedDateFilter,
            date: selectedDate,
        });
        setTakenOutMasterListCurrentpage(1);
        setIsFilterVisible(false);
    };

    const handleRemoveFilter = (key) => {
        switch (key) {
            case "contractNo":
                setSelectedContractNo("");
                break;
            case "accountName":
                setSelectedAccountName("");
                break;
            case "project":
                setSelectedProject("");
                break;
            case "financing":
                setSelectedFinancing("");
                break;
            case "dateFilter":
                setSelectedDateFilter("");
                break;
            case "date":
                setSelectedDate("");
                break;
            default:
                break;
        }

        setTakenOutMasterListAppliedFilters((prev) => ({
            ...prev,
            [key]: "",
        }));

        setActiveFilters((prev) => prev.filter((filter) => filter.key !== key));
    };

    const clearFilters = () => {
        setSelectedContractNo("");
        setSelectedAccountName("");
        setSelectedProject("");
        setSelectedFinancing("");
        setSelectedDateFilter("");
        setSelectedDate("");
    };

    const handleRefreshAndClearFilters = async () => {
        clearFilters();
        setTakenOutMasterListAppliedFilters({
            contractNo: "",
            accountName: "",
            project: "",
            financing: "",
            dateFilter: "",
            date: "",
        });
        await fetchMasterList();
    };

    return (
        <>
            <div className="w-[calc(100%-20px)] mx-1">
                {!showTitlingMonitor && (
                    <div className="relative flex items-center gap-1.5 mb-2 w-full">
                        {" "}
                        <div className="flex-shrink-0">
                            <Menu>
                                <MenuHandler>
                                    <Button
                                        variant="text"
                                        size="sm"
                                        className="bg-[#EFEFEF] text-gray-700 text-sm rounded-[10px] flex items-center justify-between gap-1 px-4 h-[47px] w-[120px] min-w-[120px] max-w-[120px] font-normal shadow-none border-none hover:bg-custom-grayF1 focus:bg-custom-grayF1 active:bg-custom-grayF1 transition-none"
                                        style={{
                                            transition: "none",
                                            boxShadow: "none",
                                            border: "none",
                                        }}
                                    >
                                        <span className="truncate text-left flex-1">
                                            {filterOption}
                                        </span>
                                        <ChevronDownIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
                                    </Button>
                                </MenuHandler>
                                <MenuList className="z-50 flex flex-col justify-center min-h-[120px]">
                                    {filterOptions.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            onClick={() =>
                                                setFilterOption(option.label)
                                            }
                                            className={`flex items-center justify-center h-9 w-full p-4 ${
                                                filterOption === option.label
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
                                className="size-4 absolute left-3 top-4 text-gray-500"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                />
                            </svg>

                            <input
                                type="text"
                                value={takenOutMasterListSearchQuery}
                                onChange={(e) => {
                                    setTakenOutMasterListSearchQuery(
                                        e.target.value
                                    );
                                    setTakenOutMasterListCurrentpage(1);
                                }}
                                className="h-[47px] w-full bg-custom-grayF1 rounded-[10px] pl-9 pr-12 text-sm"
                                placeholder="Search"
                            />

                            <div className="absolute right-3 top-3 flex justify-end">
                                <div className="cursor-pointer mr-2">
                                    <FilterSearchIcon
                                        onClick={toggleFilterBox}
                                    />
                                </div>
                                <button
                                    className="cursor-pointer"
                                    onClick={handleRefreshAndClearFilters}
                                >
                                    <svg
                                        stroke="currentColor"
                                        fill="currentColor"
                                        stroke-width="0"
                                        viewBox="0 0 24 24"
                                        height="1em"
                                        width="1em"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill="none"
                                            d="M0 0h24v24H0z"
                                        ></path>
                                        <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
                                    </svg>
                                </button>
                            </div>
                            <AnimatePresence>
                                {isFilterVisible && (
                                    <motion.div
                                        ref={dropdownRef}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-[110%] transform -translate-x-1/2 p-6 sm:p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[100%] max-w-full"
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col sm:flex-row">
                                                <label className="text-custom-bluegreen text-[12px] sm:w-[114px] mb-1 sm:mb-0">
                                                    Contract No.
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedContractNo}
                                                    onChange={(e) =>
                                                        setSelectedContractNo(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border-b outline-none text-sm px-2"
                                                />
                                            </div>

                                            <div className="flex flex-col sm:flex-row">
                                                <label className="text-custom-bluegreen text-[12px] sm:w-[114px] mb-1 sm:mb-0">
                                                    Account Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedAccountName}
                                                    onChange={(e) =>
                                                        setSelectedAccountName(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border-b outline-none text-sm px-2"
                                                />
                                            </div>

                                            <div className="flex flex-col sm:flex-row">
                                                <label className="text-custom-bluegreen text-[12px] sm:w-[114px] mb-1 sm:mb-0">
                                                    Project
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedProject}
                                                    onChange={(e) =>
                                                        setSelectedProject(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border-b outline-none text-sm px-2"
                                                />
                                            </div>

                                            <div className="flex flex-col sm:flex-row">
                                                <label className="text-custom-bluegreen text-[12px] sm:w-[114px] mb-1 sm:mb-0">
                                                    Financing
                                                </label>
                                                <select
                                                    value={selectedFinancing}
                                                    onChange={(e) =>
                                                        setSelectedFinancing(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border-b outline-none text-sm px-2"
                                                >
                                                    <option value="">
                                                        Select Financing
                                                    </option>
                                                    <option value="Cash">
                                                        Cash
                                                    </option>
                                                    <option value="BPI">
                                                        BPI
                                                    </option>
                                                    <option value="HDMF">
                                                        HDMF
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center w-full">
                                                    <label className="text-custom-bluegreen text-[12px] w-[114px] mb-1 sm:mb-0">
                                                        Date Filter
                                                    </label>
                                                    <select
                                                        value={
                                                            selectedDateFilter
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedDateFilter(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full border-b outline-none text-sm px-2"
                                                    >
                                                        <option value=""></option>
                                                        <option value="Takeout Date">
                                                            Takeout Date
                                                        </option>
                                                        <option value="DOU Expiry">
                                                            DOU Expiry
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center w-full">
                                                    <label className="text-custom-bluegreen text-[12px] sm:w-auto mb-1 sm:mb-0 sm:mr-3">
                                                        Date
                                                    </label>

                                                    <div className="relative w-full border-b outline-none">
                                                        <DatePicker
                                                            selected={
                                                                selectedDate
                                                            }
                                                            onChange={(date) =>
                                                                setSelectedDate(
                                                                    date
                                                                )
                                                            }
                                                            className="w-full pr-10 text-sm text-center"
                                                            calendarClassName="custom-calendar"
                                                        />
                                                        <img
                                                            src={DateLogo}
                                                            alt="date"
                                                            className="absolute bottom-[1px] right-2 size-5 pointer-events-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-4">
                                                <button
                                                    onClick={handleApplyFilters}
                                                    className="h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm"
                                                >
                                                    Search
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                            <button
                                onClick={handleAddToMasterList}
                                className={`h-[47px] w-[130px] font-semibold text-sm rounded-[10px] flex items-center justify-center gap-1
                                    transition-all duration-300 ease-in-out
                                    ${
                                        isAnyRowChecked
                                            ? "gradient-btn5 text-white cursor-pointer scale-100 shadow-md"
                                            : "bg-[#A5A5A5] text-gray-300 cursor-not-allowed scale-95 shadow-none"
                                    }
                                `}
                                disabled={!isAnyRowChecked}
                            >
                                {isAddingToMasterlist ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <>
                                        <span className="text-[14px] font-semibold">
                                            +
                                        </span>{" "}
                                        Add Account
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    if (!isFileUploading) {
                                        document.getElementById("masterListFileUpload").click();
                                    }
                                }}
                                className={`h-[47px] w-[130px] bg-[#067AC5] text-white text-sm rounded-[10px] flex items-center justify-center gap-1 ${isFileUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isFileUploading}
                            >
                                {isFileUploading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    <>
                                        <UploadIcon className="w-5 h-5" />
                                        <span className="text-[14px] font-semibold">Upload</span>
                                    </>
                                )}
                            </button>
                            <input
                                id="masterListFileUpload" // Unique ID for the file input
                                type="file"
                                accept=".xlsx, .xls" // Specify accepted file types
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                    </div>
                )}

                {showTitlingMonitor && selectedRowDataForMonitor ? (
                    <TitlingAndRegistrationMonitor
                        onClose={handleCloseTitlingMonitor} 
                        {...selectedRowDataForMonitor} // accountId is spread here
                    />
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2 w-full">
                            {" "}
                            {activeFilters.map((filter, index) => (
                                <div
                                    key={index}
                                    className="flex items-center bg-[#70AD47] text-white px-3 py-1 rounded-[10px] font-normal text-sm mb-2"
                                >
                                    <span>{filter.label}</span>
                                    <button
                                        className="ml-2 text-white hover:text-gray-700"
                                        onClick={() =>
                                            handleRemoveFilter(filter.key)
                                        }
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Card className="w-full overflow-hidden">
                            {" "}
                            <table className="w-full table-fixed text-left">
                                <thead>
                                    <tr>
                                        {TABLE_HEAD.map(({ head, icon }) => (
                                            <th
                                                key={head}
                                                className="border-b bg-[#175D5F] text-white h-[60px] cursor-pointer"
                                                onClick={() => {
                                                    const columnMap = {
                                                        "Account Name":
                                                            "account_name",
                                                        "Property Details":
                                                            "contract_no",
                                                        Financing: "financing",
                                                        "Takeout Date":
                                                            "take_out_date",
                                                        "DOU Expiry":
                                                            "dou_expiry",
                                                    };
                                                    const col = columnMap[head];
                                                    if (col) {
                                                        if (
                                                            sortColumn === col
                                                        ) {
                                                            setSortDirection(
                                                                sortDirection ===
                                                                    "asc"
                                                                    ? "desc"
                                                                    : "asc"
                                                            );
                                                        } else {
                                                            setSortColumn(col);
                                                            setSortDirection(
                                                                "asc"
                                                            );
                                                        }
                                                    }
                                                }}
                                            >
                                                <div
                                                    className={`flex items-center gap-2 ${
                                                        head === "Financing"
                                                            ? "justify-center pl-0"
                                                            : "pl-4"
                                                    }`}
                                                >
                                                    {head ===
                                                        "Account Name" && (
                                                        <span className="inline-flex justify-center items-center mr-2"></span>
                                                    )}
                                                    {icon}
                                                    <Typography
                                                        variant="small"
                                                        className="!font-semibold text-base"
                                                    >
                                                        {head}
                                                    </Typography>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData &&
                                    paginatedData.length > 0 ? (
                                        paginatedData.map(
                                            (
                                                {
                                                    id, // Destructure id here
                                                    user,
                                                    contractNumber,
                                                    propertyName,
                                                    unitNumber,
                                                    finance,
                                                    takeOutdate,
                                                    douExpiry,
                                                },
                                                index
                                            ) => {
                                                const isLast =
                                                    index ===
                                                    masterListCurrentData.length -
                                                        1;
                                                const classes = isLast
                                                    ? "p-4"
                                                    : "p-4 border-b border-gray-300";

                                                const globalIndex =
                                                    masterListIndexOfFirstRow +
                                                    index;

                                                const isChecked =
                                                    checkedRows[contractNumber];

                                                const isInMasterList =
                                                    masterListContracts.has(
                                                        contractNumber
                                                    );

                                                return (
                                                    <tr
                                                        key={`${contractNumber}-${globalIndex}`}
                                                        className={`${classes} ${
                                                            isChecked
                                                                ? "bg-slate-200 text-[#348017] text-base font-normal"
                                                                : "text-[#348017] text-base font-normal"
                                                        } cursor-pointer`}
                                                        onClick={() =>
                                                            setIsChecked(
                                                                !isChecked
                                                            )
                                                        }
                                                    >
                                                        <td className={classes}>
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex w-6 h-6 justify-center items-center ml-5 mr-2">
                                                                    <img
                                                                        src={
                                                                            TicketSvg
                                                                        }
                                                                        alt="Ticket Icon"
                                                                        className="size-6"
                                                                    />
                                                                </span>
                                                                <div className="flex flex-col items-start">
                                                                    <span className="text-base font-normal">
                                                                        {user}
                                                                    </span>
                                                                    <button
                                                                        className="text-sm underline hover:text-[#067AC5]"
                                                                        onClick={(
                                                                            event
                                                                        ) => {
                                                                            event.stopPropagation();
                                                                            handleOpenTitlingMonitor(
                                                                                user,
                                                                                contractNumber,
                                                                                propertyName,
                                                                                unitNumber
                                                                            );
                                                                        }}
                                                                    >
                                                                        View
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-base font-normal"
                                                            >
                                                                {contractNumber}
                                                                <br />
                                                                {propertyName}
                                                                <br />
                                                                {unitNumber}
                                                            </Typography>
                                                        </td>
                                                        <td className={classes}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-base font-normal text-center"
                                                            >
                                                                <span
                                                                    className={`w-[80px] h-[30px] px-[12px] py-1 rounded-[50px] inline-block font-montserrat
                                                ${
                                                    financeColorClasses[
                                                        finance
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                }
                                            `}
                                                                >
                                                                    {finance}{" "}
                                                                </span>
                                                            </Typography>
                                                        </td>
                                                        <td className={classes}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-base font-normal"
                                                            >
                                                                {takeOutdate}{" "}
                                                            </Typography>
                                                        </td>
                                                        <td className={classes}>
                                                            <Typography
                                                                variant="small"
                                                                className="text-base font-normal"
                                                            >
                                                                {douExpiry}
                                                            </Typography>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )
                                    ) : loading ? (
                                        <tr>
                                            <td
                                                colSpan={TABLE_HEAD.length}
                                                className="p-4 text-center text-gray-500"
                                            >
                                                <CircularProgress />
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={TABLE_HEAD.length}
                                                className="p-4 text-center text-gray-500"
                                            >
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <CardFooter className="flex items-center justify-end border-t border-blue-gray-50 p-4 gap-2">
                                {" "}
                                <ReactPaginate
                                    previousLabel={
                                        <MdKeyboardArrowLeft className="text-[#404B52]" />
                                    }
                                    nextLabel={
                                        <MdKeyboardArrowRight className="text-[#404B52]" />
                                    }
                                    breakLabel={"..."}
                                    pageCount={filteredTotalPages}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={2}
                                    onPageChange={(data) => {
                                        setTakenOutMasterListCurrentpage(
                                            data.selected + 1
                                        );
                                    }}
                                    containerClassName={"flex gap-2"}
                                    previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                                    nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                                    pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                                    activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-white rounded-[4px] text-[12px]"
                                    pageLinkClassName="w-full h-full flex justify-center items-center"
                                    activeLinkClassName="w-full h-full flex justify-center items-center"
                                    disabledLinkClassName="text-gray-300 cursor-not-allowed"
                                    forcePage={safeMasterListCurrentPage - 1}
                                />
                            </CardFooter>
                        </Card>
                    </>
                )}
            </div>{" "}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                className="custom-toast-container"
            />
        </>
    );
}
