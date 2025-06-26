import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    useMemo,
} from "react";
import apiService from "../component/servicesApi/apiService";
import debounce from "lodash/debounce";
import { set } from "lodash";
import { json } from "react-router-dom";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => {},
    setToken: () => {},
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [token, _setToken] = useState(localStorage.getItem("authToken"));
    const [allEmployees, setAllEmployees] = useState([]);
    const [daysFilter, setDaysFilter] = useState(null);
    const [hasAttachments, setHasAttachments] = useState(false);
    const [statusFilter, setStatusFilter] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifStatus, setNotifStatus] = useState("");
    const [specificAssigneeCsr, setSpecificAssigneeCsr] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedOption, setSelectedOption] = useState("All");
    const [assignedToMeActive, setAssignedToMeActive] = useState(false);
    const [notifCurrentPage, setNotifCurrentPage] = useState(0);
    const [searchFilter, setSearchFilter] = useState({});
    const [data, setData] = useState([]);
    const [dataCount, setDataCount] = useState([]);
    const itemsPerPage = 20;
    const [pageCount, setPageCount] = useState(0);
    const [notifPageCount, setNotifPageCount] = useState(0);
    const [messages, setMessages] = useState([]);
    const [logs, setLogs] = useState([]);
    const [ticketId, setTicketId] = useState(null);
    const [dataCategory, setDataCategory] = useState([]);
    const [dataProperty, setDataPropery] = useState([]);
    const [dataDepartment, setDataDepartment] = useState([]);
    const [communicationTypeData, setCommunicationTypeData] = useState([]);
    const [inquriesPerChannelData, setInquriesPerChannelData] = useState([]);
    const [propertyMonth, setPropertyMonth] = useState("");
    const [communicationTypeMonth, setCommunicationTypeMonth] = useState("");
    const [specificInquiry, setSpecificInquiry] = useState(null);
    const [dataSet, setDataSet] = useState([]);
    const [currentPageCustomer, setCurrentPageCustomer] = useState(0);
    const [totalPagesCustomer, setTotalPagesCustomer] = useState(0);
    const [department, setDepartment] = useState("All");
    const [project, setProject] = useState("All");
    const [month, setMonth] = useState("All");
    const [year, setYear] = useState("");
    const [fullYear, setFullYear] = useState([]);
    const [activeDayButton, setActiveDayButton] = useState(null);
    const [departmentStatusYear, setDepartmentStatusYear] = useState("");
    const [inquiriesPerCategoryYear, setInquiriesPerCategoryYear] =
        useState("");
    const [inquiriesPerPropertyYear, setInquiriesPerPropertyYear] =
        useState("");
    const [communicationTypeYear, setCommunicationTypeYear] = useState("");
    const [isDepartmentInitialized, setIsDepartmentInitialized] =
        useState(false);
    const [inquiriesPerChanelYear, setInquiriesPerChanelYear] = useState("");
    const [inquiriesPerChannelMonth, setInquiriesPerChannelMonth] =
        useState("");
    const [pricingMasterLists, setPricingMasterLists] = useState([]);
    const [bannerLists, setBannerLists] = useState([]);
    const [paymentSchemes, setPaymentSchemes] = useState([]);
    const [propertyId, setPropertyId] = useState(null);
    const [floorPremiumsAccordionOpen, setFloorPremiumsAccordionOpen] =
        useState(false);
    const [propertyFloors, setPropertyFloors] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [propertyUnit, setPropertyUnits] = useState([]);
    const [towerPhaseId, setTowerPhaseId] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [concernMessages, setConcernMessages] = useState([]);
    const [concernId, setConcernId] = useState(null);
    const [propertyMasterData, setPropertyMasterData] = useState([]);
    const [assigneesPersonnel, setAssigneesPersonnel] = useState([]);
    const [propertyNamesList, setPropertyNamesList] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [currentPageTransaction, setCurrentPageTransaction] = useState(0);
    const [transactionsPageCount, setTransactionsPageCount] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [matchesData, setMatchesData] = useState([]);
    const [currentPageInvoices, setCurrentPageInvoices] = useState(0);
    const [invoicesPageCount, setInvoicesPageCount] = useState(0);
    const [bankNames, setBankNames] = useState("All");
    const [bankList, setBankList] = useState([]);
    const [filterDueDate, setFilterDueDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [navBarData, setNavBarData] = useState([]);
    const [isUserTypeChange, setIsUserTypeChange] = useState(false);
    const [countAllConcerns, setCountAllConcerns] = useState({});
    const [userAccessData, setUserAccessData] = useState([]); //Holds the user and department access data
    const [permissions, setPermissions] = useState({});
    const [searchSummary, setSearchSummary] = useState("");
    const [resultSearchActive, setResultSearchActive] = useState(false);
    const [daysActive, setDaysActive] = useState(false);
    const [departmentValue, setDepartmentValue] = useState("All");
    const [projectValue, setProjectValue] = useState("All");
    const [yearValue, setYearValue] = useState(new Date().getFullYear());
    const [monthValue, setMonthValue] = useState("All");
    const [startDateValue, setStartDateValue] = useState(null);
    const [endDateValue, setEndDateValue] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [takenOutTableRows, setTakenOutTableRows] = useState([]);
    const [takenOutMasterListTableRows, setTakenOutMasterListTableRows] =
        useState([]);
    const [masterListLoading, setMasterListLoading] = useState(false);
    const [takenOutCurrentPage, setTakenOutCurrentPage] = useState(1);
    const [takenOutMasterListCurrentPage, setTakenOutMasterListCurrentpage] =
        useState(1);
    const [takenOutSearchQuery, setTakenOutSearchQuery] = useState("");
    const [takenOutMasterListSearchQuery, setTakenOutMasterListSearchQuery] =
        useState("");
    const [takenOutAppliedFilters, setTakenOutAppliedFilters] = useState({
        contractNo: "",
        accountName: "",
        project: "",
        financing: "",
        dateFilter: "",
        date: "",
    });
    const [
        takenOutMasterListAppliedFilters,
        setTakenOutMasterListAppliedFilters,
    ] = useState({
        contractNo: "",
        accountName: "",
        project: "",
        financing: "",
        dateFilter: "",
        date: "",
    });
    const rowsPerPage = 5;
    const [assignee, setAssignee] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [workOrderTypes, setWorkOrderTypes] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);

    const fetchWorkOrders = async () => {
        try {
            const response = await apiService.get(
                "/work-orders/get-work-orders"
            );
            setWorkOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch work orders:", error);
        }
    };

    const fetchWorkOrderTypes = async () => {
        try {
            const response = await apiService.get(
                "/work-orders/work-order-types"
            );
            setWorkOrderTypes(response.data.data);
        } catch (error) {
            console.error("Failed to fetch work order types:", error);
        }
    };

    const fetchAccounts = async () => {
        try {
            const response = await apiService.get(
                "/taken-out-accounts/get-masterlist"
            );
            setAccounts(response.data);
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
        }
    };

    const getAssignee = async () => {
        try {
            const response = await apiService.get("/work-orders/get-assignee");
            setAssignee(response.data);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    useEffect(() => {
        getAssignee();
        fetchAccounts();
        fetchWorkOrderTypes();
        fetchWorkOrders();
    }, []);

    const fetchTakenOutAccounts = async () => {
        setLoading(true);
        try {
            const response = await apiService.get("/taken-out-accounts");
            if (response.data.data.length === 0) {
                setLoading(false);
                setTakenOutTableRows([]);
            } else {
                setTakenOutTableRows(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching taken-out accounts:", error);
            setLoading(false);
            setTakenOutTableRows([]);
        }
    };

    const fetchMasterList = useCallback(async () => {
        setMasterListLoading(true);
        try {
            const response = await apiService.get(
                "/taken-out-accounts/get-masterlist"
            );
            const mappedRows = response.data.map((row) => ({
                id: row.id,
                user: row.account_name,
                contractNumber: row.contract_no,
                propertyName: row.property_name,
                unitNumber: row.unit_no,
                finance: row.financing,
                takeOutdate: row.take_out_date,
                douExpiry: row.dou_expiry,
            }));
            setTakenOutMasterListTableRows(mappedRows);
        } catch (error) {
            console.error("Failed to fetch master list for context:", error);
            setTakenOutMasterListTableRows([]);
        } finally {
            setMasterListLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTakenOutAccounts();
    }, []);

    const takenOutFilteredRows = useMemo(() => {
        if (!Array.isArray(takenOutTableRows)) return [];
        const filters = takenOutAppliedFilters || {};
        const contractNo = filters.contractNo || "";

        return takenOutTableRows.filter((row) => {
            const matchesSearchQuery =
                !takenOutSearchQuery ||
                row.account_name
                    ?.toLowerCase()
                    .includes(takenOutSearchQuery.toLowerCase()) ||
                row.contract_no
                    ?.toLowerCase()
                    .includes(takenOutSearchQuery.toLowerCase()) ||
                row.property_name
                    ?.toLowerCase()
                    .includes(takenOutSearchQuery.toLowerCase()) ||
                row.unit_no
                    ?.toLowerCase()
                    .includes(takenOutSearchQuery.toLowerCase()) ||
                row.financing
                    ?.toLowerCase()
                    .includes(takenOutSearchQuery.toLowerCase()) ||
                row.take_out_date
                    ?.toLowerCase()
                    .includes(takenOutSearchQuery.toLowerCase()) ||
                row.dou_expiry
                    ?.toLowerCase()
                    .includes(takenOutSearchQuery.toLowerCase());

            const matchesContractNo =
                !contractNo ||
                row.contract_no
                    ?.toLowerCase()
                    .includes(contractNo.toLowerCase());

            const matchesAccountName =
                !filters.accountName ||
                row.account_name
                    ?.toLowerCase()
                    .includes(filters.accountName.toLowerCase());

            const matchesProject =
                !filters.project ||
                row.property_name
                    ?.toLowerCase()
                    .includes(filters.project.toLowerCase());

            const matchesFinancing =
                !filters.financing ||
                row.financing?.toLowerCase().trim() ===
                    filters.financing?.toLowerCase().trim();

            const matchesDateFilter = (() => {
                if (!filters.dateFilter || !filters.date) return true;

                const dateFieldToUse =
                    filters.dateFilter === "Takeout Date"
                        ? row.take_out_date
                        : row.dou_expiry;
                if (!dateFieldToUse) return false;

                const dateToCheck =
                    takenOutAppliedFilters.dateFilter === "Takeout Date"
                        ? new Date(row.take_out_date)
                        : new Date(row.dou_expiry);

                if (isNaN(dateToCheck)) return false;
                try {
                    const selectedDate = new Date(filters.date);
                    if (isNaN(selectedDate.valueOf())) return true;

                    return (
                        dateToCheck.toDateString() ===
                        selectedDate.toDateString()
                    );
                } catch (e) {
                    return false;
                }
            })();

            return (
                matchesSearchQuery &&
                matchesContractNo &&
                matchesAccountName &&
                matchesProject &&
                matchesFinancing &&
                matchesDateFilter
            );
        });
    }, [takenOutTableRows, takenOutSearchQuery, takenOutAppliedFilters]);

    const totalPages = useMemo(() => {
        if (!Array.isArray(takenOutFilteredRows)) {
            return 0;
        }
        return Math.ceil(takenOutFilteredRows.length / rowsPerPage);
    }, [takenOutFilteredRows.length, rowsPerPage]);

    useEffect(() => {
        if (takenOutCurrentPage > totalPages) {
            setTakenOutCurrentPage(totalPages > 0 ? totalPages : 1);
        } else if (takenOutCurrentPage < 1) {
            setTakenOutCurrentPage(1);
        }
    }, [totalPages, takenOutCurrentPage, setTakenOutCurrentPage]);

    const safeCurrentPage =
        Math.max(1, Math.min(takenOutCurrentPage, totalPages)) || 1;
    const takenOutIndexOfFirstRow = (safeCurrentPage - 1) * rowsPerPage;
    const takenOutIndexOfLastRow = safeCurrentPage * rowsPerPage;
    const takenOutCurrentData = useMemo(() => {
        if (!Array.isArray(takenOutFilteredRows)) {
            return [];
        }

        const startIndex = (takenOutCurrentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        return takenOutFilteredRows.slice(startIndex, endIndex);
    }, [takenOutFilteredRows, takenOutCurrentPage, rowsPerPage]);

    useEffect(() => {
        fetchMasterList();
    }, []);

    const masterListFilteredRows = useMemo(() => {
        if (!Array.isArray(takenOutMasterListTableRows)) return [];
        const filters = takenOutMasterListAppliedFilters || {};

        return takenOutMasterListTableRows.filter((row) => {
            const searchQuery =
                takenOutMasterListSearchQuery?.toLowerCase() || "";

            const matchesSearchQuery =
                !searchQuery ||
                row.user?.toLowerCase().includes(searchQuery) ||
                row.contractNumber?.toLowerCase().includes(searchQuery) ||
                row.propertyName?.toLowerCase().includes(searchQuery) ||
                row.unitNumber?.toLowerCase().includes(searchQuery) ||
                row.finance?.toLowerCase().includes(searchQuery) ||
                row.takeOutdate?.toLowerCase().includes(searchQuery) ||
                row.douExpiry?.toLowerCase().includes(searchQuery);

            const matchesContractNo =
                !filters.contractNo ||
                row.contractNumber
                    ?.toLowerCase()
                    .includes(filters.contractNo.toLowerCase());

            const matchesAccountName =
                !filters.accountName ||
                row.user
                    ?.toLowerCase()
                    .includes(filters.accountName.toLowerCase());

            const matchesProject =
                !filters.project ||
                row.propertyName
                    ?.toLowerCase()
                    .includes(filters.project.toLowerCase());

            const matchesFinancing =
                !filters.financing ||
                row.finance?.toLowerCase().trim() ===
                    filters.financing?.toLowerCase().trim();

            const matchesDateFilter = (() => {
                if (!filters.dateFilter || !filters.date) return true;

                const dateFieldToUse =
                    filters.dateFilter === "Takeout Date"
                        ? row.takeOutdate
                        : row.douExpiry;
                if (!dateFieldToUse) return false;

                try {
                    const dateToCheck = new Date(dateFieldToUse);
                    const selectedFilterDate = new Date(filters.date);

                    if (isNaN(dateToCheck.valueOf())) return false;
                    if (isNaN(selectedFilterDate.valueOf())) return true;

                    return (
                        dateToCheck.toDateString() ===
                        selectedFilterDate.toDateString()
                    );
                } catch (e) {
                    return false;
                }
            })();

            return (
                matchesSearchQuery &&
                matchesContractNo &&
                matchesAccountName &&
                matchesProject &&
                matchesFinancing &&
                matchesDateFilter
            );
        });
    }, [
        takenOutMasterListTableRows,
        takenOutMasterListSearchQuery,
        takenOutMasterListAppliedFilters,
    ]);

    const masterListTotalPages = useMemo(() => {
        if (!Array.isArray(masterListFilteredRows)) return 0;
        return Math.ceil(masterListFilteredRows.length / rowsPerPage);
    }, [masterListFilteredRows, rowsPerPage]);

    useEffect(() => {
        const totalP = masterListTotalPages;
        if (takenOutMasterListCurrentPage > totalP && totalP > 0) {
            setTakenOutMasterListCurrentpage(totalP);
        } else if (takenOutMasterListCurrentPage < 1 && totalP >= 1) {
            setTakenOutMasterListCurrentpage(1);
        } else if (totalP === 0 && takenOutMasterListCurrentPage !== 1) {
            setTakenOutMasterListCurrentpage(1);
        }
    }, [
        masterListTotalPages,
        takenOutMasterListCurrentPage,
        setTakenOutMasterListCurrentpage,
    ]);

    const safeMasterListCurrentPage = useMemo(
        () =>
            Math.max(
                1,
                Math.min(
                    takenOutMasterListCurrentPage,
                    masterListTotalPages || 1
                )
            ),
        [takenOutMasterListCurrentPage, masterListTotalPages]
    );

    const masterListIndexOfFirstRow = useMemo(
        () => (safeMasterListCurrentPage - 1) * rowsPerPage,
        [safeMasterListCurrentPage, rowsPerPage]
    );
    const masterListIndexOfLastRow = useMemo(
        () => safeMasterListCurrentPage * rowsPerPage,
        [safeMasterListCurrentPage, rowsPerPage]
    );

    const masterListCurrentData = useMemo(() => {
        if (!Array.isArray(masterListFilteredRows)) return [];
        return masterListFilteredRows.slice(
            masterListIndexOfFirstRow,
            masterListIndexOfLastRow
        );
    }, [
        masterListFilteredRows,
        masterListIndexOfFirstRow,
        masterListIndexOfLastRow,
    ]);

    const [customerData, setCustomerData] = useState([]);
    const [customerDetails, setCustomerDetails] = useState([]);
    const [messageData, setMessageData] = useState([]);
    const [isTotalPages, setIsTotalPages] = useState(false);

    useEffect(() => {
        if (user && user.department && !isDepartmentInitialized) {
            setDepartment(
                user.department === "Customer Relations - Services"
                    ? "All"
                    : user.department
            );
            setIsDepartmentInitialized(true);
        }
    }, [user, isDepartmentInitialized]);

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    };
    // Load from sessionStorage on initial load
    useEffect(() => {
        const storedData = sessionStorage.getItem("userAccessData");
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                setUserAccessData(parsedData);
            } catch (error) {
                setUserAccessData([]);
            }
        }
    }, []);

    useEffect(() => {
        if (userAccessData) {
            const allPermissions = {};

            userAccessData.employeePermissions?.forEach((perm) => {
                allPermissions[perm.name] = perm.pivot;
            });

            userAccessData.departmentPermissions?.forEach((perm) => {
                allPermissions[perm.name] = perm.pivot;
            });

            setPermissions(allPermissions);
        }
    }, [userAccessData]);

    // Check if the user has permission to read
    const hasPermission = (permissionName) => {
        return permissions[permissionName]?.can_read || false;
    };

    //Check if the user has permission to write
    const canWrite = (permissionName) => {
        const inquiryPermissions =
            userAccessData?.employeePermissions?.find(
                (perm) => perm.name === permissionName
            ) ||
            userAccessData?.departmentPermissions?.find(
                (perm) => perm.name === permissionName
            );
        return inquiryPermissions?.pivot?.can_write || false;
    };

    const getAllConcerns = async () => {
        if (token) {
            setLoading(true);
            try {
                const searchParams = new URLSearchParams({
                    search: JSON.stringify(searchFilter),
                    page: currentPage + 1,
                    days: daysFilter || "",
                    status: statusFilter || "",
                    specificAssigneeCsr: specificAssigneeCsr || "",
                }).toString();

                const response = await apiService.get(
                    `/get-concern?${searchParams}`
                );

                setData(response.data.data);
                setDataCount(response.data.total);
                setPageCount(response.data.last_page);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const updateConcern = ({ id, ...dataToUpdate }) => {
        setData((prevData) =>
            prevData.map((concern) =>
                concern.id === id ? { ...dataToUpdate } : concern
            )
        );
    };

    const getBankName = async () => {
        /*  if (token) {
            try {
                const response = await apiService.get("get-transaction-bank");
                setBankList(response.data);
            } catch (error) {
                console.log("error retrieving banks", error);
            }
        } */
    };

    const getTransactions = async () => {
        /*  try {
            const searchParams = new URLSearchParams({
                page: currentPageTransaction + 1,
                bank_name: bankNames ? bankNames : null,
            }).toString();
            const response = await apiService.get(
                `get-transactions?${searchParams}`
            );
            setTransactions(response.data.data);
            setTransactionsPageCount(response.data.last_page);
        } catch (error) {
            console.error("Error fetching data: ", error);
        } */
    };

    const getMatches = async () => {
        /*  if (token) {
            try {
                const response = await apiService.get("get-matches");
                setMatchesData(response.data);
            } catch (error) {
                console.log("error uploading data", error);
            }
        } */
    };

    const getInvoices = async () => {
        /* try {
            const searchParams = new URLSearchParams({
                dueDate: filterDueDate ? filterDueDate : null,
                page: currentPageInvoices,
            });
            const response = await apiService.get(
                `get-invoices?${searchParams}`
            );
            setInvoices(response.data.data);
            setInvoicesPageCount(response.data.last_page);
        } catch (error) {
            console.log("error", error);
        } */
    };

    const fetchCategory = async () => {
        try {
            const response = await apiService.get("category-monthly", {
                params: {
                    department: department,
                    property: project,
                    month: month,
                    year: year,
                    startDate: startDate,
                    endDate: endDate,
                },
            });
            const result = response.data;

            // Aggregate data into a single "Other Concerns" entry for null or "Other Concerns"
            const aggregatedData = result.reduce((acc, item) => {
                const name = item.details_concern || "Other Concerns"; // Replace null with "Other Concerns"
                const existingIndex = acc.findIndex(
                    (entry) => entry.name === name
                );

                if (existingIndex > -1) {
                    // If "Other Concerns" already exists, add to its value
                    acc[existingIndex].value += item.total;
                } else {
                    // Otherwise, create a new entry
                    acc.push({
                        name: name,
                        value: item.total,
                    });
                }

                return acc;
            }, []);

            setDataCategory(aggregatedData);
        } catch (error) {
            console.log("Error retrieving data", error);
        }
    };

    const getPropertyNames = async () => {
        if (token) {
            try {
                const response = await apiService.get("properties/names");
                setPropertyNamesList(response.data);
            } catch (error) {
                console.log("Error retrieving data", error);
            }
        }
    };

    const fetchDataReport = async () => {
        try {
            const response = await apiService.get("report-monthly", {
                params: {
                    department: department,
                    property: project,
                    month: month,
                    year: year,
                    startDate: startDate,
                    endDate: endDate,
                },
            });
            const result = response.data;

            const filteredResult = result.filter(
                (item) =>
                    item.resolved !== 0 ||
                    item.unresolved !== 0 ||
                    item.closed !== 0
            );

            const formattedData = filteredResult.map((item) => ({
                name: `${item.month.toString().padStart(2, "0")}/${item.year
                    .toString()
                    .slice(-2)}`,
                Resolved: item.resolved,
                Unresolved: item.unresolved,
                Closed: item.closed,
            }));

            setDataSet(formattedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getInquiriesPerProperty = async () => {
        try {
            const response = await apiService.get("inquiries-property", {
                params: {
                    month: month,
                    property: project,
                    department: department,
                    year: year,
                    startDate: startDate,
                    endDate: endDate,
                },
            });
            const result = response.data;
            const formattedData = result.reduce((acc, item) => {
                const propertyName = item.property ? item.property : "N/A";
                const existingProperty = acc.find(
                    (entry) => entry.name === propertyName
                );
                if (existingProperty) {
                    existingProperty.resolved += item.resolved;
                    existingProperty.unresolved += item.unresolved;
                    existingProperty.closed += item.closed;
                } else {
                    acc.push({
                        name: propertyName,
                        resolved: item.resolved,
                        unresolved: item.unresolved,
                        closed: item.closed,
                    });
                }
                return acc;
            }, []);

            setDataPropery(formattedData);
        } catch (error) {
            console.log("error retrieving", error);
        }
    };

    const getInquiriesPerDepartment = async () => {
        try {
            const response = await apiService.get("inquiries-department", {
                params: {
                    month: month,
                    property: project,
                    department: department,
                    year: year,
                    startDate: startDate,
                    endDate: endDate,
                },
            });

            const departments = response.data.departments;
            const unassignedData = response.data.totalUnassigned;

            const formattedData = departments.map((item) => ({
                name: item.department,
                resolved: item.resolved,
                unresolved: item.unresolved,
                closed: item.closed,
            }));

            let concatData = [...formattedData];

            // Only push "Unassigned" data if it was requested explicitly
            if (
                unassignedData &&
                (department === "Unassigned" || department === "All")
            ) {
                const formattedDataUnassigned = {
                    name: "Unassigned",
                    resolved: unassignedData.total_resolved,
                    unresolved: unassignedData.total_unresolved,
                    closed: unassignedData.total_closed,
                };
                concatData.push(formattedDataUnassigned);
            }

            setDataDepartment(concatData);
        } catch (error) {
            console.log("error retrieving", error);
        }
    };

    const getCommunicationTypePerProperty = async () => {
        try {
            const response = await apiService.get(
                "communication-type-property",
                {
                    params: {
                        month: month,
                        property: project,
                        department: department,
                        year: year,
                        startDate: startDate,
                        endDate: endDate,
                    },
                }
            );
            const result = response.data;
            const formattedData = result.reduce((acc, item) => {
                const name = item.communication_type || "No Type";
                const existing = acc.find((entry) => entry.name === name);

                if (existing) {
                    existing.value += item.total;
                } else {
                    acc.push({ name, value: item.total });
                }

                return acc;
            }, []);

            setCommunicationTypeData(formattedData);
        } catch (error) {
            console.log("Error retrieving communication types:", error);
        }
    };

    const getInquiriesPerChannel = async () => {
        try {
            const response = await apiService.get("inquiries-channel", {
                params: {
                    month: month,
                    property: project,
                    department: department,
                    year: year,
                    startDate: startDate,
                    endDate: endDate,
                },
            });
            const result = response.data;

            const formattedData = result.map((item) => ({
                name: item.channels || "No Channel",
                value: item.total,
            }));

            setInquriesPerChannelData(formattedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const getSpecificInquiry = async () => {
        if (token) {
            try {
                const response = await apiService.get("specific-assignee");
                setSpecificInquiry(response.data);
            } catch (error) {
                console.log("error", error);
            }
        }
    };

    const getCount = async () => {
        if (token) {
            try {
                const response = await apiService.get("unread-count");
                setUnreadCount(response.data.unreadCount);
            } catch (error) {
                console.log("errror", error);
            }
        }
    };

    const getNotifications = async () => {
        if (token) {
            try {
                const response = await apiService.get(
                    `notifications?page=${notifCurrentPage + 1}&status=${
                        notifStatus || ""
                    }`
                );
                setNotifications(response.data.data);
                setNotifPageCount(response.data.last_page);
            } catch (error) {
                console.log("error retrieving", error);
            }
        }
    };

    const getNavBarData = async () => {
        if (token) {
            try {
                const encodedTicketId = encodeURIComponent(ticketId);

                const response = await apiService.get(
                    `navbar-data?ticketId=${encodedTicketId}`
                );

                const data = response.data;

                setNavBarData((prevData) => ({
                    ...prevData,
                    [ticketId]: data,
                }));
            } catch (error) {
                console.log("error retrieving", error);
            } /* finally {
                setLoading(false); 
            } */
        }
    };

    const getAssigneesPersonnel = async () => {
        if (ticketId) {
            try {
                const encodedTicketId = encodeURIComponent(ticketId);

                const response = await apiService.get(
                    `personnel-assignee?ticketId=${encodedTicketId}`
                );
                const data = response.data;

                setAssigneesPersonnel((prevAssigneesPersonnel) => ({
                    ...prevAssigneesPersonnel,
                    [ticketId]: data,
                }));
            } catch (error) {
                console.log("error");
            }
        }
    };

    const getConcernMessages = async () => {
        if (ticketId) {
            try {
                const encodedTicketId = encodeURIComponent(ticketId);

                const response = await apiService.get(
                    `get-concern-messages?ticketId=${encodedTicketId}`
                );
                const data = response.data;
                setConcernMessages((prevMessages) => ({
                    ...prevMessages,
                    [ticketId]: data,
                }));
            } catch (error) {
                console.log("error retrieving", error);
            }
        }
    };

    const getCountAllConcerns = async () => {
        try {
            const response = await apiService.get("get-count-all-concerns");
            setCountAllConcerns(response.data);
        } catch (error) {
            console.log("error retrieving", error);
        }
    };

    const getFullYear = async () => {
        try {
            const response = await apiService.get("concern-year");
            setFullYear(response.data);
        } catch (error) {
            console.log("error retrieving", error);
        }
    };

    const getMessages = async (ticketId) => {
        /* if (messages[id]) return; */
        try {
            const encodedTicketId = encodeURIComponent(ticketId);
            const response = await apiService.get(
                `get-message/${encodedTicketId}`
            );
            const data = response.data;
            setMessages((prevMessages) => ({
                ...prevMessages,
                [ticketId]: data,
            }));
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const getInquiryLogs = async (ticketId) => {
        /* if (messages[id]) return; */
        try {
            const encodedTicketId = encodeURIComponent(ticketId);
            const response = await apiService.get(
                `get-logs/${encodedTicketId}`
            );
            const data = response.data;
            setLogs((prevLogs) => ({
                ...prevLogs,
                [ticketId]: data,
            }));
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    // const    = useCallback(async () => {
    //     if (token) {
    //         try {
    //             setIsLoading(true);
    //             const response = await apiService.get(
    //                 "get-pricing-master-lists"
    //             );
    //             setPricingMasterLists(response.data);
    //         } catch (error) {
    //             console.error("Error fetching pricing master lists:", error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    // }, []);

    // const getPaymentSchemes = useCallback(async () => {
    //     if (token) {
    //         try {
    //             const response = await apiService.get("get-payment-schemes");

    //             setPaymentSchemes(response.data);
    //         } catch (error) {
    //             console.error("Error fetching data:", error);
    //         }
    //     }
    // }, []);
    // const getPropertyFloors = useCallback(async (towerPhaseId) => {

    //     if (!propertyFloors[towerPhaseId] && towerPhaseId && token) {
    //         try {
    //             setIsLoading(true);
    //             const response = await apiService.get(
    //                 `property-floors/${towerPhaseId}`
    //             );
    //             return response.data; // Return the data
    //             // Merge the new floors data with existing propertyFloors
    //             // setPropertyFloors((prev) => ({
    //             //     ...prev,
    //             //     [towerPhaseId]: response.data, // Store floors based on towerPhaseId
    //             // }));
    //         } catch (error) {
    //             console.error("Error fetching property floors:", error);
    //             return null;
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    // }, []); //get property floors

    // const getPropertyUnits = async (towerPhaseId, selectedFloor) => {
    //     if (token || selectedFloor || towerPhaseId) {
    //         try {
    //             setIsLoading(true);
    //             const response = await apiService.post("property-units", {
    //                 towerPhaseId,
    //                 selectedFloor,
    //             });
    //             setPropertyUnits(response.data);
    //         } catch (error) {
    //             console.error("Error fetching property units:", error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    // }; //get property units

    // const getPropertyMaster = async (id) => {
    //     // if (token) {
    //     //     try {
    //     //         setIsLoading(true);
    //     //         const response = await apiService.get(
    //     //             `get-property-master/${id}`
    //     //         );

    //     //         return response.data;
    //     //     } catch (e) {
    //     //         console.error("Error fetching propertymaster data:", error);
    //     //     }
    //     // }
    // };

    const getBannerData = async () => {
        try {
            const response = await apiService.get("get-banner");
            setBannerLists(response.data.data);
        } catch (error) {
            console.log("error", error);
        }
    };

    // const getUserAccessData = async () => {
    //     try {
    //         const response = await apiService.get("get-user-access-data", { token });

    //         // Get existing data from sessionStorage
    //         const storedData = sessionStorage.getItem("userAccessData");
    //         const existingData = storedData ? JSON.parse(storedData) : {};

    //         // Merge the new data with the existing data
    //         const updatedData = {
    //             ...existingData, // Include existing data
    //             employeePermissions: [
    //                 ...(existingData.employeePermissions || []),
    //                 ...(response.data.employeePermissions || []),
    //             ],
    //             departmentPermissions: [
    //                 ...(existingData.departmentPermissions || []),
    //                 ...(response.data.departmentPermissions || []),
    //             ],
    //         };

    //         // Remove duplicates based on IDs (optional, for clean data)
    //         const uniqueById = (arr, key) =>
    //             [...new Map(arr.map((item) => [item[key], item])).values()];
    //         updatedData.employeePermissions = uniqueById(
    //             updatedData.employeePermissions,
    //             "id"
    //         );
    //         updatedData.departmentPermissions = uniqueById(
    //             updatedData.departmentPermissions,
    //             "id"
    //         );

    //         // Save the updated data to sessionStorage
    //         sessionStorage.setItem("userAccessData", JSON.stringify(updatedData));

    //         // Update the state
    //         setUserAccessData(updatedData);
    //     } catch (error) {
    //         console.log("error", error);
    //     }
    // };

    // useEffect(() => {
    //     getPropertyUnits(towerPhaseId, selectedFloor);
    // }, [towerPhaseId, selectedFloor]);

    // useEffect(() => {
    //       ();
    //     getPaymentSchemes();
    // }, []);

    // useEffect(() => {
    //     if (towerPhaseId) {
    //         getPropertyFloors(towerPhaseId);
    //     }
    // }, [towerPhaseId, token]);

    // useEffect(() => {
    //     getPaymentSchemes();
    // }, [token]);
    useEffect(() => {
        if (token) {
            const getData = async () => {
                const response = await apiService.get("user");
                setUser(response.data);
            };
            getData();
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            const getEmployeeData = async () => {
                const response = await apiService.get("employee-list");
                setAllEmployees(response.data);
            };
            getEmployeeData();
            getPropertyNames();
        }
    }, [token]);

    /* useEffect(() => {
        getAllConcerns();
    }, [
        currentPage,
        daysFilter,
        token,
        statusFilter,
        searchFilter,
        hasAttachments,
        specificAssigneeCsr,
    ]); */

    useEffect(() => {
        getBankName();
        getTransactions();
        // getUserAccessData();
    }, [currentPageTransaction, bankNames]);

    useEffect(() => {
        getInvoices();
    }, [currentPageInvoices, filterDueDate]);

    /*  useEffect(() => {
         getNotifications();
     }, [notifCurrentPage, notifStatus, token]); */

    useEffect(() => {
        if (ticketId) {
            getMessages(ticketId);
            getInquiryLogs(ticketId);
            getConcernMessages();
            getAssigneesPersonnel();
            /* getNavBarData(); */
        }
    }, [ticketId]);

    /* useEffect(() => {
        getCount();
    }, [unreadCount, token]); */

    // useEffect(() => { }, [user, token]);

    useEffect(() => {
        getSpecificInquiry();
    }, []);

    //* For Report Page
    useEffect(() => {
        const fetchData = async () => {
            try {
                await getInquiriesPerDepartment();
                await fetchDataReport();
                await getInquiriesPerProperty();
                await fetchCategory();
                await getCommunicationTypePerProperty();
                await getInquiriesPerChannel();

                await getFullYear();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [
        department,
        propertyMonth,
        month,
        project,
        year,
        startDate,
        endDate,
        departmentStatusYear,
        inquiriesPerCategoryYear,
        inquiriesPerPropertyYear,
        communicationTypeYear,
        communicationTypeMonth,
        inquiriesPerChannelMonth,
        inquiriesPerChanelYear,
    ]);

    return (
        <StateContext.Provider
            value={{
                user,
                token,
                setUser,
                setToken,
                currentPage,
                setCurrentPage,
                data,
                pageCount,
                getAllConcerns,
                setMessages,
                messages,
                ticketId,
                setTicketId,
                daysFilter,
                getMessages,
                setDaysFilter,
                getInquiryLogs,
                logs,
                setLogs,
                allEmployees,
                getBannerData,
                setStatusFilter,
                setNotifCurrentPage,
                notifPageCount,
                notifications,
                notifCurrentPage,
                getNotifications,
                setNotifStatus,
                unreadCount,
                setSearchFilter,
                setHasAttachments,
                hasAttachments,
                setMonth,
                month,
                fullYear,
                getFullYear,
                getCountAllConcerns,
                setCountAllConcerns,
                countAllConcerns,
                dataCategory,
                fetchCategory,
                propertyMonth,
                dataProperty,
                getInquiriesPerProperty,
                getInquiriesPerDepartment,
                dataDepartment,
                setDataDepartment,
                getCommunicationTypePerProperty,
                communicationTypeData,
                setCommunicationTypeData,
                setPropertyMonth,
                setCommunicationTypeMonth,
                communicationTypeMonth,
                setData,
                dataCount,
                setDataCount,
                searchFilter,
                statusFilter,
                specificInquiry,
                getCount,
                department,
                setDepartment,
                project,
                setProject,
                year,
                setYear,
                fetchDataReport,
                dataSet,
                pricingMasterLists,

                paymentSchemes,

                setPropertyId,
                propertyFloors,
                propertyId,
                floorPremiumsAccordionOpen,
                setFloorPremiumsAccordionOpen,
                selectedFloor,
                setSelectedFloor,
                propertyUnit,
                setPropertyUnits,
                towerPhaseId,
                setTowerPhaseId,
                isLoading,
                setPropertyFloors,
                concernMessages,
                setConcernMessages,
                concernId,
                setConcernId,
                getConcernMessages,
                setAssigneesPersonnel,
                assigneesPersonnel,
                getAssigneesPersonnel,
                propertyNamesList,
                invoices,
                bannerLists,
                transactions,
                currentPageTransaction,
                setCurrentPageTransaction,
                transactionsPageCount,
                getTransactions,
                getMatches,
                matchesData,
                invoicesPageCount,
                setInvoicesPageCount,
                currentPageInvoices,
                setCurrentPageInvoices,
                bankNames,
                setBankNames,
                bankList,
                getInvoices,
                filterDueDate,
                setFilterDueDate,
                notifStatus,
                updateConcern,
                loading,
                setDepartmentStatusYear,
                departmentStatusYear,
                setInquiriesPerCategoryYear,
                inquiriesPerCategoryYear,
                setInquiriesPerPropertyYear,
                inquiriesPerPropertyYear,
                setCommunicationTypeYear,
                communicationTypeYear,
                inquiriesPerChanelYear,
                setInquiriesPerChanelYear,
                inquiriesPerChannelMonth,
                setInquiriesPerChannelMonth,
                getInquiriesPerChannel,
                inquriesPerChannelData,
                navBarData,
                getNavBarData,
                setIsUserTypeChange,
                isUserTypeChange,
                userAccessData,
                setUserAccessData,
                hasPermission,
                setCustomerData,
                customerData,
                setCustomerDetails,
                customerDetails,
                setMessageData,
                messageData,
                currentPageCustomer,
                setCurrentPageCustomer,
                totalPagesCustomer,
                setTotalPagesCustomer,
                isTotalPages,
                setIsTotalPages,

                selectedOption,
                setSelectedOption,
                setActiveDayButton,
                activeDayButton,
                searchSummary,
                setSearchSummary,
                resultSearchActive,
                setResultSearchActive,
                daysActive,
                setDaysActive,
                setDepartmentValue,
                departmentValue,
                setProjectValue,
                projectValue,
                setYearValue,
                yearValue,
                setMonthValue,
                monthValue,
                startDateValue,
                setStartDateValue,
                endDateValue,
                setEndDateValue,
                startDate,
                setStartDate,
                endDate,
                setEndDate,
                setAssignedToMeActive,
                assignedToMeActive,
                setSpecificAssigneeCsr,
                specificAssigneeCsr,
                takenOutTableRows,
                setTakenOutTableRows,
                takenOutCurrentPage,
                setTakenOutCurrentPage,
                takenOutSearchQuery,
                setTakenOutSearchQuery,
                takenOutAppliedFilters,
                setTakenOutAppliedFilters,
                takenOutFilteredRows,
                takenOutIndexOfLastRow,
                takenOutIndexOfFirstRow,
                takenOutCurrentData,
                totalPages,
                safeCurrentPage,
                fetchTakenOutAccounts,
                setLoading,
                // masterList,
                // setMasterList,
                takenOutMasterListTableRows,
                setTakenOutMasterListTableRows,
                masterListLoading,
                fetchMasterList,
                masterListFilteredRows,
                masterListTotalPages,
                safeMasterListCurrentPage,
                masterListIndexOfFirstRow,
                masterListIndexOfLastRow,
                masterListCurrentData,
                takenOutMasterListCurrentPage,
                setTakenOutMasterListCurrentpage,
                takenOutMasterListSearchQuery,
                setTakenOutMasterListSearchQuery,
                takenOutMasterListAppliedFilters,
                setTakenOutMasterListAppliedFilters,
                assignee,
                setAssignee,
                accounts,
                fetchWorkOrderTypes,
                workOrderTypes,
                workOrders,
                fetchWorkOrders,
                fetchAccounts,
                canWrite,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
