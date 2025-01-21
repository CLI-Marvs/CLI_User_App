import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";
import React, { useEffect, useState } from "react";

export const usePropertyNamesWithIds = () => {
    const [propertyNamesList, setPropertyNamesList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return {
        fetchPropertyNamesWithIds,
        propertyNamesList,
    };
};
