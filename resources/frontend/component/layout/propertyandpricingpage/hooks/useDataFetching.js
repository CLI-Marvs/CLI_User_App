import { useState, useCallback, useEffect } from "react";
import _ from "lodash";

const useDataFetching = ({
    fetchFunction,
    defaultFilters = {},
    extraParams = {},
    enabled = false,
    pageSize = 10,
}) => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
    });
    const [filters, setFilters] = useState(defaultFilters);
    const [previousFilters, setPreviousFilters] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasBeenFetched, setHasBeenFetched] = useState(false);

    const fetchData = useCallback(
        async (forceFetch = false, silent = false) => {
            const isFilterChanged = !_.isEqual(filters, previousFilters);

            if (
                data.length > 0 &&
                !forceFetch &&
                !isFilterChanged &&
                hasBeenFetched
            ) {
                return;
            }

            try {
                if (!silent) {
                    setIsLoading(true);
                }

                const response = await fetchFunction(
                    pagination.currentPage,
                    pageSize,
                    filters,
                    extraParams
                );
                const { data: newData, pagination: newPagination } =
                    response.data;

                setData(newData);
                setPagination({
                    currentPage: newPagination?.current_page ?? 1,
                    lastPage: newPagination?.last_page ?? 1,
                    total: newPagination?.total ?? 0,
                });
                setPreviousFilters(filters);
                setHasBeenFetched(true);
                setError(null);
            } catch (error) {
                const backendMessage =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message;
                setError(backendMessage);
            } finally {
                if (!silent) {
                    setIsLoading(false);
                }
            }
        },
        [pagination.currentPage, filters, extraParams, pageSize, hasBeenFetched]
    );

    const updateFilters = (newFilters) => {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        setFilters(newFilters);
        setHasBeenFetched(false);
    };

    const updatePagination = (newPage) => {
        setPagination((prev) => ({ ...prev, currentPage: newPage }));
        setHasBeenFetched(false);
    };

    const resetToDefaults = () => {
        setFilters(defaultFilters);
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        setHasBeenFetched(false);
    };

    const refreshData = useCallback(async () => {
        setHasBeenFetched(false);
        return await fetchData(true);
    }, [fetchData]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, pagination.currentPage, filters]);

    return {
        data,
        isLoading,
        error,
        pagination,
        filters,
        updateFilters,
        updatePagination,
        resetToDefaults,
        fetchData,
        refreshData,
        setFilters,
    };
};

export default useDataFetching;
