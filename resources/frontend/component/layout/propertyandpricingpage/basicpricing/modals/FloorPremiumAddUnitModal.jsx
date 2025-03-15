import React, { useState, useEffect } from "react";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { unitService } from "@/component/servicesApi/apiCalls/propertyPricing/unit/unitService";
import { showToast } from "@/util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";
import CustomInput from "@/component/Input/CustomInput";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";

const formDataState = {
    floor: "",
    roomNumber: "",
    unit: "",
    type: "",
    indoorArea: "",
    balconyArea: "",
    gardenArea: "",
    totalArea: "",
};

const FloorPremiumAddUnitModal = ({
    floorPremiumAddUnitModalRef,
    unitsByFloor,
    towerPhaseId,
    selectedFloor,
}) => {
    //States
    const [formData, setFormData] = useState(formDataState);
    const { checkExistingUnits, excelId, excelIdFromPriceList, setUnits } =
        useUnit();
    const [isLoading, setIsLoading] = useState(false);
    const { propertyMasterId, priceListMasterId } = usePriceListMaster();

    //Hooks
    useEffect(() => {
        if (unitsByFloor && unitsByFloor.length > 0) {
            // setExcelId(unitsByFloor[0]?.excel_id);
            setFormData((prevData) => ({
                ...prevData,
                floor: selectedFloor,
            }));
        }
    }, [unitsByFloor, selectedFloor]);

    //Event handler
    //Handle input field change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    //Handle submit button click
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                floor: formData.floor,
                room_number: formData.roomNumber,
                unit: formData.unit,
                type: formData.type,
                indoor_area: parseFloat(formData.indoorArea).toFixed(2),
                balcony_area: parseFloat(formData.balconyArea).toFixed(2),
                garden_area: parseFloat(formData.gardenArea).toFixed(2),
                total_area: parseFloat(formData.totalArea).toFixed(2),
                tower_phase_id: towerPhaseId,
                excel_id: excelId || excelIdFromPriceList,
                property_masters_id: propertyMasterId,
                price_list_master_id: priceListMasterId,
            };
            setIsLoading(true);
            const response = await unitService.storeUnitDetails(payload);

            if (response?.status === 201) {
                showToast(
                    response?.data?.message || "Data added successfully!",
                    "success"
                );
                setFormData(formDataState);
                // setUnits(response?.data?.data);
                setUnits((prevUnits) => {
                    const newUnits = [...prevUnits, response?.data?.data];
                    // Sort units in ascending order based on 'unit' property
                    // return newUnits.sort((a, b) =>
                    //     a.unit.localeCompare(b.unit)
                    // );
                    return newUnits;
                });
                await Promise.all([
                    checkExistingUnits(
                        towerPhaseId,
                        excelId || excelIdFromPriceList,
                        true,
                        true
                    ),
                ]);

                if (floorPremiumAddUnitModalRef.current) {
                    floorPremiumAddUnitModalRef.current.close();
                }
            }
        } catch (error) {
            console.log("Error", error);
        } finally {
            setIsLoading(false);
        }
    };

    //Utility to disable the  button if form is empty
    // Function to check if all fields are empty
    const isDisabled = Object.values(formData).some((value) => value === "");

    //Handle close the modal and reset all state
    const handleCloseModal = () => {
        if (floorPremiumAddUnitModalRef.current) {
            setFormData((prevData) => ({
                ...formDataState,
                floor: selectedFloor,
            }));
            floorPremiumAddUnitModalRef.current.close();
        }
    };

    return (
        <dialog
            className="modal w-[474px] rounded-lg"
            ref={floorPremiumAddUnitModalRef}
        >
            <div className=" px-14 mb-5 rounded-[10px]">
                <div className="">
                    <div
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[50px] backdrop:bg-black/50"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex justify-start items-center h-40px my-6">
                    <p className="montserrat-bold">Add Unit</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Floor
                        </span>
                        <input
                            name="floor"
                            type="text"
                            readOnly
                            value={formData.floor || ""}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Room Number
                        </span>
                        <CustomInput
                            type="number"
                            name="roomNumber"
                            value={formData.roomNumber || ""}
                            className="w-full px-4 focus:outline-none "
                            onChange={handleInputChange}
                            restrictNumbers={true}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Unit
                        </span>
                        <CustomInput
                            type="text"
                            name="unit"
                            value={formData.unit || ""}
                            className="w-full px-4 focus:outline-none "
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Type
                        </span>
                        <CustomInput
                            type="text"
                            name="type"
                            value={formData.type || ""}
                            className="w-full px-4 focus:outline-none "
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Indoor Area
                        </span>
                        <CustomInput
                            type="number"
                            name="indoorArea"
                            value={formData.indoorArea || ""}
                            className="w-full px-4 focus:outline-none "
                            onChange={handleInputChange}
                            restrictNumbers={true}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Balcony Area
                        </span>
                        <CustomInput
                            type="number"
                            name="balconyArea"
                            value={formData.balconyArea || ""}
                            className="w-full px-4 focus:outline-none "
                            onChange={handleInputChange}
                            restrictNumbers={true}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Garden Area
                        </span>
                        <CustomInput
                            type="number"
                            name="gardenArea"
                            value={formData.gardenArea || ""}
                            className="w-full px-4 focus:outline-none "
                            onChange={handleInputChange}
                            restrictNumbers={true}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Total Area
                        </span>
                        <CustomInput
                            type="number"
                            name="totalArea"
                            value={formData.totalArea || ""}
                            className="w-full px-4 focus:outline-none "
                            onChange={handleInputChange}
                            restrictNumbers={true}
                        />
                    </div>
                </div>
                <div className="flex justify-center mt-4 mb-8">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading || isDisabled}
                        className={`w-[95px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px] ${
                            isLoading || isDisabled
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                    >
                        {isLoading ? (
                            <CircularProgress className="spinnerSize" />
                        ) : (
                            <> Add Unit</>
                        )}
                    </button>
                </div>
            </div>
        </dialog>
    );
};

export default FloorPremiumAddUnitModal;
