import { unitService } from "@/component/servicesApi/apiCalls/propertyPricing/unit/unitService";
import { useState } from "react";

export const useCountFloors = () => {
    const [floorCount, setFloorCount] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

 
    const fetchFloorCount = async (towerPhaseId, excelId) => {
        try {
            const response = await unitService.countFloor(
                towerPhaseId,
                excelId
            );

            // Convert object to array of objects and sort
            const sortedProperties = Object.entries(response.data)
                .map(([id, name]) => ({ id, name }))
                .sort((a, b) => a.name.localeCompare(b.name));
            setFloorCount(sortedProperties);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setIsLoading(false);
        }
    };
  

    return {
        fetchFloorCount,
        floorCount,
        isLoading,
        error,
    };
};
