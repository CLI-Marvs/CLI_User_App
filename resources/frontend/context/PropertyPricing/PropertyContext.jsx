import React, {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";
import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
    const [propertyNamesList, setPropertyNamesList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [propertyMasterId, setPropertyMasterId] = useState(null);  

    // This function does the actual database fetch
    const fetchPropertyNamesWithIds = async () => {
        try {
            const response =
                await propertyMasterService.getPropertyNamesWithIds();
 
            // Convert object to array of objects and sort
            const sortedProperties = Object.entries(response.data)
                .map(([id, name]) => ({ id, name }))
                .sort((a, b) => a.name.localeCompare(b.name));
            setPropertyNamesList(sortedProperties);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPropertyNamesWithIds();
    }, []);

    const value = {
        propertyNamesList,
        isLoading,
        error,
        fetchPropertyNamesWithIds,
        propertyMasterId,
        setPropertyMasterId,
    };

    return (
        <PropertyContext.Provider value={value}>
            {children}
        </PropertyContext.Provider>
    );
};

export const useProperty = () => {
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error("useProperty must be used within a PropertyProvider");
    }
    return context;
};
