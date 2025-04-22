import { useEffect } from "react";

const usePagination = (fetchData, contextState, contextSetter) => {
    const { currentPage, filters } = contextState;

    const getData = async () => {
        try {
            const response = await fetchData(currentPage, filters);

            contextSetter((prev) => ({
                ...prev,
                data: response.data,
                totalPages: response.last_page,
                loading: false
            }));
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    useEffect(() => {
        getData();
    }, [currentPage, filters]);

    const handlePageClick = (data) => {
        contextSetter((prev) => ({
            ...prev,
            currentPage: data.selected,
        }));
    };

    const setFilters = (newFilters) => {
        contextSetter((prev) => ({
            ...prev,
            filters: newFilters,
            currentPage: 0,
        }));
    };

    return {
        handlePageClick,
        setFilters,
        getData
    };
};

export default usePagination;
