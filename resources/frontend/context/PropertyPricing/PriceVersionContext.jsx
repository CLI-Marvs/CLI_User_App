import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { priceVersionService } from "@/component/servicesApi/apiCalls/propertyPricing/priceVersion/priceVersionService";

const PriceVersionContext = createContext();

export const PriceVersionProvider = ({ children }) => {
    const [isFetchingpriceVersions, setIsFetchingpriceVersions] =
        useState(false);
    const [priceVersion, setPriceVersion] = useState([]);

    const getPriceVersions = useCallback(
        async (forceFetch = false, setLoading = true) => {
            if (priceVersion && !forceFetch) {
                return priceVersion;
            }

            try {
                if (setLoading) setIsFetchingpriceVersions(true);
                const response = await priceVersionService.getPriceVersions();
                setPriceVersion(response?.data.data);
                
                return response;
            } catch (error) {
                console.error("Error getting price versions:", error);
                throw error;
            } finally {
                if (setLoading) setIsFetchingpriceVersions(false);
            }
        },
        [priceVersion]
    );
    
 
    const value = {
        isFetchingpriceVersions,
        getPriceVersions,
        priceVersion,
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
