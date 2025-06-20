import React, {
    useRef,
    useEffect,
    useState,
    useMemo,
    useCallback,
} from "react";
import PremiumChecklistModal from "./PremiumChecklistModal";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/context/BasicPricingContext";
import CircularProgress from "@mui/material/CircularProgress";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";

const AdditionalPremiumAssignModal = ({ modalRef, priceListData }) => {
    //States
    const [dataFetched, setDataFetched] = useState(false);
    const premiumCheckListModalRef = useRef(null);
    const {
        fetchUnits,
        excelId,
        towerPhaseId,
        units,
        isCheckingUnits,
    } = useUnit();
    const { priceListMasterId } = usePriceListMaster();
    const [formattedUnits, setFormattedUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState({});
    const { pricingData } = usePricing();

    //Hooks
    // Memoize the fetchUnits function
    const memoizedfetchUnits = useCallback(
        (towerPhaseId, excelId,priceListMasterId, param1, param2) => {
            return fetchUnits(towerPhaseId, excelId,priceListMasterId, param1, param2);
        },
        []
    );

    useEffect(() => {
        // Only run if have valid data and haven't fetched yet
        if (priceListData.data && !dataFetched) {
            const newExcelId = excelId;
            const newTowerPhaseId =
                (priceListData.data.tower_phases &&
                    priceListData?.data.tower_phases[0].id) ||
                towerPhaseId;

            // Only fetch if we have both required IDs
            if (newExcelId && newTowerPhaseId) {
                const fetchData = async () => {
                    await memoizedfetchUnits(
                        newTowerPhaseId,
                        newExcelId,
                        priceListMasterId,
                        false,
                        false
                    );
                    setDataFetched(true);
                };

                fetchData();
            }
        }
    }, [
        priceListData.data,
        excelId,
        towerPhaseId,
        memoizedfetchUnits,
        dataFetched,
        priceListMasterId,
    ]);

    // Add this effect to reset the dataFetched flag when excel IDs change
    useEffect(() => {
        setDataFetched(false);
    }, [excelId]);

    /**
     * Groups units by floor using `useMemo` for optimization.
     * Creates an object where each floor key holds an array of unit objects.
     * Each unit object contains `id`, `unit`, and `additional_premium_id`.
     * Updates `formattedUnits` state whenever `groupedByFloor` changes.
     */
    const groupedByFloor = useMemo(() => {
        if (!units) return {};

        return units.reduce((acc, item) => {
            if (!acc[item.floor]) {
                acc[item.floor] = [];
            }
            acc[item.floor].push({
                id: item.id,
                unit: item.unit,
                additional_premium_id: item.additional_premium_id,
            });
            return acc;
        }, {});
    }, [units]);

    useEffect(() => {
        setFormattedUnits(groupedByFloor);
    }, [groupedByFloor]);

    //Event Handler
    /**
     * Opens the modal for selecting additional premiums for a specific unit.
     * Retrieves the existing unit's selected premiums from `pricingData`.
     * Merges existing `additional_premium_id` with those passed as parameters.
     * Ensures unique premium IDs using `Set`.
     * Updates `selectedUnit` state before displaying the modal.
     */

    const handleOpenModal = (id, unit, additional_premium_id) => {
        if (premiumCheckListModalRef.current) {
            setSelectedUnit((prevUnit) => {
                const existingUnit =
                    pricingData.selectedAdditionalPremiums.find(
                        (item) => item.unit_id === id
                    );

                return {
                    unit_id: id,
                    unit_name: unit,
                    additional_premium_id: existingUnit
                        ? [
                              ...new Set([
                                  ...(existingUnit.additional_premium_id || []),
                                  ...(additional_premium_id || []),
                              ]),
                          ]
                        : additional_premium_id || [],
                };
            });

            premiumCheckListModalRef.current.showModal();
        }
    };

    return (
        <>
            <dialog
                className="modal w-[1200px] rounded-lg bg-custom-grayFA backdrop:bg-black/50"
                ref={modalRef}
            >
                <div className=" px-14 mb-5 rounded-[10px]">
                    <div className="">
                        <form
                            method="dialog"
                            className="pt-2 flex justify-end -mr-[50px]"
                        >
                            <button className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custombg">
                                ✕
                            </button>
                        </form>
                    </div>
                    <div className="flex justify-start items-center gap-[30px] h-[40px] my-6 ">
                        <p className="montserrat-bold text-[21px]">
                            Unit Assignment
                        </p>
                        <p className="montserrat-regular text-[21px]">
                            Additional Premium
                        </p>
                    </div>
                    <div className="flex items-center p-[20px] h-[91px] gap-[22px] border-b-1 border-custom-lightestgreen mb-[30px]">
                        <p className="text-custom-gray81">Legend</p>
                        <div className="h-full border border-r-custom-lightestgreen"></div>
                        <div className="flex justify-center items-center h-[51px] w-[89px] bg-white rounded-[10px]">
                            <p className="text-custom-gray81 font-bold">
                                0000000
                            </p>
                        </div>
                        <p>Excluded units from premium rate</p>
                        <div className="h-full border border-r-custom-lightestgreen"></div>
                        <div className="h-[63px] w-[95px] p-[6px] rounded-[15px] gradient-btn4">
                            <div className="flex  justify-center items-center bg-white h-full w-full text-custom-solidgreen rounded-[10px]">
                                <p className="font-bold">0000000</p>
                            </div>
                        </div>
                        <p>Selected units for floor premium rate</p>
                    </div>
                    {isCheckingUnits ? (
                        <div className=" w-full  flex justify-center items-center">
                            <CircularProgress className="spinnerSize" />
                        </div>
                    ) : formattedUnits &&
                      Object.keys(formattedUnits).length > 0 ? (
                        Object.entries(formattedUnits).map(
                            ([floorId, units]) => {
                                return (
                                    <div
                                        key={floorId}
                                        className="h-auto flex gap-5 pb-8 mb-8 border-b border-custom-lightestgreen"
                                    >
                                        {/* Floor Number */}
                                        <div className="h-full flex justify-start items-start">
                                            <div className="w-[50px] h-[63px] bg-custom-lightestgreen p-2 rounded-[15px]">
                                                <div className="flex justify-center items-center bg-white h-full w-full rounded-[10px]">
                                                    <p className="font-bold text-[21px]">
                                                        {floorId}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Unit Buttons */}
                                        <div className="flex flex-wrap gap-3">
                                            {units &&
                                                units.map(
                                                    ({
                                                        id,
                                                        unit,
                                                        additional_premium_id,
                                                    }) => {
                                                        const isSelected =
                                                            pricingData.selectedAdditionalPremiums?.some(
                                                                (item) =>
                                                                    item.unit_id ===
                                                                    id
                                                            ) ||
                                                            (additional_premium_id &&
                                                                additional_premium_id.length >
                                                                    0);
                                                        return (
                                                            <button
                                                                key={id}
                                                                onClick={() =>
                                                                    handleOpenModal(
                                                                        id,
                                                                        unit,
                                                                        additional_premium_id
                                                                    )
                                                                }
                                                                className="h-[63px] rounded-[15px] bg-white "
                                                            >
                                                                <div
                                                                    className={`h-[63px] p-[6px] rounded-[15px] ${
                                                                        isSelected
                                                                            ? "gradient-btn4 "
                                                                            : ""
                                                                    }  `}
                                                                >
                                                                    <div className="flex  justify-center items-center bg-white h-full min-w-max px-2  text-custom-solidgreen rounded-[10px]">
                                                                        <p className="font-bold">
                                                                            {
                                                                                unit
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    }
                                                )}
                                        </div>
                                    </div>
                                );
                            }
                        )
                    ) : null}
                </div>
                <div>
                    <PremiumChecklistModal
                        priceListData={priceListData}
                        selectedUnit={selectedUnit}
                        premiumCheckListModalRef={premiumCheckListModalRef}
                    />
                </div>
            </dialog>
        </>
    );
};

export default AdditionalPremiumAssignModal;
