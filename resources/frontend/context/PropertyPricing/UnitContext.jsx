import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { unitService } from "@/component/servicesApi/apiCalls/propertyPricing/unit/unitService";

const UnitContext = createContext();

export const UnitProvider = ({ children }) => {
    const [excelId, setExcelId] = useState(null);
    const [floors, setFloors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [towerPhaseId, setTowerPhaseId] = useState();
    const [floorPremiumsAccordionOpen, setFloorPremiumsAccordionOpen] =
        useState(false);
    const [units,setUnits] = useState([]);
 
    const fetchFloorCount = useCallback(
        async (towerPhaseId, excelId) => {
            if (towerPhaseId && excelId) {
                try {
                    setIsLoading(true);
                    const response = await unitService.countFloor(
                        towerPhaseId,
                        excelId
                    );

                    const sortedProperties = Object.entries(response.data.data)
                        .map(([id, name]) => ({ id, name }))
                        .sort((a, b) => a.name.localeCompare(b.name));

                    setFloors(response.data.data);
                    return response.data.data;
                } catch (err) {
                    setError(err);
                    throw err;
                } finally {
                    setIsLoading(false);
                }
            }
        },
        [towerPhaseId, excelId]
    );

    const checkExistingUnits = useCallback(
        async (towerPhaseId) => {
            try {
                setTowerPhaseId(towerPhaseId);
                setIsLoading(true);
                const response = await unitService.getExistingUnits(
                    towerPhaseId
                );

                if (response?.data?.data[0]?.excel_id) {
                    const excelId = response?.data?.data[0]?.excel_id;
                    await fetchFloorCount(towerPhaseId, excelId);
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        },
        [fetchFloorCount]
    );

    const uploadUnits = useCallback(
        async (payload) => {
            try {
                setIsLoading(true);
                const response = await unitService.storeUnit(payload);
                if (response?.status === 201) {
                    const newExcelId = response?.data?.data?.excel_id;
                    setExcelId(newExcelId);
                    await fetchFloorCount(payload.tower_phase_id, newExcelId);
                    return { success: true, excelId: newExcelId };
                }
            } catch (err) {
                setError(err);
                return { success: false, error: err };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchFloorCount]
    );

    const fetchUnitsInTowerPhase = useCallback(
        async (towerPhaseId, selectedFloor) => {
            try {
                setIsLoading(true);
                const response = await unitService.getUnitsInTowerPhase(
                    towerPhaseId,
                    selectedFloor
                );
                setUnits(response?.data?.data);
                return response?.data?.data;
            } catch (err) {
                setError(err);
                return { success: false, error: err };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchFloorCount]
    );

    const value = {
        excelId,
        floors,
        isLoading,
        error,
        fetchFloorCount,
        checkExistingUnits,
        uploadUnits,
        floorPremiumsAccordionOpen,
        setFloorPremiumsAccordionOpen,
        fetchUnitsInTowerPhase,
        units
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
