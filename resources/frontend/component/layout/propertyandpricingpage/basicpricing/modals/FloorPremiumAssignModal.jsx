import React, { useEffect, useRef, useState } from "react";
import FloorPremiumAddUnitModal from "./FloorPremiumAddUnitModal";
import CircularProgress from "@mui/material/CircularProgress";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
const FloorPremiumAssignModal = ({
    modalRef,
    selectedFloor,
    towerPhaseId,
    propertyData,
}) => {
    //State
    // const { setFloorPremiumFormData } = useFloorPremiumStateContext();
    const modalRef2 = useRef(null);
    const [excludedUnit, setExcludedUnit] = useState([]);
    const { fetchUnitsInTowerPhase, units, isLoading, excelId } = useUnit();
    const { pricingData, setPricingData } = usePricing();

    //Hooks
    useEffect(() => {
        if (selectedFloor) {
            console.log(
                "selectedFloor towerPhaseId excelID25",
                selectedFloor,
                towerPhaseId,
                propertyData?.excel_id || excelId
            );
            fetchUnitsInTowerPhase(
                selectedFloor,
                towerPhaseId,
                propertyData?.excel_id || excelId
            );
        }
    }, [selectedFloor]);

    //Event handler
    const handleOpenModal = () => {
        if (modalRef2.current) {
            modalRef2.current.showModal();
        }
    };

    /**
     * Handle select exluced unit and then update the floor premium data, use the selectedFloor to track the index
     * @param {} id
     * @returns
     */
    const handleUnitSelect = (id) => {
        setExcludedUnit((prevSelectedUnits) => {
            // Determine the new list of excluded units
            const newSelectedUnits = prevSelectedUnits.includes(id)
                ? prevSelectedUnits.filter((unitId) => unitId !== id)
                : [...prevSelectedUnits, id];

            // If pricing data is available, update the pricing data
            if (
                pricingData?.floorPremiums &&
                Object.keys(pricingData?.floorPremiums).length > 0
            ) {
                const floorPremiums = pricingData.floorPremiums[selectedFloor];

                // Handle existing and new excluded units
                let updatedExcludedUnits;
                if (floorPremiums.excludedUnits?.includes(id)) {
                    // If the unit was originally from the database, remove it
                    updatedExcludedUnits = (
                        floorPremiums.excludedUnits || []
                    ).filter((unitId) => unitId !== id);
                } else {
                    // If it's a new selection, add it to the list
                    updatedExcludedUnits = [
                        ...(floorPremiums.excludedUnits || []),
                        id,
                    ];
                }
                // Update the floorPremiums state using the merged excluded units
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

            // Return the new list of selected units
            return newSelectedUnits;
        });
    };

    //Handle close the modal and reset the excluded unit
    const handleCloseModal = () => {
        // setExcludedUnit([]);
        if (modalRef2.current) {
            //  if (
            //      pricingData?.floorPremiums &&
            //      Object.keys(pricingData?.floorPremiums).length > 0
            //  ) {
            //      const floorPremiums = pricingData.floorPremiums[selectedFloor];
            //      // Update the floorPremiums state using the new selected units
            //      const updatedFloorPremiums = {
            //          ...floorPremiums,
            //          excludedUnits: [],
            //      };
            //      setPricingData((prevState) => ({
            //          ...prevState,
            //          floorPremiums: {
            //              ...prevState.floorPremiums,
            //              [selectedFloor]: updatedFloorPremiums,
            //          },
            //      }));
            //  }
            modalRef.current.close();
        }
    };

    return (
        <dialog
            className="modal w-[1200px] rounded-lg bg-custom-grayFA backdrop:bg-black/50"
            ref={modalRef}
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
                    {excludedUnit && excludedUnit.length > 0 && (
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
                    <p>Selected units for floor premium rate</p>
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
                    <div className="flex flex-wrap gap-3">
                        {isLoading ? (
                            <div className=" flex items-center  w-20 justify-center">
                                <CircularProgress className="spinnerSize" />
                            </div>
                        ) : (
                            units.length > 0 &&
                            units.map((item, key) => {
                                // Check if this unit's ID is in the excludedUnits for the current floor
                                const isExcluded = pricingData?.floorPremiums?.[
                                    selectedFloor
                                ]?.excludedUnits?.includes(item?.id);
                                return (
                                    <div
                                        onClick={() =>
                                            handleUnitSelect(item?.id)
                                        }
                                        className={`h-[63px] w-[95px] p-[6px] ${
                                            !isExcluded ? "gradient-btn4" : ""
                                        } rounded-[15px]  cursor-pointer`}
                                        key={key}
                                    >
                                        <div className="flex justify-center items-center bg-white h-full w-full text-custom-solidgreen rounded-[10px]">
                                            <p className="font-bold">
                                                {item?.unit}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}

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
                    </div>
                </div>
            </div>
            <div>
                <FloorPremiumAddUnitModal
                    modalRef={modalRef2}
                    units={units}
                    propertyData={propertyData}
                    towerPhaseId={towerPhaseId}
                    selectedFloor={selectedFloor}
                />
            </div>
        </dialog>
    );
};

export default FloorPremiumAssignModal;
