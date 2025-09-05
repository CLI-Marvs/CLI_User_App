import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import apiService from "../../component/servicesApi/apiService";
import { update } from "lodash";

const DocumentManagementContext = createContext({});

export const DocumentManagementProvider = ({ children }) => {
    // --- Document Management State ---
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

    // Helper to normalize dates to 'YYYY-MM-DD' without timezone shift
    const normalizeDate = (val) => {
        if (!val) return null;
        if (val instanceof Date) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, "0");
            const d = String(val.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        }
        const str = String(val).trim();
        const m = str.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
        if (m) return `${m[1]}-${m[2]}-${m[3]}`;
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear();
            const mm = String(parsed.getMonth() + 1).padStart(2, "0");
            const dd = String(parsed.getDate()).padStart(2, "0");
            return `${y}-${mm}-${dd}`;
        }
        return null;
    };

    // --- Fetchers ---
    const fetchTakenOutAccounts = async () => {
        try {
            const response = await apiService.get("/taken-out-accounts");
            setTakenOutTableRows(response.data.data || []);
        } catch (error) {
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
                category: row.category,
                to_year: row.to_year,
                to_month: row.to_month,
            }));
            setTakenOutMasterListTableRows(mappedRows);
        } catch (error) {
            setTakenOutMasterListTableRows([]);
        } finally {
            setMasterListLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTakenOutAccounts();
        fetchMasterList();
    }, [fetchMasterList]);

    // --- Filtering and Pagination ---
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
            // Date filter (exact match on selected date)
            let matchesDate = true;
            if (filters.dateFilter && filters.date) {
                const target = normalizeDate(filters.date);
                if (filters.dateFilter === "Takeout Date") {
                    matchesDate = normalizeDate(row.take_out_date) === target;
                } else if (filters.dateFilter === "DOU Expiry") {
                    matchesDate = normalizeDate(row.dou_expiry) === target;
                }
            }
            return (
                matchesSearchQuery &&
                matchesContractNo &&
                matchesAccountName &&
                matchesProject &&
                matchesFinancing &&
                matchesDate
            );
        });
    }, [takenOutTableRows, takenOutSearchQuery, takenOutAppliedFilters]);

    const totalPages = useMemo(() => {
        if (!Array.isArray(takenOutFilteredRows)) return 0;
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
        if (!Array.isArray(takenOutFilteredRows)) return [];
        const startIndex = (takenOutCurrentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return takenOutFilteredRows.slice(startIndex, endIndex);
    }, [takenOutFilteredRows, takenOutCurrentPage, rowsPerPage]);

    // --- Master List Filtering ---
    const masterListFilteredRows = useMemo(() => {
        if (!Array.isArray(takenOutMasterListTableRows)) return [];
        const filters = takenOutMasterListAppliedFilters || {};
        const searchQuery = takenOutMasterListSearchQuery?.toLowerCase() || "";
        return takenOutMasterListTableRows.filter((row) => {
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
            // Date filter
            let matchesDate = true;
            if (filters.dateFilter && filters.date) {
                const target = normalizeDate(filters.date);
                if (filters.dateFilter === "Takeout Date") {
                    matchesDate = normalizeDate(row.takeOutdate) === target;
                } else if (filters.dateFilter === "DOU Expiry") {
                    matchesDate = normalizeDate(row.douExpiry) === target;
                }
            }
            return (
                matchesSearchQuery &&
                matchesContractNo &&
                matchesAccountName &&
                matchesProject &&
                matchesFinancing &&
                matchesDate
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

    // --- File Manager Accounts State ---
    const [accounts, setAccounts] = useState([]);
    const [isAccountsLoading, setIsAccountsLoading] = useState(false);
    const [accountsError, setAccountsError] = useState(null);

    // Fetch all accounts with their files structure
    const fetchAllAccounts = useCallback(async () => {
        setIsAccountsLoading(true);
        setAccountsError(null);

        try {
            const response = await apiService.get("/file-manager/accounts");

            if (response.data?.success) {
                const data = Array.isArray(response.data.data)
                    ? response.data.data
                    : [];

                if (data.length > 0) {
                    const normalizedAccounts = data.map((account) => ({
                        ...account,
                        steps: Array.isArray(account.steps)
                            ? account.steps
                            : [],
                        milestones: Array.isArray(account.milestones)
                            ? account.milestones
                            : [],
                    }));
                    setAccounts(normalizedAccounts);
                } else {
                    // No data in DB
                    setAccounts([]);
                    console.warn("No accounts found in the database.");
                }
            } else {
                throw new Error(
                    response.data?.message || "Failed to fetch accounts"
                );
            }
        } catch (err) {
            setAccounts([]);
            setAccountsError(err.message || "Failed to fetch accounts");
        } finally {
            setIsAccountsLoading(false);
        }
    }, []);

    // Search accounts
    const searchAccounts = useCallback(
        async (searchQuery) => {
            if (!searchQuery.trim()) {
                fetchAllAccounts();
                return;
            }
            setIsAccountsLoading(true);
            setAccountsError(null);
            try {
                const response = await apiService.get(
                    `/file-manager/accounts/search?search=${encodeURIComponent(
                        searchQuery
                    )}`
                );
                if (response.data.success) {
                    const normalizedAccounts = response.data.data.map(
                        (account) => ({
                            ...account,
                            steps: account.steps || [],
                            milestones: account.milestones || [],
                        })
                    );
                    setAccounts(normalizedAccounts);
                } else {
                    throw new Error(
                        response.data.message || "Failed to search accounts"
                    );
                }
            } catch (err) {
                setAccountsError(err.message || "Failed to search accounts");
            } finally {
                setIsAccountsLoading(false);
            }
        },
        [fetchAllAccounts]
    );
    // --- Work Order State ---
    const [assignee, setAssignee] = useState([]);
    const [workOrderTypes, setWorkOrderTypes] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [workOrderGroups, setWorkOrderGroups] = useState([]);
    const [workOrdersLoading, setWorkOrdersLoading] = useState(true);
    const [workOrdersError, setWorkOrdersError] = useState(null);
    const [workOrdersCurrentPage, setWorkOrdersCurrentPage] = useState(1);
    const [workOrdersPerPage, setWorkOrdersPerPage] = useState(6);
    const [workOrdersTotal, setWorkOrdersTotal] = useState(0);
    const [workOrdersSortBy, setWorkOrdersSortBy] = useState("created_at");
    const [workOrdersSortOrder, setWorkOrdersSortOrder] = useState("desc");

    // --- Work Order Fetchers ---
    const fetchWorkOrders = useCallback(async () => {
        try {
            const response = await apiService.get(
                "/work-orders/get-work-orders"
            );
            setWorkOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch work orders:", error);
        }
    }, []);

    const fetchWorkOrderGroups = useCallback(async () => {
        try {
            const response = await apiService.get(
                "/work-orders/get-work-order-groups"
            );
            setWorkOrderGroups(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch work order groups:", error);
            setWorkOrderGroups([]);
        }
    }, []);

    const fetchWorkOrderTypes = useCallback(async () => {
        try {
            const response = await apiService.get(
                "/work-orders/work-order-types"
            );
            setWorkOrderTypes(response.data.data);
        } catch (error) {
            console.error("Failed to fetch work order types:", error);
        }
    }, []);

    const fetchAccounts = useCallback(async () => {
        try {
            const response = await apiService.get(
                "/taken-out-accounts/get-masterlist"
            );
            setAccounts(response.data);
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
        }
    }, []);

    const getAssignee = useCallback(async () => {
        try {
            const response = await apiService.get("/work-orders/get-assignee");
            setAssignee(response.data);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    }, []);

    // Initialize work order data
    useEffect(() => {
        getAssignee();
        fetchAccounts();
        fetchWorkOrderTypes();
        fetchWorkOrders();
    }, [getAssignee, fetchAccounts, fetchWorkOrderTypes, fetchWorkOrders]);

    // --- Additional Work Order/Account Fetchers ---
    // Paginated work order fetcher for advanced use cases
    const fetchWorkOrdersPaginated = useCallback(
        async (
            page = workOrdersCurrentPage,
            perPage = workOrdersPerPage,
            sortBy = workOrdersSortBy,
            sortOrder = workOrdersSortOrder
        ) => {
            setWorkOrdersLoading(true);
            setWorkOrdersError(null);
            try {
                const response = await apiService.get("/my-workorders", {
                    params: {
                        page,
                        per_page: perPage,
                        sortBy,
                        sortOrder,
                    },
                });
                // Group by work_order_group_id
                const grouped = Object.values(
                    (response.data.data || []).reduce((acc, wo) => {
                        const groupId = wo.work_order_group_id || "ungrouped";
                        if (!acc[groupId]) {
                            acc[groupId] = {
                                id: groupId,
                                due_date: wo.group_due_date,
                                status: wo.group_status,
                                updated_at: wo.group_updated_at,
                                work_orders: [],
                            };
                        }
                        acc[groupId].work_orders.push(wo);
                        return acc;
                    }, {})
                );
                setWorkOrderGroups(grouped);
                setWorkOrdersTotal(response.data.total);
                setWorkOrdersLoading(false);
            } catch (err) {
                setWorkOrdersError(
                    "Failed to fetch work orders. Please try again."
                );
                setWorkOrdersLoading(false);
            }
        },
        [
            workOrdersCurrentPage,
            workOrdersPerPage,
            workOrdersSortBy,
            workOrdersSortOrder,
        ]
    );

    return (
        <DocumentManagementContext.Provider
            value={{
                // File Manager Accounts
                accounts,
                setAccounts,
                isAccountsLoading,
                setIsAccountsLoading,
                accountsError,
                setAccountsError,
                fetchAllAccounts,
                searchAccounts,
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
                // Work Orders
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
                fetchWorkOrders,
                fetchWorkOrderGroups,
                fetchWorkOrderTypes,
                fetchAccounts,
                getAssignee,
                fetchWorkOrdersPaginated,
                // Work Order state
                assignee,
                setAssignee,
                workOrderTypes,
                setWorkOrderTypes,
                workOrders,
                setWorkOrders,
            }}
        >
            {children}
        </DocumentManagementContext.Provider>
    );
};

export const useDocumentManagementContext = () =>
    useContext(DocumentManagementContext);
