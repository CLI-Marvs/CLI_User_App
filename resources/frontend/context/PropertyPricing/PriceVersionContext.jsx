import React, { createContext, useContext, useState, useCallback } from "react";
import { priceVersionService } from "@/component/servicesApi/apiCalls/propertyPricing/priceVersion/priceVersionService";
import usePaginatedFetch from "@/component/layout/propertyandpricingpage/hooks/usePaginatedFetch";
import { defaultFilters } from "@/context/PropertyPricing/PriceListMasterContext";

const PriceVersionContext = createContext();

const priceVersionFilters = {
    ...defaultFilters,
    version: "",
    effectiveDate: null,
};
export const PriceVersionProvider = ({ children }) => {
    // const [isFetchingPriceVersions, setIsFetchingPriceVersions] =
    //     useState(false);
    // const [priceVersion, setPriceVersion] = useState([]);

    // const getPriceVersions = useCallback(
    //     async (forceFetch = false, setLoading = true) => {
    //         if (priceVersion.length > 0 && !forceFetch) {
    //             return priceVersion;
    //         }

    //         try {
    //             if (setLoading) setIsFetchingPriceVersions(true);
    //             const response = await priceVersionService.getPriceVersions();
    //             setPriceVersion(response?.data.data);

    //             return response;
    //         } catch (error) {
    //             console.error("Error getting price versions:", error);
    //             throw error;
    //         } finally {
    //             if (setLoading) setIsFetchingPriceVersions(false);
    //         }
    //     },
    //     [priceVersion]
    // );
    const [searchFilters, setSearchFilters] = useState(priceVersionFilters);
    const {
        data,
        isLoading,
        error,
        pageState,
        setPageState,
        fetchData,
        setAppliedFilters,
        isFirstLoad,
        applySearch,
        refreshPage,
    } = usePaginatedFetch(
        priceVersionService.getPriceVersions,
        priceVersionFilters
    );

    const value = {
        // isFetchingPriceVersions,
        // getPriceVersions,
        // priceVersion,
        data,
        isLoading,
        error,
        pageState,
        setPageState,
        fetchData,
        setAppliedFilters,
        isFirstLoad,
        applySearch,
        refreshPage,
        searchFilters,
        setSearchFilters
    };
    return (
        <PriceVersionContext.Provider value={value}>
            {children}
        </PriceVersionContext.Provider>
    );
};

export const usePriceVersion = () => {
    const context = useContext(PriceVersionContext);
    if (!context) {
        throw new Error(
            "usePriceVersion must be used within a PriceVersionProvider"
        );
    }
    return context;
};
