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
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import TicketSvg from "@/assets/images/ticket.svg";
import UploadSvg from "@/assets/images/csv_icon.svg";
import CheckboxSvg from "@/assets/images/checkbox.svg";
import Checkbox1Svg from "@/assets/images/CheckBox1.svg";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
    ChevronDownIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Filter from "@/assets/images/filterIcon.svg";
import DateLogo from "@/assets/images/Date_range.svg";
import DatePicker from "react-datepicker";
import apiService from "../../../servicesApi/apiService";
import { useStateContext } from "../../../../context/contextprovider";
import { useDocumentManagementContext } from "../../../../context/DocumentManagement/DocumentManagementContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "@mui/material";
import TitlingAndRegistrationMonitor from "../../../layout/documentManagementPage/TitlingAndRegistrationMonitor";
import HistoricalImportModal from "./HistoricalImportModal";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";

const UploadIcon = ({ onClick, className: propClassName }) => (
    <img
        src={UploadSvg}
        alt="Upload Icon"
        className={propClassName || "size-4"}
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

const UserIcon = () => (
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
    </svg>
);

const Propertyicon = () => (
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
    </svg>
);

const FinanceIcon = () => (
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
    </svg>
);

const DateIcon = () => (
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
    </svg>
);

const ExpiryIcon = () => (
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
    </svg>
);

const TABLE_HEAD = [
    { head: "Account Name", icon: <UserIcon /> },
    { head: "Project Details", icon: <Propertyicon /> },
    { head: "Financing", icon: <FinanceIcon /> },
    { head: "TO Year", icon: <DateIcon /> },
    { head: "TO Month", icon: <DateIcon /> },
    { head: "Takeout Date", icon: <DateIcon /> },
    { head: "DOU Expiry", icon: <ExpiryIcon /> },
];

const financeColorClasses = {
    Cash: "bg-[#5B9BD5] text-white",
    BPI: "bg-[#AD4747] text-white",
    HDMF: "bg-[#FFCC00] text-black",
};

// // Skeleton Loader Component for MasterListView
// const MasterListViewSkeleton = () => {
//     const rowsPerPage = 5; // Matches the component's rowsPerPage

//     return (
//         <div className="w-[calc(100%-20px)] mx-1">
//             {/* Header Skeleton */}
//             <div className="relative flex items-center gap-1.5 mb-2 w-full">
//                 <Skeleton height={47} width={120} className="flex-shrink-0" />{" "}
//                 {/* Filter dropdown */}
//                 <Skeleton height={47} className="flex-1" /> {/* Search input */}
//                 <Skeleton height={47} width={130} /> {/* Add Account button */}
//                 <Skeleton height={47} width={130} /> {/* Upload button */}
//             </div>

//             {/* Active Filters Skeleton (optional, can be simple line) */}
//             <div className="flex flex-wrap gap-2 w-full mb-4">
//                 {[...Array(2)].map(
//                     (
//                         _,
//                         i // Simulate 2 active filters
//                     ) => (
//                         <Skeleton
//                             key={i}
//                             height={30}
//                             width={100}
//                             className="rounded-[10px]"
//                         />
//                     )
//                 )}
//             </div>

//             {/* Table Skeleton */}
//             <Card className="w-full overflow-hidden">
//                 <table className="w-full table-fixed text-left">
//                     <thead>
//                         <tr>
//                             {TABLE_HEAD.map((_, i) => (
//                                 <th
//                                     key={i}
//                                     className="border-b bg-[#175D5F] text-white h-[60px] p-4"
//                                 >
//                                     <Skeleton height={20} width="80%" />
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {[...Array(rowsPerPage)].map((_, rowIndex) => (
//                             <tr
//                                 key={rowIndex}
//                                 className="p-4 border-b border-gray-300"
//                             >
//                                 <td className="p-4">
//                                     <div className="flex items-center gap-2">
//                                         <Skeleton
//                                             circle
//                                             height={24}
//                                             width={24}
//                                         />{" "}
//                                         {/* Ticket Icon */}
//                                         <div className="flex flex-col items-start">
//                                             <Skeleton height={20} width={100} />{" "}
//                                             {/* User name */}
//                                             <Skeleton
//                                                 height={16}
//                                                 width={60}
//                                                 className="mt-1"
//                                             />{" "}
//                                             {/* View link */}
//                                         </div>
//                                     </div>
//                                 </td>
//                                 <td className="p-4">
//                                     <Skeleton
//                                         count={3}
//                                         height={16}
//                                         width="90%"
//                                     />{" "}
//                                     {/* Property details */}
//                                 </td>
//                                 <td className="p-4 text-center">
//                                     <Skeleton
//                                         height={30}
//                                         width={80}
//                                         className="rounded-[50px]"
//                                     />{" "}
//                                     {/* Financing */}
//                                 </td>
//                                 <td className="p-4">
//                                     <Skeleton height={20} width={80} />{" "}
//                                     {/* Takeout Date */}
//                                 </td>
//                                 <td className="p-4">
//                                     <Skeleton height={20} width={80} />{" "}
//                                     {/* DOU Expiry */}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                 {/* Card Footer Skeleton for Pagination */}
//                 <CardFooter className="flex items-center justify-end border-t border-blue-gray-50 p-4 gap-2">
//                     <Skeleton height={30} width={200} />
//                 </CardFooter>
//             </Card>
//         </div>
//     );
// };

export default function PaginatedTable() {
    const [tableRows, setTableRows] = useState([]);
    const [checkedRows, setCheckedRows] = useState({});
    const [allRowsChecked, setAllRowsChecked] = useState(false);
    const [rowsPerPage] = useState(5);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [selectedContractNo, setSelectedContractNo] = useState("");
    const [selectedAccountName, setSelectedAccountName] = useState("");
    const [selectedProject, setSelectedProject] = useState("");
    const [projectSearchTerm, setProjectSearchTerm] = useState("");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [selectedFinancing, setSelectedFinancing] = useState("");
    const [financingSearchTerm, setFinancingSearchTerm] = useState("");
    const [isFinancingDropdownOpen, setIsFinancingDropdownOpen] =
        useState(false);
    const [selectedDateFilter, setSelectedDateFilter] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [activeFilters, setActiveFilters] = useState([]);
    const [masterList, setMasterList] = useState([]);
    const [lastAddedIds, setLastAddedIds] = useState([]);
    const [filterOption, setFilterOption] = useState("all");
    const [undoStack, setUndoStack] = useState([]);
    const filterOptions = [
        { label: "All", value: "all" },
        { label: "Complete", value: "complete" },
        { label: "Incomplete", value: "incomplete" },
    ];
    const docMgmt = useDocumentManagementContext();
    const {
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
    } = docMgmt;
    const [sortColumn, setSortColumn] = useState("accountname");
    const [sortDirection, setSortDirection] = useState("asc");
    const navigate = useNavigate();
    const isAnyRowChecked = Object.values(checkedRows).some(Boolean);
    const dropdownRef = useRef(null);
    const [isAddingToMasterlist, setIsAddingToMasterlist] = useState(false);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [isHistoricalImportModalOpen, setIsHistoricalImportModalOpen] =
        useState(false);
    const [isChecked, setIsChecked] = useState(false);
    // const [isViewOpen, setIsViewOpen] = useState(false);
    const [showTitlingMonitor, setShowTitlingMonitor] = useState(false);
    const [selectedRowDataForMonitor, setSelectedRowDataForMonitor] =
        useState(null);

    // const [isPageLoading, setIsPageLoading] = useState(
    //     !masterListFilteredRows || masterListFilteredRows.length === 0
    // );

    // Function to convert Excel serial date to M/D/YYYY format
    const convertExcelSerialDate = (serial) => {
        // Excel serial date: days since January 1, 1900 (with 1900 incorrectly treated as leap year)
        const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
        const date = new Date(
            excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
        );

        const month = date.getMonth() + 1; // 0-based to 1-based
        const day = date.getDate();
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
    };

    // Function to validate date format M/D/YYYY (e.g., 9/15/2025)
    const isValidDateFormat = (dateString) => {
        // Handle case where Excel might parse date as a number (Excel serial date)
        if (typeof dateString === "number") {
            // Check if it's a reasonable Excel serial date (between 1900-2100)
            if (dateString > 0 && dateString < 73411) {
                // 73411 ≈ Dec 31, 2100
                const convertedDate = convertExcelSerialDate(dateString);

                // Now validate the converted date
                return isValidDateFormat(convertedDate);
            } else {
                return {
                    isValid: false,
                    message: `Invalid Excel date number: ${dateString}. Format cell as Text and use M/D/YYYY.`,
                };
            }
        }

        if (!dateString || typeof dateString !== "string") {
            return {
                isValid: false,
                message: "Date is required (text format)",
            };
        }

        // Remove any extra whitespace
        const cleanDateString = dateString.toString().trim();

        if (cleanDateString === "") {
            return { isValid: false, message: "Date cannot be empty" };
        }

        // More strict pattern validation - explicitly check format components
        const parts = cleanDateString.split("/");

        // Must have exactly 3 parts separated by /
        if (parts.length !== 3) {
            return {
                isValid: false,
                message: `Invalid date format. Use M/D/YYYY format (e.g., 9/15/2025). Got: "${cleanDateString}"`,
            };
        }

        const [monthPart, dayPart, yearPart] = parts;

        // Validate that each part contains only digits
        if (
            !/^\d+$/.test(monthPart) ||
            !/^\d+$/.test(dayPart) ||
            !/^\d+$/.test(yearPart)
        ) {
            return {
                isValid: false,
                message: `Date parts must contain only numbers. Use M/D/YYYY format (e.g., 9/15/2025). Got: "${cleanDateString}"`,
            };
        }

        // Validate month part (1-2 digits)
        if (monthPart.length === 0 || monthPart.length > 2) {
            return {
                isValid: false,
                message: `Month must be 1-2 digits (1-12). Got month: "${monthPart}" in "${cleanDateString}"`,
            };
        }

        // Validate day part (1-2 digits)
        if (dayPart.length === 0 || dayPart.length > 2) {
            return {
                isValid: false,
                message: `Day must be 1-2 digits (1-31). Got day: "${dayPart}" in "${cleanDateString}"`,
            };
        }

        // Validate year part (exactly 4 digits)
        if (yearPart.length !== 4) {
            return {
                isValid: false,
                message: `Year must be exactly 4 digits (e.g., 2025, not ${yearPart}). Got: "${cleanDateString}"`,
            };
        }

        // Convert to numbers for validation
        const month = parseInt(monthPart, 10);
        const day = parseInt(dayPart, 10);
        const year = parseInt(yearPart, 10);

        // Validate that numbers are in valid ranges
        if (isNaN(month) || isNaN(day) || isNaN(year)) {
            return {
                isValid: false,
                message: `Invalid numbers in date. Got: "${cleanDateString}"`,
            };
        }

        // Validate year - must be reasonable range (not too far in past or future)
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear + 100) {
            return {
                isValid: false,
                message: `Year ${year} is out of range (1900-${currentYear + 100
                    }). Got: "${cleanDateString}"`,
            };
        }

        // Validate month (1-12)
        if (month < 1 || month > 12) {
            return {
                isValid: false,
                message: `Month ${month} is invalid (1-12). Got: "${cleanDateString}"`,
            };
        }

        // Validate day (1-31, but also consider month-specific limits)
        if (day < 1 || day > 31) {
            return {
                isValid: false,
                message: `Day ${day} is invalid (1-31). Got: "${cleanDateString}"`,
            };
        }

        // Additional validation for months with fewer than 31 days
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // Check for leap year
        const isLeapYear =
            (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        if (isLeapYear && month === 2) {
            daysInMonth[1] = 29;
        }

        if (day > daysInMonth[month - 1]) {
            const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            return {
                isValid: false,
                message: `${monthNames[month - 1]} ${year} has only ${daysInMonth[month - 1]
                    } days. Got: "${cleanDateString}"`,
            };
        }

        // Final check: Create a date object and verify it matches our input
        const dateObject = new Date(year, month - 1, day);
        const isValidDate =
            dateObject.getFullYear() === year &&
            dateObject.getMonth() === month - 1 &&
            dateObject.getDate() === day;

        if (!isValidDate) {
            return {
                isValid: false,
                message: `Date "${cleanDateString}" does not exist in calendar.`,
            };
        }

        return { isValid: true, message: "" };
    };

    // const fetchLocalMasterListData = useCallback(async () => {
    //     try {
    //         const response = await apiService.get(
    //             "/taken-out-accounts/get-masterlist"
    //         );
    //         setMasterList(response.data || []);
    //     } catch (error) {
    //         console.error(
    //             "Failed to fetch local master list data for filtering:",
    //             error
    //         );
    //         setMasterList([]);
    //         toast.error(
    //             "Could not refresh filter data for master list status."
    //         );
    //     }
    // }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            // setIsPageLoading(true); // Always set loading to true when fetching
            try {
                await Promise.all([
                    // fetchMasterList(),
                    // fetchLocalMasterListData(),
                ]);
                // await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error) {
                console.error(
                    "Failed to load initial data for Master List view:",
                    error
                );
                toast.error("An error occurred while loading the master list.");
                // } finally {
                //     setIsPageLoading(false); // Only set to false after data is fetched
            }
        };
        loadInitialData();
    }, [fetchMasterList]);

    // Close project dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedElement = event.target;
            const isInsideDropdown = clickedElement.closest(".relative");

            if (isProjectDropdownOpen && !isInsideDropdown) {
                setIsProjectDropdownOpen(false);
            }
            if (isFinancingDropdownOpen && !isInsideDropdown) {
                setIsFinancingDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isProjectDropdownOpen, isFinancingDropdownOpen]);

    // Function to validate uploaded file starting from table headers
    const validateFileData = (data) => {
        const errors = [];
        const missingDataRows = [];

        // Check if data is empty
        if (!data || data.length === 0) {
            errors.push("File contains no data rows.");
            return { isValid: false, errors, missingDataRows };
        }

        // Find the actual table header row (skip rows with 'optional', 'required' etc.)
        let headerRowIndex = -1;
        let actualData = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const firstValue = Object.values(row)[0];

            // Skip rows that contain 'optional', 'required', or are clearly not data
            if (
                typeof firstValue === "string" &&
                (firstValue.toLowerCase().includes("optional") ||
                    firstValue.toLowerCase().includes("required") ||
                    firstValue === "Identifier")
            ) {
                continue;
            }

            // This should be the start of actual table data
            headerRowIndex = i;
            actualData = data.slice(i);
            break;
        }

        // Debug: Log the actual data we're working with

        // However, we need to get the actual column headers from the first non-data row
        // The headers are in the row where values are like 'Contract Number', 'Account Name', etc.
        let actualHeaders = {};
        let headerFound = false;

        // Look for the header row in the original data
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const values = Object.values(row);

            // Check if this row contains header names (like 'Contract Number', 'Account Name')
            const hasHeaderPattern = values.some(
                (value) =>
                    typeof value === "string" &&
                    (value.toLowerCase().includes("takeout") ||
                        value.toLowerCase().includes("dou") ||
                        value.toLowerCase().includes("contract") ||
                        value.toLowerCase().includes("account") ||
                        value.toLowerCase().includes("expiry"))
            );

            if (hasHeaderPattern) {
                // Map the generic column names to actual header names
                const columnKeys = Object.keys(row);
                columnKeys.forEach((key) => {
                    actualHeaders[key] = row[key];
                });
                headerFound = true;
                break;
            }
        }

        if (!headerFound) {
            // Fallback: use column names as headers
            actualHeaders = {};
        }

        // Check if we found actual data
        if (actualData.length === 0) {
            errors.push("No table data found in file.");
            return { isValid: false, errors, missingDataRows };
        }

        // Get column names from the first data row
        const columnNames = Object.keys(actualData[0]);

        // Define date columns that need format validation (case-insensitive matching)
        const dateColumns = [
            "takeout date",
            "take out date",
            "takeoutdate",
            "dou expiry",
            "douexpiry",
            "dou_expiry",
        ];

        // Check which columns are detected as date columns using actual header names
        const detectedDateColumns = columnNames.filter((column) => {
            // Get the actual header name for this column
            const actualHeaderName = actualHeaders[column] || column;
            const headerLower = actualHeaderName.toLowerCase().trim();

            const isDateColumn = dateColumns.some(
                (dateCol) =>
                    headerLower.includes(dateCol) ||
                    dateCol.includes(headerLower)
            );

            return isDateColumn;
        });

        // Check each row for missing data and date format validation
        const dateFormatErrors = [];

        actualData.forEach((row, index) => {
            const missingColumns = [];

            columnNames.forEach((column) => {
                const value = row[column];

                // Get the actual header name for this column
                const actualHeaderName = actualHeaders[column] || column;
                const headerLower = actualHeaderName.toLowerCase().trim();

                // Skip the identifier column (usually first column) as it's optional
                const isIdentifierColumn = column === columnNames[0];

                if (!isIdentifierColumn) {
                    // Check if value is missing, null, undefined, or empty string
                    if (
                        value === null ||
                        value === undefined ||
                        (typeof value === "string" && value.trim() === "") ||
                        value === ""
                    ) {
                        missingColumns.push(actualHeaderName); // Use actual header name for error message
                    } else {
                        // Check if this is a date column and validate the format using actual header name
                        const isDateColumn = dateColumns.some(
                            (dateCol) =>
                                headerLower.includes(dateCol) ||
                                dateCol.includes(headerLower)
                        );

                        if (isDateColumn) {
                            const dateValidation = isValidDateFormat(value);
                            if (!dateValidation.isValid) {
                                dateFormatErrors.push({
                                    rowIndex: index + 1,
                                    column: actualHeaderName, // Use actual header name for error message
                                    value: value,
                                    error: dateValidation.message,
                                });
                            }
                        }
                    }
                }
            });

            if (missingColumns.length > 0) {
                missingDataRows.push({
                    rowIndex: index + 1, // 1-based index for user display
                    missingColumns,
                });
            }
        });

        // Check for date format errors
        if (dateFormatErrors.length > 0) {
            const dateErrorMessage = `Upload failed: ${dateFormatErrors.length} invalid date(s) found. Use M/D/YYYY format (e.g., 9/15/2025).`;
            errors.push(dateErrorMessage);

            // Add detailed error information for the first few problematic dates
            const maxDetailedErrors = Math.min(3, dateFormatErrors.length);
            for (let i = 0; i < maxDetailedErrors; i++) {
                const err = dateFormatErrors[i];
                errors.push(
                    `Row ${err.rowIndex}, ${err.column}: "${err.value}" - ${err.error}`
                );
            }

            if (dateFormatErrors.length > maxDetailedErrors) {
                errors.push(
                    `... and ${dateFormatErrors.length - maxDetailedErrors
                    } more date format errors.`
                );
            }
        }

        // If there are rows with missing data, it's invalid
        if (missingDataRows.length > 0) {
            const errorMessage = `Upload failed: ${missingDataRows.length} row(s) have missing data. Please fill all required columns.`;
            errors.push(errorMessage);
        }

        return {
            isValid:
                missingDataRows.length === 0 && dateFormatErrors.length === 0,
            errors,
            missingDataRows,
            dateFormatErrors,
        };
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            toast.error("No file selected.");
            return;
        }

        // Validate file type
        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
            "text/csv", // .csv
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error(
                "Please upload a valid Excel (.xlsx, .xls) or CSV file."
            );
            return;
        }

        setIsFileUploading(true);

        try {
            // Read and parse the file for validation
            const fileData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, {
                            type: "array",
                            cellDates: false, // Don't convert to Date objects
                            cellText: true, // Use cell text representation when available
                            raw: false, // Don't use raw values, use formatted text
                            dateNF: "M/D/YYYY", // Preferred date format
                        });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];

                        // Try to preserve text formatting by checking cell types
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                            raw: false, // Use formatted values
                            defval: "", // Default value for empty cells
                            blankrows: false, // Skip blank rows
                        });

                        // Debug: Log the parsed data to see what we're actually getting
                        resolve(jsonData);
                    } catch (parseError) {
                        reject(parseError);
                    }
                };
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsArrayBuffer(file);
            });

            // Validate the parsed data
            const validation = validateFileData(fileData);

            if (!validation.isValid) {
                // Show frontend validation errors - this catches basic format issues
                const errorMessage = validation.errors.join(" ");
                toast.error(errorMessage, {
                    autoClose: 8000,
                    position: "top-right",
                });

                setIsFileUploading(false);
                if (event.target) event.target.value = null;
                return;
            }

            // If validation passes, proceed with upload
            const formData = new FormData();
            formData.append("file", file);
            const response = await apiService.post(
                "/taken-out-accounts/upload-taken-out-accounts",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                const { message, stats } = response.data;

                // Show success message with statistics
                toast.success(message);

                // Show additional info if there were errors
                if (stats && stats.errors > 0) {
                    setTimeout(() => {
                        toast.warn(
                            `${stats.errors} records had issues and were skipped. Check the logs for details.`,
                            { autoClose: 5000 }
                        );
                    }, 1000);
                }

                await fetchMasterList();
                // await fetchLocalMasterListData();
            } else {
                toast.error(
                    `Failed to upload data: ${response.data?.message || "Unknown error"
                    }`
                );
            }
        } catch (error) {
            console.error("File upload error:", error);

            // Check for duplicate contract number validation error (422 status)
            if (error.response?.status === 422) {
                const errorData = error.response.data;

                if (errorData.error === "Duplicate contract numbers found") {
                    // Show specific error for duplicate contract numbers
                    toast.error(
                        errorData.message ||
                        "Duplicate contract numbers found in the uploaded file",
                        {
                            autoClose: 10000, // Show for longer since it's important
                            position: "top-right",
                        }
                    );
                } else if (errorData.error === "File validation failed") {
                    // Handle detailed validation errors including date format issues
                    const validationErrors = errorData.validation_errors || [];
                    const dateErrors = errorData.date_errors || [];

                    // Show main error message only if it's different from frontend validation
                    // (Backend validation should only trigger for issues frontend missed)
                    toast.error(errorData.message || "File validation failed", {
                        autoClose: 10000,
                        position: "top-right",
                    });

                    // Show detailed date errors if any (this provides additional context)
                    if (dateErrors.length > 0) {
                        setTimeout(() => {
                            let detailedMessage = "Additional Details:\n\n";

                            // Show first 3 date errors in detail
                            const maxErrors = Math.min(3, dateErrors.length);
                            for (let i = 0; i < maxErrors; i++) {
                                const err = dateErrors[i];
                                detailedMessage += `• Row ${err.row}, ${err.field}: "${err.value}"\n  ${err.error}\n\n`;
                            }

                            if (dateErrors.length > maxErrors) {
                                detailedMessage += `... and ${dateErrors.length - maxErrors
                                    } more issues.\n\n`;
                            }

                            detailedMessage +=
                                "� Tip: Use M/D/YYYY format (e.g., 3/22/2020)\n";
                            detailedMessage +=
                                "� Ensure dates don't have extra digits or impossible values";

                            toast.info(detailedMessage, {
                                autoClose: 12000,
                                position: "top-right",
                                style: {
                                    whiteSpace: "pre-line",
                                    maxWidth: "500px",
                                    fontSize: "13px",
                                },
                            });
                        }, 2000);
                    }
                } else {
                    // Other validation errors
                    toast.error(
                        errorData.message ||
                        errorData.error ||
                        "Validation error occurred",
                        {
                            autoClose: 8000,
                            position: "top-right",
                        }
                    );
                }
                return;
            }

            // Check if it's a file reading/parsing error
            if (
                error.message === "Failed to read file" ||
                error.message.includes("parse")
            ) {
                toast.error(
                    "Failed to read or parse the file. Please ensure it's a valid Excel or CSV file."
                );
            } else {
                // Server-side error
                const errorMessage =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Unknown error occurred";
                toast.error(`Failed to upload data: ${errorMessage}`);
            }
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
        id
    ) => {
        setShowTitlingMonitor(true);
        const data = { user, contractNumber, propertyName, unitNumber, id };
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

    const uniqueProjects = useMemo(() => {
        const projectSet = new Set();

        // Use masterListFilteredRows to get all projects, not just current page
        const allData = masterListFilteredRows || [];
        allData.forEach((item) => {
            // Use the correct field name: propertyName (camelCase)
            const projectName = item.propertyName;
            if (projectName && projectName.toString().trim()) {
                projectSet.add(projectName.toString().trim());
            }
        });

        return Array.from(projectSet).sort();
    }, [masterListFilteredRows]);

    const uniqueFinancing = useMemo(() => {
        const financingSet = new Set();

        // Use masterListFilteredRows to get all financing options, not just current page
        const allData = masterListFilteredRows || [];
        allData.forEach((item) => {
            const financingName = item.finance;
            if (financingName && financingName.toString().trim()) {
                financingSet.add(financingName.toString().trim());
            }
        });

        return Array.from(financingSet).sort();
    }, [masterListFilteredRows]);

    const filteredProjects = uniqueProjects.filter((project) =>
        project.toLowerCase().includes(projectSearchTerm.toLowerCase())
    );

    const filteredFinancing = uniqueFinancing.filter((financing) =>
        financing.toLowerCase().includes(financingSearchTerm.toLowerCase())
    );

    function formatDate(date) {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        return `${month}/${day}/${year}`;
    }

    // Helper to normalize checklist status from various possible formats
    const getChecklistStatus = (row) => {
        const status =
            row.checklistStatus ??
            row.checklist_status ??
            row.checklist_status_flag ??
            row.checklistFlag ??
            row.checkliststatus ??
            row.checklist;

        if (typeof status === "boolean") return status;
        if (typeof status === "number") return status === 1;
        if (typeof status === "string") {
            const normalized = status.toLowerCase().trim();
            return [
                "true",
                "1",
                "yes",
                "y",
                "t",
                "completed",
                "complete",
            ].includes(normalized);
        }
        return false;
    };

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
                    // await fetchLocalMasterListData();
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

        const originalLength = data.length;

        switch (filterOption) {
            case "all":
                break;
            case "complete":
                data = data.filter((row) => getChecklistStatus(row) === true);
                break;
            case "incomplete":
                data = data.filter((row) => getChecklistStatus(row) === false);
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
        setProjectSearchTerm("");
        setSelectedFinancing("");
        setFinancingSearchTerm("");
        setSelectedDateFilter("");
        setSelectedDate("");
    };

    const handleProjectToggle = useCallback((projectName) => {
        setSelectedProject(projectName);
        setProjectSearchTerm(projectName);
        setIsProjectDropdownOpen(false);
    }, []);

    const handleFinancingToggle = useCallback((financingName) => {
        setSelectedFinancing(financingName);
        setFinancingSearchTerm(financingName);
        setIsFinancingDropdownOpen(false);
    }, []);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const handleRefreshAndClearFilters = async () => {
        setIsRefreshing(true);

        // Clear all filter inputs
        clearFilters();

        // Reset dropdown filter to "All"
        setFilterOption("all");

        // Close project dropdown
        setIsProjectDropdownOpen(false);

        // Close financing dropdown
        setIsFinancingDropdownOpen(false);

        // Clear checked rows
        setCheckedRows({});

        // Clear applied filters in context
        setTakenOutMasterListAppliedFilters({
            contractNo: "",
            accountName: "",
            project: "",
            financing: "",
            dateFilter: "",
            date: "",
        });

        // Reset current page to 1
        setTakenOutMasterListCurrentpage(1);

        try {
            await fetchMasterList();
        } finally {
            setTimeout(() => setIsRefreshing(false), 600); // smooth UX
        }
    };

    return (
        <>
            {/* {isPageLoading && paginatedData.length === 0 ? (
            <MasterListViewSkeleton />
        ) : (
            <> */}
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
                                        <span className="truncate text-left flex-1 normal-case">
                                            {filterOptions.find(
                                                (opt) =>
                                                    opt.value === filterOption
                                            )?.label || filterOption}
                                        </span>
                                        <ChevronDownIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
                                    </Button>
                                </MenuHandler>
                                <MenuList className="z-50 flex flex-col justify-center min-h-[120px] min-w-[100px]">
                                    {filterOptions.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            onClick={() =>
                                                setFilterOption(option.value)
                                            }
                                            className={`flex items-center justify-center h-9 w-full p-4 ${filterOption === option.value
                                                    ? "bg-custom-lightestgreen text-gray-900"
                                                    : "text-gray-700"
                                                }`}
                                            style={{
                                                fontWeight: "normal",
                                            }}
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
                                    onClick={
                                        isRefreshing
                                            ? undefined
                                            : handleRefreshAndClearFilters
                                    }
                                    disabled={isRefreshing}
                                >
                                    <svg
                                        stroke="currentColor"
                                        fill="currentColor"
                                        strokeWidth="0"
                                        viewBox="0 0 24 24"
                                        height="1em"
                                        width="1em"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={
                                            isRefreshing ? "animate-spin" : ""
                                        }
                                        style={{ transition: "color 0.2s" }}
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
                                        className="absolute top-[110%] transform -translate-x-1/2 p-6 sm:p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-50 w-[100%] max-w-full"
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
                                                <div className="relative w-full">
                                                    <input
                                                        type="text"
                                                        value={
                                                            projectSearchTerm
                                                        }
                                                        onChange={(e) =>
                                                            setProjectSearchTerm(
                                                                e.target.value
                                                            )
                                                        }
                                                        onFocus={() =>
                                                            setIsProjectDropdownOpen(
                                                                true
                                                            )
                                                        }
                                                        placeholder={
                                                            selectedProject ||
                                                            "Search or select project..."
                                                        }
                                                        className="w-full border-b outline-none text-sm px-2 py-1"
                                                    />
                                                    <svg
                                                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform cursor-pointer ${isProjectDropdownOpen
                                                                ? "rotate-180"
                                                                : ""
                                                            }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        onClick={() =>
                                                            setIsProjectDropdownOpen(
                                                                !isProjectDropdownOpen
                                                            )
                                                        }
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                    {isProjectDropdownOpen && (
                                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b-md shadow-lg z-50 max-h-60 overflow-y-auto">
                                                            <div className="max-h-48 overflow-y-auto">
                                                                {filteredProjects.length >
                                                                    0 ? (
                                                                    filteredProjects.map(
                                                                        (
                                                                            project
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    project
                                                                                }
                                                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                                                onClick={() =>
                                                                                    handleProjectToggle(
                                                                                        project
                                                                                    )
                                                                                }
                                                                            >
                                                                                {
                                                                                    project
                                                                                }
                                                                            </div>
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <div className="px-3 py-2 text-gray-500 text-sm">
                                                                        No
                                                                        projects
                                                                        found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row">
                                                <label className="text-custom-bluegreen text-[12px] sm:w-[114px] mb-1 sm:mb-0">
                                                    Financing
                                                </label>
                                                <div className="relative w-full">
                                                    <input
                                                        type="text"
                                                        value={
                                                            financingSearchTerm
                                                        }
                                                        onChange={(e) =>
                                                            setFinancingSearchTerm(
                                                                e.target.value
                                                            )
                                                        }
                                                        onFocus={() =>
                                                            setIsFinancingDropdownOpen(
                                                                true
                                                            )
                                                        }
                                                        placeholder={
                                                            selectedFinancing ||
                                                            "Search or select financing..."
                                                        }
                                                        className="w-full border-b outline-none text-sm px-2 py-1"
                                                    />
                                                    <svg
                                                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform cursor-pointer ${isFinancingDropdownOpen
                                                                ? "rotate-180"
                                                                : ""
                                                            }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        onClick={() =>
                                                            setIsFinancingDropdownOpen(
                                                                !isFinancingDropdownOpen
                                                            )
                                                        }
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                    {isFinancingDropdownOpen && (
                                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b-md shadow-lg z-50 max-h-60 overflow-y-auto">
                                                            <div className="max-h-48 overflow-y-auto">
                                                                {filteredFinancing.length >
                                                                    0 ? (
                                                                    filteredFinancing.map(
                                                                        (
                                                                            financing
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    financing
                                                                                }
                                                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                                                onClick={() =>
                                                                                    handleFinancingToggle(
                                                                                        financing
                                                                                    )
                                                                                }
                                                                            >
                                                                                {
                                                                                    financing
                                                                                }
                                                                            </div>
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <div className="px-3 py-2 text-gray-500 text-sm">
                                                                        No
                                                                        financing
                                                                        options
                                                                        found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
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
                                                        onChange={(e) => {
                                                            setSelectedDateFilter(
                                                                e.target.value
                                                            );
                                                            // Clear selected date when filter changes
                                                            if (
                                                                e.target
                                                                    .value ===
                                                                ""
                                                            ) {
                                                                setSelectedDate(
                                                                    ""
                                                                );
                                                            }
                                                        }}
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
                                                            onChange={(
                                                                date
                                                            ) => {
                                                                if (
                                                                    !selectedDateFilter
                                                                ) {
                                                                    alert(
                                                                        "Please select a Date Filter first (Takeout Date or DOU Expiry) before choosing a date."
                                                                    );
                                                                    return;
                                                                }
                                                                setSelectedDate(
                                                                    date
                                                                );
                                                            }}
                                                            onFocus={() => {
                                                                if (
                                                                    !selectedDateFilter
                                                                ) {
                                                                    alert(
                                                                        "Please select a Date Filter first (Takeout Date or DOU Expiry) before choosing a date."
                                                                    );
                                                                }
                                                            }}
                                                            className={`w-full pr-10 text-sm text-center ${!selectedDateFilter
                                                                    ? "cursor-not-allowed opacity-50"
                                                                    : ""
                                                                }`}
                                                            calendarClassName="custom-calendar"
                                                            disabled={
                                                                !selectedDateFilter
                                                            }
                                                            placeholderText={
                                                                !selectedDateFilter
                                                                    ? "Select Date Filter first"
                                                                    : "Select date"
                                                            }
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
                                    ${isAnyRowChecked
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
                                        setIsHistoricalImportModalOpen(true);
                                    }
                                }}
                                className={`h-[47px] w-[130px] bg-[#067AC5] text-white text-sm rounded-[10px] flex items-center justify-center gap-1 ${isFileUploading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                disabled={isFileUploading}
                            >
                                {isFileUploading ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    <>
                                        <UploadIcon className="w-5 h-5" />
                                        <span className="text-[14px] font-semibold">
                                            Upload
                                        </span>
                                    </>
                                )}
                            </button>
                            {/* Old file input - now using HistoricalImportModal */}
                            {/* <input
                                id="masterListFileUpload"
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            /> */}
                        </div>
                    </div>
                )}

                {showTitlingMonitor && selectedRowDataForMonitor ? (
                    <TitlingAndRegistrationMonitor
                        onClose={handleCloseTitlingMonitor}
                        {...selectedRowDataForMonitor}
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
                            <div
                                style={{ height: "600px", overflow: "hidden" }}
                            >
                                <table className="w-full table-fixed text-left">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            {TABLE_HEAD.map(
                                                ({ head, icon }) => (
                                                    <th
                                                        key={head}
                                                        className="border-b bg-[#175D5F] text-white h-[60px] cursor-pointer sticky top-0 z-10"
                                                        onClick={() => {
                                                            const columnMap = {
                                                                "Account Name":
                                                                    "account_name",
                                                                "Property Details":
                                                                    "contract_no",
                                                                Financing:
                                                                    "financing",
                                                                Category:
                                                                    "category",
                                                                "TO Year":
                                                                    "to_year",
                                                                "TO Month":
                                                                    "to_month",
                                                                "Takeout Date":
                                                                    "take_out_date",
                                                                "DOU Expiry":
                                                                    "dou_expiry",
                                                            };
                                                            const col =
                                                                columnMap[head];
                                                            if (col) {
                                                                if (
                                                                    sortColumn ===
                                                                    col
                                                                ) {
                                                                    setSortDirection(
                                                                        sortDirection ===
                                                                            "asc"
                                                                            ? "desc"
                                                                            : "asc"
                                                                    );
                                                                } else {
                                                                    setSortColumn(
                                                                        col
                                                                    );
                                                                    setSortDirection(
                                                                        "asc"
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <div
                                                            className={`flex items-center gap-2 ${head ===
                                                                    "Financing" ||
                                                                    head ===
                                                                    "TO Year" ||
                                                                    head ===
                                                                    "TO Month" ||
                                                                    head ===
                                                                    "Takeout Date" ||
                                                                    head ===
                                                                    "DOU Expiry"
                                                                    ? "justify-center pl-0"
                                                                    : "pl-4"
                                                                }`}
                                                        >
                                                            {icon}
                                                            <Typography
                                                                variant="small"
                                                                className="!font-semibold text-base"
                                                            >
                                                                {head}
                                                            </Typography>
                                                        </div>
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paginatedData &&
                                            paginatedData.length > 0 ? (
                                            paginatedData.map(
                                                (
                                                    {
                                                        id,
                                                        user,
                                                        contractNumber,
                                                        propertyName,
                                                        unitNumber,
                                                        finance,
                                                        psd,
                                                        to_year,
                                                        to_month,
                                                        takeOutdate,
                                                        douExpiry,
                                                        checklistStatus,
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
                                                        checkedRows[
                                                        contractNumber
                                                        ];

                                                    const isInMasterList =
                                                        masterListContracts.has(
                                                            contractNumber
                                                        );

                                                    // Get the current row data to check status
                                                    const currentRowData = {
                                                        id,
                                                        user,
                                                        contractNumber,
                                                        propertyName,
                                                        unitNumber,
                                                        finance,
                                                        to_year,
                                                        to_month,
                                                        takeOutdate,
                                                        douExpiry,
                                                        checklistStatus,
                                                    };

                                                    const isComplete =
                                                        getChecklistStatus(
                                                            currentRowData
                                                        );

                                                    // Define background colors for status
                                                    const getStatusBackgroundColor =
                                                        () => {
                                                            if (isChecked) {
                                                                return "bg-slate-200"; // Keep checked row color
                                                            }
                                                            return isComplete
                                                                ? "bg-green-50 hover:bg-green-100" // Light green for complete
                                                                : "bg-white hover:bg-gray-50"; // White for incomplete
                                                        };

                                                    return (
                                                        <tr
                                                            key={`${contractNumber}-${globalIndex}`}
                                                            className={`${classes} ${getStatusBackgroundColor()} text-[#348017] text-base font-normal cursor-pointer transition-colors duration-200`}
                                                            onClick={() =>
                                                                setIsChecked(
                                                                    !isChecked
                                                                )
                                                            }
                                                        >
                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex flex-col items-start">
                                                                        <span className="text-base font-normal">
                                                                            {
                                                                                user
                                                                            }
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
                                                                                    unitNumber,
                                                                                    id
                                                                                );
                                                                            }}
                                                                        >
                                                                            View
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes +
                                                                    " max-w-[180px] truncate whitespace-nowrap overflow-hidden"
                                                                }
                                                            >
                                                                <Typography
                                                                    variant="small"
                                                                    className="text-base font-normal max-w-[180px] truncate whitespace-nowrap overflow-hidden"
                                                                >
                                                                    <span className="max-w-[180px] inline-block truncate align-bottom text-xs font-normal">
                                                                        {
                                                                            contractNumber
                                                                        }
                                                                    </span>
                                                                    <br />
                                                                    <span className="max-w-[180px] inline-block truncate align-bottom text-xs font-normal">
                                                                        {
                                                                            propertyName
                                                                        }
                                                                    </span>
                                                                    <br />
                                                                    <span className="max-w-[180px] inline-block truncate align-bottom text-xs font-normal">
                                                                        {
                                                                            unitNumber
                                                                        }
                                                                    </span>
                                                                </Typography>
                                                            </td>
                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="text-center">
                                                                    <span
                                                                        className={`w-[80px] h-[30px] px-[12px] py-1 rounded-[50px] inline-block font-montserrat
                                                ${financeColorClasses[
                                                                            finance
                                                                            ] ||
                                                                            "bg-gray-100 text-gray-700"
                                                                            }
                                            `}
                                                                    >
                                                                        {
                                                                            finance
                                                                        }{" "}
                                                                    </span>
                                                                    {psd &&
                                                                        psd
                                                                            .toString()
                                                                            .toLowerCase()
                                                                            .trim() ===
                                                                        "with psd" && (
                                                                            <div className="text-xs font-light mt-1 text-custom-solidgreen">
                                                                                {
                                                                                    psd
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </td>
                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Typography
                                                                    variant="small"
                                                                    className="text-base font-normal text-center"
                                                                >
                                                                    {to_year}
                                                                </Typography>
                                                            </td>
                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Typography
                                                                    variant="small"
                                                                    className="text-base font-normal text-center"
                                                                >
                                                                    {to_month}
                                                                </Typography>
                                                            </td>
                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Typography
                                                                    variant="small"
                                                                    className="text-base font-normal text-center"
                                                                >
                                                                    {formatDate(
                                                                        takeOutdate
                                                                    )}{" "}
                                                                </Typography>
                                                            </td>
                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Typography
                                                                    variant="small"
                                                                    className="text-base font-normal text-center"
                                                                >
                                                                    {formatDate(
                                                                        douExpiry
                                                                    )}
                                                                </Typography>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )
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
                            </div>
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
            {/* Historical Import Modal */}
            <HistoricalImportModal
                isOpen={isHistoricalImportModalOpen}
                onClose={() => setIsHistoricalImportModalOpen(false)}
                onSuccess={() => {
                    // Refresh the table data after successful import
                    fetchMasterList();
                    setIsHistoricalImportModalOpen(false);
                }}
            />
        </>
    );
}
