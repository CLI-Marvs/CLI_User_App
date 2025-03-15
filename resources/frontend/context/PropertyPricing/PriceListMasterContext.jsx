import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { priceListMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService";
import _ from "lodash";

const PropertyMasterContext = createContext();

const defaultFilters = {
    property: "",
    paymentScheme: "",
    date: null,
    status: "",
};

export const PriceListMasterProvider = ({ children }) => {
    const [priceListMaster, setPriceListMaster] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [previousFilters, setPreviousFilters] = useState([]);
    const [propertyMasterId, setPropertyMasterId] = useState(null);
    const [priceListMasterId, setPriceListMasterId] = useState(null);
    const [searchFilters, setSearchFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

    const fetchPropertyListMasters = useCallback(
        async (forceFetch = false, silentFetch = false, page) => {
            const isFilterChanged = !_.isEqual(appliedFilters, previousFilters);
            const isSamePage = page === currentPage;
            if (
                priceListMaster &&
                !forceFetch &&
                !isFilterChanged &&
                isSamePage
            ) {
                // Prevents unnecessary fetching
                return priceListMaster;
            }

            try {
                if (!silentFetch && isFirstLoad) {
                    setIsLoading(true);
                }
                const response =
                    await priceListMasterService.getPriceListMasters(
                        page,
                        10,
                        appliedFilters
                    );
                const { data, pagination } = response.data;
                setPriceListMaster({ data, pagination });
                setCurrentPage(pagination?.current_page);
                setError(null);
                setPreviousFilters(appliedFilters);

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
        [
            priceListMaster,
            currentPage,
            isFirstLoad,
            previousFilters,
            appliedFilters,
        ]
    );

    //Automatically fetch when `appliedFilters` or 'currentPage' changes
    useEffect(() => {
        fetchPropertyListMasters(true, false, currentPage);
    }, [currentPage, appliedFilters]);

    const applySearch = () => {
        setAppliedFilters(searchFilters);
        setCurrentPage(1);
    };

    const refreshPage = () => {
        setSearchFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
        setCurrentPage(1);
    };

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
        propertyMasterId,
        setPropertyMasterId,
        priceListMasterId,
        setPriceListMasterId,
        searchFilters,
        setSearchFilters,
        applySearch,
        refreshPage,
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
