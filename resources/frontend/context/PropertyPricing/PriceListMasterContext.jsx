import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { priceListMasterService } from '@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService';

const PropertyMasterContext = createContext();

export const PriceListMasterProvider = ({ children }) => {
    const [priceListMaster, setPriceListMaster] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // This function does the actual database fetch
    const fetchPropertyListMasters = useCallback(async (forceFetch = false) => {

        if (priceListMaster && !forceFetch) {
            return priceListMaster;
        }

        setIsLoading(true);
        try {
            const response = await priceListMasterService.getPriceListMasters();
            setPriceListMaster(response.data);
            setError(null);
            return response.data;
        } catch (error) {
            setError(error.message);
            console.error("Error fetching property master list:", error);
        } finally {
            setIsLoading(false);
        }
    }, [priceListMaster]);

  
    const value = {
        priceListMaster,
        isLoading,
        error,
        fetchPropertyListMasters
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
        throw new Error('usePriceListMaster must be used within a PropertyMasterProvider');
    }
    return context;
};