import React, {
    createContext,
    useContext,
    useState,
    useCallback,
} from "react";
import { unitService } from "@/component/servicesApi/apiCalls/propertyPricing/unit/unitService";

const UnitContext = createContext();

export const UnitProvider = ({ children }) => {
    const [excelId, setExcelId] = useState(null);
    const [excelFromPriceList, setExcelFromPriceList] = useState(null);
    const [floors, setFloors] = useState([]);
    const [error, setError] = useState(null);
    const [towerPhaseId, setTowerPhaseId] = useState();
    const [floorPremiumsAccordionOpen, setFloorPremiumsAccordionOpen] =
        useState(false);
    const [unitsByFloor, setUnitByFloors] = useState([]);
    const [units, setUnits] = useState([]);
    const [isFloorCountLoading, setIsFloorCountLoading] = useState(false);
    const [isCheckingUnits, setIsCheckingUnits] = useState(false);
    const [isFetchingUnits, setIsFetchingUnits] = useState(false);
    const [isUploadingUnits, setIsUploadingUnits] = useState(false);

    /**
     * Fetches the count of floors for a given tower phase and excel ID.
     * It calls the unitService.countFloor method to retrieve the data.
     * The function sorts the retrieved floor data alphabetically by name.
     * It updates the floors state with the fetched and sorted data.
     * Handles loading and error states during the API call.
     * Returns the floor data if successful.
     */
    const fetchFloorCount = useCallback(async (towerPhaseId, excelId) => {
        if (towerPhaseId && excelId) {
            try {
                setIsFloorCountLoading(true);
                const response = await unitService.countFloor(
                    towerPhaseId,
                    excelId
                );
                console.log("response fetchFloorCount", response);

                if (response?.data?.data) {
                    setFloors(response.data.data);  
                    return response.data.data;
                }
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setIsFloorCountLoading(false);
            }
        }
    }, []);

    /**
     * Checks for existing units based on tower phase and excel ID.
     * It uses cached data if available and avoids redundant API calls.
     * Handles cases where excelId is null or undefined by clearing relevant data.
     * Prevents duplicate API calls using a flag (isCheckingUnits).
     * Calls the unitService.getExistingUnits method to fetch unit data.
     * Updates the units state with the retrieved data.
     * Fetches floor count using fetchFloorCount if units data is available and contains an excel_id.
     * Sets the current towerPhaseId.
     * Handles loading and error states during the API call.
     */
    const checkExistingUnits = useCallback(
        async (towerPhaseId, excelId, forceFetch = false) => {
            // Prevent unnecessary API calls
            if (units.length > 0 && !forceFetch) {
                console.log("Using cached units data");
                return;
            }

            // Handle null/undefined excelId
            if (!excelId) {
                console.log("No excelId provided, clearing data");
                setFloors([]);
                setUnits([]);
                return;
            }

            // Use a flag to prevent duplicate calls
            if (isCheckingUnits) {
                console.log("Already checking units, skipping duplicate call");
                return;
            }

            try {
                setTowerPhaseId(towerPhaseId);
                setIsCheckingUnits(true);

                const response = await unitService.getExistingUnits(
                    towerPhaseId,
                    excelId
                );

                const unitsData = response?.data?.data || [];
                setUnits(unitsData);

                // Only fetch floor count if we have valid units data
                if (unitsData[0]?.excel_id) {
                    await fetchFloorCount(towerPhaseId, unitsData[0].excel_id);
                }
            } catch (err) {
                setError(err);
                console.error("Error in checkExistingUnits:", err);
            } finally {
                setIsCheckingUnits(false);
            }
        },
        [fetchFloorCount, units.length, isCheckingUnits]
    );

    /**
     * Uploads unit data using the provided payload.
     * Calls the unitService.storeUnit method to send the data.
     * Sets the new excel ID if the upload is successful (status 201).
     * Returns an object indicating success or failure, including the new excelId or error details.
     * Handles loading and error states during the upload process.
     */
    const uploadUnits = useCallback(
        async (payload) => {
            try {
                setIsUploadingUnits(true);
                const response = await unitService.storeUnit(payload);
                if (response?.status === 201) {
                    const newExcelId = response?.data?.data?.excel_id;
                    setExcelId(newExcelId);
                    return { success: true, excelId: newExcelId };
                }
            } catch (err) {
                setError(err);
                return { success: false, error: err };
            } finally {
                setIsUploadingUnits(false);
            }
        },
        [fetchFloorCount]
    );

    /**
     * Fetches units within a specific tower phase, selected floor, and excel ID.
     * Calls the unitService.getUnitsInTowerPhase method to retrieve the data.
     * Updates the unitByFloors state with the fetched unit data.
     * Returns the fetched unit data.
     * Handles loading and error states during the API call.
     */
    const fetchUnitsInTowerPhase = useCallback(
        async (towerPhaseId, selectedFloor, excelId) => {
            try {
                setIsFetchingUnits(true);
                const response = await unitService.getUnitsInTowerPhase(
                    towerPhaseId,
                    selectedFloor,
                    excelId
                );
                setUnitByFloors(response?.data?.data);
                return response?.data?.data;
            } catch (err) {
                setError(err);
                return { success: false, error: err };
            } finally {
                setIsFetchingUnits(false);
            }
        },
        [fetchFloorCount]
    );

    const value = {
        excelId,
        floors,
        error,
        fetchFloorCount,
        checkExistingUnits,
        uploadUnits,
        floorPremiumsAccordionOpen,
        setFloorPremiumsAccordionOpen,
        fetchUnitsInTowerPhase,
        unitsByFloor,
        isUploadingUnits,
        setIsUploadingUnits,
        setFloors,
        isCheckingUnits,
        isFetchingUnits,
        isFloorCountLoading,
        units,
        excelFromPriceList,
        setExcelFromPriceList,
    };
    return (
        <UnitContext.Provider value={value}>{children}</UnitContext.Provider>
    );
};

export const useUnit = () => {
    const context = useContext(UnitContext);
    if (!context) {
        throw new Error("useUnit must be used within a UnitProvider");
    }
    return context;
};
