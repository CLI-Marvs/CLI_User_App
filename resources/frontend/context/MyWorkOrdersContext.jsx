import React, { createContext, useContext, useState, useCallback } from "react";
import apiService from "../../../resources/frontend/component/servicesApi/apiService";

const MyWorkOrdersContext = createContext();

export const MyWorkOrdersProvider = ({ children }) => {
    const [workOrderGroups, setWorkOrderGroups] = useState([]);
    const [workOrdersLoading, setWorkOrdersLoading] = useState(true);
    const [workOrdersError, setWorkOrdersError] = useState(null);
    const [workOrdersCurrentPage, setWorkOrdersCurrentPage] = useState(1);
    const [workOrdersPerPage, setWorkOrdersPerPage] = useState(6);
    const [workOrdersTotal, setWorkOrdersTotal] = useState(0);
    const [workOrdersSortBy, setWorkOrdersSortBy] = useState("created_at");
    const [workOrdersSortOrder, setWorkOrdersSortOrder] = useState("desc");
    const [workOrderGroupsLastFetched, setWorkOrderGroupsLastFetched] =
        useState(null);

    // Fetch all work order groups (no pagination, matches DocumentManagementContext)
    const fetchWorkOrderGroups = useCallback(
        async (force = false) => {
            const now = Date.now();
            const tenMinutes = 10 * 60 * 1000;
            if (
                !force &&
                workOrderGroups &&
                workOrderGroups.length > 0 &&
                workOrderGroupsLastFetched &&
                now - workOrderGroupsLastFetched < tenMinutes
            ) {
                setWorkOrdersLoading(false);
                return;
            }
            setWorkOrdersLoading(true);
            setWorkOrdersError(null);
            try {
                const response = await apiService.get(
                    "/work-orders/get-work-order-groups"
                );
                setWorkOrderGroups(response.data.data || []);
                setWorkOrdersTotal(
                    Array.isArray(response.data.data)
                        ? response.data.data.length
                        : 0
                );
                setWorkOrderGroupsLastFetched(Date.now());
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
        [workOrderGroups, workOrderGroupsLastFetched]
    );

    // Manual force refresh function
    const forceRefreshWorkOrders = useCallback(async () => {
        await fetchWorkOrderGroups(true);
    }, [fetchWorkOrderGroups]);

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
