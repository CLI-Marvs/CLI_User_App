import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
} from "react";
import apiService from "../../../resources/frontend/component/servicesApi/apiService";

const MyWorkOrdersContext = createContext();

export const MyWorkOrdersProvider = ({ children }) => {
    const [workOrderGroups, setWorkOrderGroups] = useState([]);
    const [workOrdersLoading, setWorkOrdersLoading] = useState(true);
    const [workOrdersError, setWorkOrdersError] = useState(null);
    const [workOrdersCurrentPage, setWorkOrdersCurrentPage] = useState(1);
    const [workOrdersPerPage, setWorkOrdersPerPage] = useState(10);
    const [workOrdersTotal, setWorkOrdersTotal] = useState(0);
    const [workOrdersSortBy, setWorkOrdersSortBy] = useState("created_at");
    const [workOrdersSortOrder, setWorkOrdersSortOrder] = useState("desc");
    const [workOrderGroupsLastFetched, setWorkOrderGroupsLastFetched] =
        useState(null);

    // Fetch all work order groups (no pagination, matches DocumentManagementContext)
    const hasFetchedRef = useRef(false);

    const fetchWorkOrderGroups = useCallback(
        async (force = false, filters = {}) => {
            const now = Date.now();
            const tenMinutes = 10 * 60 * 1000;

            if (
                !force &&
                hasFetchedRef.current &&
                workOrderGroupsLastFetched &&
                now - workOrderGroupsLastFetched < tenMinutes &&
                Object.keys(filters).length === 0 // Only skip if no filters are applied
            ) {
                setWorkOrdersLoading(false);
                return;
            }
            setWorkOrdersLoading(true);
            setWorkOrdersError(null);
            try {
                // Build query parameters
                const params = {};
                if (filters.status) {
                    params.status = filters.status;
                }

                const response = await apiService.get(
                    "/work-orders/get-work-order-groups",
                    { params }
                );
                const data = response.data?.data || [];
                setWorkOrderGroups(Array.isArray(data) ? data : []);
                setWorkOrdersTotal(Array.isArray(data) ? data.length : 0);
                setWorkOrderGroupsLastFetched(Date.now());
                hasFetchedRef.current = true;
            } catch (err) {
                setWorkOrdersError(
                    err.message || "Failed to fetch work orders"
                );
                setWorkOrderGroups([]);
                setWorkOrdersTotal(0);
            } finally {
                setWorkOrdersLoading(false);
            }
        },
        [workOrderGroupsLastFetched]
    );

    // Manual force refresh function
    const forceRefreshWorkOrders = useCallback(
        async (filters = {}) => {
            await fetchWorkOrderGroups(true, filters);
        },
        [fetchWorkOrderGroups]
    );

    return (
        <MyWorkOrdersContext.Provider
            value={{
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
            }}
        >
            {children}
        </MyWorkOrdersContext.Provider>
    );
};

export const useMyWorkOrdersContext = () => useContext(MyWorkOrdersContext);
