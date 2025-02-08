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
    const [error, setError] = useState(null);
    const [towerPhaseId, setTowerPhaseId] = useState();
    const [floorPremiumsAccordionOpen, setFloorPremiumsAccordionOpen] =
        useState(false);
    const [unitsByFloor, setUnitByFloors] = useState([]);
    const [units,setUnits] = useState([]);
    const [isFloorCountLoading, setIsFloorCountLoading] = useState(false);
    const [isCheckingUnits, setIsCheckingUnits] = useState(false);
    const [isFetchingUnits, setIsFetchingUnits] = useState(false);
    const [isUploadingUnits, setIsUploadingUnits] = useState(false);

    const fetchFloorCount = useCallback(
        async (towerPhaseId, excelId) => {
            if (towerPhaseId && excelId) {
                try {
                    setIsFloorCountLoading(true);
                    const response = await unitService.countFloor(
                        towerPhaseId,
                        excelId
                    );
                    console.log("response fetchFloorCount", response);
                    const sortedProperties = Object.entries(response.data.data)
                        .map(([id, name]) => ({ id, name }))
                        .sort((a, b) => a.name.localeCompare(b.name));

                    setFloors(response.data.data);
                    return response.data.data;
                } catch (err) {
                    setError(err);
                    throw err;
                } finally {
                    setIsFloorCountLoading(false);
                }
            }
        },
        [towerPhaseId, excelId]
    );

    const checkExistingUnits = useCallback(
        async (towerPhaseId, excelId) => {
            if (excelId === null || excelId === undefined) {
                console.log(
                    "Skipping API call because excelId is null or undefined"
                );
                setFloors([]);
                return;
            }

            console.log("checkExistingUnits", towerPhaseId, excelId);
            try {
                setTowerPhaseId(towerPhaseId);
                setIsCheckingUnits(true);
                const response = await unitService.getExistingUnits(
                    towerPhaseId,
                    excelId
                );
                setUnits(response?.data?.data);
                if (response?.data?.data[0]?.excel_id) {
                    const excelId = response?.data?.data[0]?.excel_id;

                    await fetchFloorCount(towerPhaseId, excelId);
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsCheckingUnits(false);
            }
        },
        [fetchFloorCount]
    );

    const uploadUnits = useCallback(
        async (payload) => {
            try {
                setIsUploadingUnits(true);
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
                setIsUploadingUnits(false);
            }
        },
        [fetchFloorCount]
    );

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
