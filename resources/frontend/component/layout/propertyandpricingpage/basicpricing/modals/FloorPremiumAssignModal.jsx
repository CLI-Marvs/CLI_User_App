import React, { useEffect, useRef, useState } from "react";
import FloorPremiumAddUnitModal from "./FloorPremiumAddUnitModal";
import CircularProgress from "@mui/material/CircularProgress";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
const FloorPremiumAssignModal = ({
    floorPremiumAssignModalRef,
    selectedFloor,
    priceListData,
}) => {
    //State
    const floorPremiumAddUnitModalRef = useRef(null);
    const [excludedUnit, setExcludedUnit] = useState({});
    const { isFetchingUnits, towerPhaseId, units } = useUnit();
    const { pricingData, setPricingData } = usePricing();
    const [unitsByFloor, setUnitsByFloor] = useState([]);

    //Hooks
    useEffect(() => {
        if (!selectedFloor || !units || units.length === 0) {
            setUnitsByFloor([]);
            return;
        }
        const filteredUnits = units.filter(
            (unit) => Number(unit.floor) === Number(selectedFloor)
        );
        setUnitsByFloor(filteredUnits);
    }, [selectedFloor, units]);

    //Event handler
    const handleOpenModal = () => {
        if (floorPremiumAddUnitModalRef.current) {
            floorPremiumAddUnitModalRef.current.showModal();
        }
    };

    /**
     * Handle select exluced unit and then update the floor premium data, use the selectedFloor to track the index
     * @param {} id
     * @returns
     */
    const handleUnitSelect = (id) => {
        setExcludedUnit((prevExcludedUnits) => {
            const prevUnitsForFloor = prevExcludedUnits[selectedFloor] || [];

            const newUnitsForFloor = prevUnitsForFloor.includes(id)
                ? prevUnitsForFloor.filter((unitId) => unitId !== id)
                : [...prevUnitsForFloor, id];

            return {
                ...prevExcludedUnits,
                [selectedFloor]: newUnitsForFloor,
            };
        });

        if (
            pricingData?.floorPremiums &&
            Object.keys(pricingData?.floorPremiums).length > 0
        ) {
            const floorPremiums = pricingData.floorPremiums[selectedFloor];

            let updatedExcludedUnits;
            if (floorPremiums.excludedUnits?.includes(id)) {
                updatedExcludedUnits = (
                    floorPremiums.excludedUnits || []
                ).filter((unitId) => unitId !== id);
            } else {
                updatedExcludedUnits = [
                    ...(floorPremiums.excludedUnits || []),
                    id,
                ];
            }

            const updatedFloorPremiums = {
                ...floorPremiums,
                excludedUnits: updatedExcludedUnits,
            };

            setPricingData((prevState) => ({
                ...prevState,
                floorPremiums: {
                    ...prevState.floorPremiums,
                    [selectedFloor]: updatedFloorPremiums,
                },
            }));
        }
    };

    //Handle close the modal and reset the excluded unit
    const handleCloseModal = () => {
        // setExcludedUnit([]);
        if (floorPremiumAddUnitModalRef.current) {
            floorPremiumAssignModalRef.current.close();
        }
    };

    return (
        <dialog
            className="modal w-[1200px] rounded-lg bg-custom-grayFA backdrop:bg-black/50"
            ref={floorPremiumAssignModalRef}
        >
            <div className=" px-14 mb-5 rounded-[10px]">
                <div className="">
                    <div
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[50px]"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custombg"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex justify-start items-center gap-[30px] h-[40px] my-6 ">
                    <p className="montserrat-bold text-[21px]">
                        Unit Assignment
                    </p>
                    <p className="montserrat-regular text-[21px]">Floor</p>
                    {excludedUnit[selectedFloor] &&
                        excludedUnit[selectedFloor].length > 0 && (
                            <p className="ml-10 text-red-500">
                                You made changes. Make sure to click 'Save as
                                Draft'.
                            </p>
                        )}
                </div>
                <div className="flex items-center p-[20px] h-[91px] gap-[22px] border-b-1 border-custom-lightestgreen mb-[30px]">
                    <p className="text-custom-gray81">Legend</p>
                    <div className="h-full border border-r-custom-lightestgreen"></div>
                    <div className="flex justify-center items-center h-[51px] w-[89px] bg-white rounded-[10px]">
                        <p className="text-custom-gray81 font-bold">0000000</p>
                    </div>
                    <p>Excluded units from premium rate</p>
                    <div className="h-full border border-r-custom-lightestgreen"></div>
                    <div className="h-[63px] w-[95px] p-[6px] rounded-[15px] gradient-btn4">
                        <div className="flex  justify-center items-center bg-white h-full w-full text-custom-solidgreen rounded-[10px]">
                            <p className="font-bold">0000000</p>
                        </div>
                    </div>
                    <p>Selected unitsByFloor for floor premium rate</p>
                </div>
                <div className="h-auto flex gap-[20px]">
                    <div className="h-full flex justify-start items-start">
                        <div className="w-[50px] h-[63px] bg-custom-lightestgreen p-[6px] rounded-[15px]">
                            <div className="flex justify-center items-center bg-white h-full w-full rounded-[10px]">
                                {selectedFloor && (
                                    <p className="font-bold text-[21px]">
                                        {selectedFloor}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 ">
                        {!!isFetchingUnits ? (
                            <div className=" w-96  flex justify-center items-center">
                                <CircularProgress className="spinnerSize" />
                            </div>
                        ) : (
                            unitsByFloor &&
                            unitsByFloor.length > 0 &&
                            unitsByFloor
                                // .filter((item) => item.floor === selectedFloor)
                                .map((item, key) => {
                                    // Check if this unit's ID is in the excludedUnits for the current floor
                                    const isExcluded =
                                        pricingData?.floorPremiums?.[
                                            selectedFloor
                                        ]?.excludedUnits?.includes(item?.id);
                                    return (
                                        <div
                                            onClick={() =>
                                                handleUnitSelect(item?.id)
                                            }
                                            className={`h-[63px] w-[95px] p-[6px] ${
                                                !isExcluded
                                                    ? "gradient-btn4"
                                                    : ""
                                            } rounded-[15px] `}
                                            key={key}
                                        >
                                            <button
                                                className={`flex justify-center items-center bg-white h-full w-full text-custom-solidgreen rounded-[10px] font-bold   ${
                                                    priceListData.data
                                                        .status !== "Draft"
                                                        ? "cursor-not-allowed "
                                                        : "cursor-pointer"
                                                }`}
                                                disabled={
                                                    priceListData.data
                                                        .status !== "Draft"
                                                }
                                            >
                                                {item?.unit}
                                            </button>
                                        </div>
                                    );
                                })
                        )}
                        {priceListData.data.status === "Draft" && (
                            <div>
                                <button
                                    onClick={handleOpenModal}
                                    className="flex justify-center items-center h-[63px] w-[89px] bg-white rounded-[10px] hover:shadow-custom4"
                                >
                                    <p className="text-custom-gray81 font-bold">
                                        + Add
                                    </p>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <FloorPremiumAddUnitModal
                    floorPremiumAddUnitModalRef={floorPremiumAddUnitModalRef}
                    unitsByFloor={unitsByFloor}
                    towerPhaseId={towerPhaseId}
                    selectedFloor={selectedFloor}
                />
            </div>
        </dialog>
    );
};

export default FloorPremiumAssignModal;
