import React, { useState, useEffect } from "react";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { unitService } from "@/component/servicesApi/apiCalls/propertyPricing/unit/unitService";
import { showToast } from "@/util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";

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
    modalRef,
    units,
    propertyData,
    towerPhaseId,
    selectedFloor,
}) => {
    //States
    const [formData, setFormData] = useState(formDataState);
    const [excelId, setExcelId] = useState(null);
    const { fetchUnitsInTowerPhase } = useUnit();
    const [isLoading, setIsLoading] = useState(false);
 
    //Hooks
    useEffect(() => {
        if (units && units.length > 0) {
            setExcelId(units[0]?.excel_id);
            setFormData((prevData) => ({
                ...prevData,
                floor: selectedFloor,
            }));
        }
    }, [units]);

    //Event handler
    //Handle input field change
    const handleChange = (e) => {
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
                excel_id: excelId,
                property_masters_id: propertyData?.price_list_master_id,
            };
            console.log("payload", payload);
            setIsLoading(true);
            const response = await unitService.storeUnitDetails(payload);
            console.log("response", response);
            if (response?.status === 201) {
                showToast(
                    response?.data?.message || "Data added successfully!",
                    "success"
                );
                setFormData(formDataState);
                await fetchUnitsInTowerPhase(
                    selectedFloor,
                    towerPhaseId,
                    excelId
                );
                if (modalRef.current) {
                    modalRef.current.close();
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
        if (modalRef.current) {
            setFormData((prevData) => ({
                ...formDataState,
                floor: selectedFloor,
            }));
            modalRef.current.close();
        }
    };

    return (
        <dialog className="modal w-[474px] rounded-lg" ref={modalRef}>
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
                        <input
                            name="roomNumber"
                            type="number"
                            onChange={handleChange}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                            value={formData.roomNumber || ""}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Unit
                        </span>
                        <input
                            name="unit"
                            type="text"
                            onChange={handleChange}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                            value={formData.unit || ""}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Type
                        </span>
                        <input
                            name="type"
                            type="text"
                            onChange={handleChange}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                            value={formData.type || ""}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Indoor Area
                        </span>
                        <input
                            name="indoorArea"
                            type="number"
                            onChange={handleChange}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                            value={formData.indoorArea || ""}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Balcony Area
                        </span>
                        <input
                            name="balconyArea"
                            type="number"
                            onChange={handleChange}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                            value={formData.balconyArea || ""}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Garden Area
                        </span>
                        <input
                            name="gardenArea"
                            type="number"
                            onChange={handleChange}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                            value={formData.gardenArea || ""}
                        />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">
                            Total Area
                        </span>
                        <input
                            name="totalArea"
                            type="number"
                            onChange={handleChange}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                            value={formData.totalArea || ""}
                        />
                    </div>
                </div>
                <div className="flex justify-center mt-4 mb-8">
                    {/* TODO: disable here if no data */}
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
