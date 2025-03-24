import { useState, useCallback, useEffect } from "react";
import _ from "lodash";

const usePaginatedFetch = (fetchFunction, defaultFilters = {}) => {
    const [data, setData] = useState([]);
    const [pageState, setPageState] = useState({
        pagination: null,
        currentPage: 1,
    });
    const [filters, setFilters] = useState(defaultFilters);
    const [previousFilters, setPreviousFilters] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    // Fetch data from the API
    const fetchData = useCallback(
        async (
            forceFetch = false,
            silentFetch = false,
            page = pageState.currentPage
        ) => {
            const isFilterChanged = !_.isEqual(filters, previousFilters);
            const isSamePage = page === pageState.currentPage;

            if (
                data &&
                data.length &&
                !forceFetch &&
                !isFilterChanged &&
                isSamePage
            ) {
                return { data, pagination };
            }

            try {
                if (!silentFetch && isFirstLoad) {
                    setIsLoading(true);
                }

                const response = await fetchFunction(page, 10, filters);

                const { data: newData, pagination: newPagination } =
                    response.data;
                setData(newData);
                setPageState({
                    pagination: newPagination,
                    currentPage: newPagination?.current_page ?? 1,
                });
                setPreviousFilters(filters);
                setError(null);

                if (isFirstLoad) setIsFirstLoad(false);

                return { data: newData, pagination: newPagination };
            } catch (error) {
                setPageState({ pagination: null, currentPage: 1 });
                setError(error.message);
                console.error("Error fetching paginated data:", error);
            } finally {
                if (!silentFetch) setIsLoading(false);
            }
        },
        [pageState.currentPage, isFirstLoad, previousFilters, filters]
    );

    useEffect(() => {
        fetchData(true, false, pageState.currentPage);
    }, [pageState.currentPage, filters]);

    const applySearch = (newFilters) => {
        setFilters(newFilters);

        setPageState((prevState) => ({
            ...prevState,
            currentPage: 1,
        }));
    };

    const refreshPage = () => {
        setFilters(defaultFilters);
        setPageState((prevState) => ({
            ...prevState,
            currentPage: 1,
        }));
    };

    return {
        data,
        isLoading,
        error,
        fetchData,
        setPageState,
        pageState,
        applySearch,
        refreshPage,
        isFirstLoad,
        filters,
        setFilters,
    };
};

export default usePaginatedFetch;
