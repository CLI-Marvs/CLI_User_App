import { createContext, useContext, useState } from "react";
import { priceListMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService";
import _ from "lodash";
import usePaginatedFetch from "@/component/layout/propertyandpricingpage/hooks/usePaginatedFetch";

const PropertyMasterContext = createContext();

export const defaultFilters = {
    property: "",
    paymentScheme: "",
    date: null,
    status: "",
};

export const PriceListMasterProvider = ({ children }) => {
    const [propertyMasterId, setPropertyMasterId] = useState(null); //TODO: move propertyMasterId t property context
    const [priceListMasterId, setPriceListMasterId] = useState(null);
    const [searchFilters, setSearchFilters] = useState(defaultFilters);
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
        priceListMasterService.getPriceListMasters,
        defaultFilters
    );

    const value = {
        data,
        isLoading,
        error,
        pageState,
        setPageState,
        fetchData,
        setAppliedFilters,
        isFirstLoad,
        searchFilters,
        setSearchFilters,
        applySearch,
        refreshPage,
        defaultFilters,
        propertyMasterId,
        setPropertyMasterId,
        priceListMasterId,
        setPriceListMasterId,
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
