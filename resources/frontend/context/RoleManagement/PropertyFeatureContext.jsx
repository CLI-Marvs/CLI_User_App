import React, { createContext, useContext, useState, useCallback } from "react";
import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";

const PropertyFeatureContext = createContext();

export const PropertyFeatureProvider = ({ children }) => {
    const [propertyFeatures, setPropertyFeatures] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPropertyFeatures = useCallback(
        async (forceFetch = false) => {
            if (
                propertyFeatures &&
                propertyFeatures.length > 0 &&
                !forceFetch
            ) {
                return propertyFeatures;
            }

            setIsLoading(true);
            try {
                const response =
                    await propertyMasterService.getPropertiesByFeatures();
                setPropertyFeatures(response.data);
            } catch (error) {
                console.error("Error fetching property features:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [propertyFeatures]
    );


    const value = {
        propertyFeatures,
        setIsLoading,
        isLoading,
        fetchPropertyFeatures,
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
