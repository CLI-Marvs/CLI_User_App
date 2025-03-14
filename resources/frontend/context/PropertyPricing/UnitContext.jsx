import React, { createContext, useContext, useState, useCallback } from "react";
import { unitService } from "@/component/servicesApi/apiCalls/propertyPricing/unit/unitService";
import { debounce } from "lodash";

const UnitContext = createContext();

export const UnitProvider = ({ children }) => {
    const [excelId, setExcelId] = useState(null);
    const [floors, setFloors] = useState([]);
    const [error, setError] = useState(null);
    const [towerPhaseId, setTowerPhaseId] = useState(null);
    const [excelIdFromPriceList, setExcelIdFromPriceList] = useState(null);
    const [floorPremiumsAccordionOpen, setFloorPremiumsAccordionOpen] =
        useState(false);
    const [unitsByFloor, setUnitByFloors] = useState([]);
    const [units, setUnits] = useState([]);
    const [isFloorCountLoading, setIsFloorCountLoading] = useState(false);
    const [isCheckingUnits, setIsCheckingUnits] = useState(false);
    const [isFetchingUnits, setIsFetchingUnits] = useState(false);
    const [isUploadingUnits, setIsUploadingUnits] = useState(false);
    const [lastFetchedExcelId, setLastFetchedExcelId] = useState(null);
    const [computedUnitPrices, setComputedUnitPrices] = useState([]);

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
        async (towerPhaseId, excelId, forceFetch = false, skipFloorCount = false) => {
            if (!towerPhaseId || !excelId) {
                setFloors([]);
                setUnits([]);
                return;
            }

            // Prevent unnecessary API calls if data exists but allow forced fetch
            if (
                !forceFetch &&
                lastFetchedExcelId === excelId &&
                units.length > 0
            ) {
                return;
            }

            if (isCheckingUnits) {
                return;
            }

            try {
                setIsCheckingUnits(true);
                const response = await unitService.getExistingUnits(
                    towerPhaseId,
                    excelId
                );

                const unitsData = response?.data?.data || [];
                setUnits(unitsData);
                setLastFetchedExcelId(excelId);

                // Fetch floor count only if units exist
               if (
                   !skipFloorCount &&
                   unitsData.length > 0 &&
                   unitsData[0]?.excel_id
               ) {
                   await fetchFloorCount(towerPhaseId, unitsData[0].excel_id);
               }
            } catch (err) {
                setError(err);
                console.error("Error in checkExistingUnits:", err);
            } finally {
                setIsCheckingUnits(false);
            }
        },
        [fetchFloorCount, units, isCheckingUnits, lastFetchedExcelId]
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
                    const newExcelId = response?.data?.excel_id;
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

    /*
     * Saves computed unit pricing data to the database, including
     * the computed price list, transfer charge, reservation fee,
     * and total contract price.
     *
     * This function is debounced to optimize performance, ensuring
     * it only executes after 1 second of inactivity to prevent
     * redundant API calls.
     */
    const saveComputedUnitPricingData = useCallback(
        debounce(async (data) => {
            try {
                const payload = {
                    payload: Object.values(data),
                    excel_id:
                        excelId || excelIdFromPriceList || data[0]?.excel_id,
                    tower_phase_id: towerPhaseId || data[0]?.tower_phase_id,
                    property_masters_id: data[0]?.property_masters_id,
                    price_list_master_id: data[0]?.price_list_master_id,
                };
                const response = await unitService.saveComputedUnitPricingData(
                    payload
                );
            } catch (error) {
                console.error("Failed to save pricing data", error);
            }
        }, 1000),
        []
    );

    // Update computed prices and trigger save
    const updateUnitComputedPrices = useCallback(
        (newPrices) => {
            // setComputedUnitPrices(newPrices);
             setComputedUnitPrices((prevPrices) => {
                 if (JSON.stringify(prevPrices) !== JSON.stringify(newPrices)) {
                     // Only trigger save if prices actually changed
                     saveComputedUnitPricingData(newPrices);
                 }
                 return newPrices;
             });
            //TODO: uncomment this line to save the computed prices
             saveComputedUnitPricingData(newPrices);
        },
        [saveComputedUnitPricingData]
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
        unitsByFloor,
        isUploadingUnits,
        setIsUploadingUnits,
        setFloors,
        isCheckingUnits,
        isFetchingUnits,
        isFloorCountLoading,
        units,
        lastFetchedExcelId,
        setLastFetchedExcelId,
        towerPhaseId,
        setTowerPhaseId,
        excelIdFromPriceList,
        setExcelIdFromPriceList,
        setExcelId,
        setUnits,
        updateUnitComputedPrices,
        computedUnitPrices,
        saveComputedUnitPricingData,
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
