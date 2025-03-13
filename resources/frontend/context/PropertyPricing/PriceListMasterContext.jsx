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
    
    // This function does the actual database fetch
    const fetchPropertyListMasters = useCallback(
        async (forceFetch = false, silentFetch = false, page) => {
            if (priceListMaster && !forceFetch) {
                return priceListMaster;
            }

            try {
                
                if (!silentFetch) {
                    if (isFirstLoad) {
                        setIsLoading(true); 
                    }
                }
                const response =
                    await priceListMasterService.getPriceListMasters(page, 10);
                const { data, pagination } = response.data;
                setPriceListMaster((prev) => ({
                    data: prev?.data || [],
                    pagination: prev?.pagination || pagination,
                }));

                setTimeout(() => {
                    setPriceListMaster({ data, pagination });
                }, 200); 
                setCurrentPage(pagination?.current_page);
                setError(null);

                if (isFirstLoad) {
                    setIsFirstLoad(false);
                }

                return { data, pagination };
            } catch (error) {
                setError(error.message);
                console.error("Error fetching property master list:", error);
            } finally {
                if (!silentFetch) setIsLoading(false);
            }
        },
        [priceListMaster, currentPage, isFirstLoad]
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
        isFirstLoad
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
