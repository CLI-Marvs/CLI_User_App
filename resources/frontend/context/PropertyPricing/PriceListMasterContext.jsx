import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { priceListMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService";

const PropertyMasterContext = createContext();

export const PriceListMasterProvider = ({ children }) => {
    const [priceListMaster, setPriceListMaster] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [previousFilters, setPreviousFilters] = useState([]);

    const fetchPropertyListMasters = useCallback(
        async (
            forceFetch = false,
            silentFetch = false,
            page,
            searchFilters
        ) => {
            const isFilterChanged =
                JSON.stringify(searchFilters) !==
                JSON.stringify(previousFilters);
            const isSamePage = page === currentPage;
            if (
                priceListMaster &&
                !forceFetch &&
                !isFilterChanged &&
                isSamePage
            ) {
                return priceListMaster; // Prevents unnecessary fetching
            }

            try {
                if (!silentFetch && isFirstLoad) {
                    setIsLoading(true);
                }
                const response =
                    await priceListMasterService.getPriceListMasters(
                        page,
                        10,
                        searchFilters
                    );
                const { data, pagination } = response.data;
                setPriceListMaster({ data, pagination });
                setCurrentPage(pagination?.current_page);
                setError(null);
                setPreviousFilters(searchFilters);
                if (isFilterChanged) {
                    setPreviousFilters(searchFilters);
                }
                if (isFirstLoad) {
                    setIsFirstLoad(false);
                }

                return { data, pagination };
            } catch (error) {
                setPriceListMaster({ data: [], pagination: null });
                setError(error.message);
                console.error("Error fetching property master list:", error);
            } finally {
                if (!silentFetch) setIsLoading(false);
            }
        },
        [priceListMaster, currentPage, isFirstLoad, previousFilters]
    );

    useEffect(() => {
        fetchPropertyListMasters(true, false, currentPage);
    }, [currentPage]);

    const value = {
        priceListMaster,
        isLoading,
        error,
        fetchPropertyListMasters,
        setPriceListMaster,
        currentPage,
        setCurrentPage,
        isFirstLoad,
        previousFilters,
    };

    return (
        <PropertyMasterContext.Provider value={value}>
            {children}
        </PropertyMasterContext.Provider>
    );
};

export const usePriceListMaster = () => {
    const context = useContext(PropertyMasterContext);
    if (!context) {
        throw new Error(
            "usePriceListMaster must be used within a PropertyMasterProvider"
        );
    }
    return context;
};
