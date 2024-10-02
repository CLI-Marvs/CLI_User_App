import React, { useEffect, useRef, useState } from "react";
import FloorPremiumAddUnitModal from "./FloorPremiumAddUnitModal";
import { useStateContext } from "../../../../../context/contextprovider";
import CircularProgress from "@mui/material/CircularProgress";

const FloorPremiumAssignModal = ({ modalRef }) => {
    //state
    const {
        selectedFloor,
        propertyUnit,
        getPropertyUnits,
        setPropertyId,
        isLoading,
    } = useStateContext();
    // console.log("FloorPremiumAssignModal- propertyUnit",  propertyUnit);
    const modalRef2 = useRef(null);
    const [isSelectedUnit, setSelectedUnit] = useState();
    // console.log("FloorPremiumAssignModal- propertyUnit", propertyUnit);
    //event handler
    const handleOpenModal = () => {
        if (modalRef2.current) {
            modalRef2.current.showModal();
        }
    };

    const handleUnitSelect = (id) => {
        setSelectedUnit(
            (prevSelectedId) => (prevSelectedId === id ? null : id) // Deselect if already selected, else select the new unit by ID
        );
    }; // Handle key selection or deselection

    // useEffect(() => {
    //     // console.log(
    //     //     "selectedFloor FloorPremiumAssignModal",
    //     //     selectedFloor,
    //     //     propertyId
    //     // );
    //     if (selectedFloor || propertyId) {
    //         setPropertyId(propertyId);
    //         getPropertyUnits(selectedFloor, propertyId);
    //     }
    // }, [selectedFloor, propertyId]);
    return (
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
                    <p className="montserrat-regular text-[21px]">Floor</p>
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
                            <div className=" flex items-center">
                                <CircularProgress className="spinnerSize" />
                            </div>
                        ) : (
                            propertyUnit &&
                            Object.values(propertyUnit).map((item, key) => {
                                const isSelected = isSelectedUnit === item?.id;

                                return (
                                    <div
                                        onClick={() =>
                                            handleUnitSelect(item?.id)
                                        } // Pass the key to handleUnitSelect
                                        className={`h-[63px] w-[95px] p-[6px] ${
                                            isSelected ? "gradient-btn4" : ""
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
                <FloorPremiumAddUnitModal modalRef={modalRef2} />
            </div>
        </dialog>
    );
};

export default FloorPremiumAssignModal;
