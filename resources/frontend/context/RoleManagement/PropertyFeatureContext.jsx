import React, { createContext, useContext, useState } from "react";
import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";
import useDataFetching from "@/component/layout/propertyandpricingpage/hooks/useDataFetching";

const PropertyFeatureContext = createContext();

export const defaultFilters = {
    propertyName: "",
    entity: "",
    feature: "",
};

export const PropertyFeatureProvider = ({ children }) => {
    const [isPropertyFeatureActive, setIsPropertyFeatureActive] =
        useState(false);

    const {
        data: propertyFeatures,
        isLoading,
        pagination,
        filters,
        updateFilters,
        updatePagination,
        resetToDefaults,
        fetchData,
        refreshData,
        setError,
        error,
        setFilters,
    } = useDataFetching({
        fetchFunction: propertyMasterService.getPropertiesByFeatures,
        defaultFilters,
        enabled: isPropertyFeatureActive,
    });

    const value = {
        propertyFeatures,
        isLoading,
        pagination,
        filters,
        setFilters,
        updateFilters,
        updatePagination,
        resetToDefaults,
        fetchData,
        refreshData,
        isPropertyFeatureActive,
        setIsPropertyFeatureActive,
        setError,
        error
    };

    return (
        <PropertyFeatureContext.Provider value={value}>
            {children}
        </PropertyFeatureContext.Provider>
    );
};

const usePropertyFeature = () => {
    const context = useContext(PropertyFeatureContext);
    if (!context) {
        throw new Error(
            "propertyFeatures must be used within a PropertyFeatureProvider"
        );
    }
    return context;
};

export default usePropertyFeature;
