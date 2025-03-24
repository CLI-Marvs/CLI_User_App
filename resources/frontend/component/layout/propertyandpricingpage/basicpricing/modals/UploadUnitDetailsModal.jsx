import React, { useRef, useEffect, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import CircularProgress from "@mui/material/CircularProgress";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { showToast } from "@/util/toastUtil";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/context/BasicPricingContext";
import { useProperty } from "@/context/PropertyPricing/PropertyContext";


const UploadUnitDetailsModal = ({
    excelDataRows,
    uploadUnitModalRef,
    fileName,
    selectedExcelHeader,
    handleFileChange,
    onClose,
    ...props
}) => {
    //State
    const [formData, setFormData] = useState({});
    const newFileInputRef = useRef();
    const {
        uploadUnits,
        towerPhaseId,
        isUploadingUnits,
        fetchFloorCount,
        excelId,
        excelIdFromPriceList,
        setFloors,
        setUnits,
        setExcelId,
        setExcelIdFromPriceList,
        setFloorPremiumsAccordionOpen,
        setIsUploadingUnits,
    } = useUnit();
    const { setPricingData } = usePricing();
    const { priceListMasterId } = usePriceListMaster();
    const { propertyMasterId } = useProperty();
    
    //Hooks
    useEffect(() => {
        if (selectedExcelHeader) {
            const initialFormData = selectedExcelHeader.reduce((acc, item) => {
                acc[item.rowHeader] = {
                    rowHeader: item.rowHeader,
                    columnIndex: item.columnIndex,
                };
                return acc;
            }, {});
            setFormData(initialFormData);
        }
    }, [selectedExcelHeader]);

    //Event hander
    // Handle change in column selection
    const handleColumnChange = (newColumnIndex, rowHeader) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [rowHeader]: {
                ...prevFormData[rowHeader],
                columnIndex: parseInt(newColumnIndex),
            },
        }));
    };

    //Handle submit units from excel file
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent multiple submissions while upload is in progress
        if (isUploadingUnits) return;
        setIsUploadingUnits(true);

        try {
            // Clear old data only if a new file is uploaded
            if (excelId || excelIdFromPriceList) {
                setUnits([]);
                setExcelId("");
                setExcelIdFromPriceList("");

                // Reset specific pricing data fields while preserving other fields
                setPricingData((prev) => ({
                    ...prev,
                    floorPremiums: {},
                    additionalPremiums: [],
                    reviewedByEmployees: [],
                    approvedByEmployees: [],
                }));
            }

            const payload = {
                excelDataRows: excelDataRows,
                tower_phase_id: towerPhaseId,
                property_masters_id: propertyMasterId,
                price_list_master_id: priceListMasterId,
                excel_id: excelId || excelIdFromPriceList || null,
            };

            // Call the API to upload units
            const response = await uploadUnits(payload);

            // Handle successful response
            if (response?.success === true) {
                // Reset floors and fetch new floor data based on the uploaded Excel
                setFloors([]);
                const floors = await fetchFloorCount(
                    towerPhaseId,
                    response?.excelId,
                    true
                );
                setFloors(floors);

                // Show success message and update UI
                showToast("Units uploaded successfully", "success");

                props.setAccordionStates((prev) => ({
                    ...prev,
                    floorPremium: true,
                }));

                // Close the modal if reference exists
                if (uploadUnitModalRef.current) {
                    uploadUnitModalRef.current.close();
                }
            } else {
                // Handle unsuccessful response
                showToast(
                    response?.message || "Failed to upload units",
                    "error"
                );
                setIsUploadingUnits(false);
            }
        } catch (error) {
            // Handle errors
            console.error("Error uploading Excel:", error);
            showToast("An error occurred while uploading units", "error");
            setIsUploadingUnits(false);
        }
    };

    //Handle in replacing the file
    const onChangeReplaceFile = async (event) => {
        // Trigger the `handleFileChange` function received from BasicPricing
        await handleFileChange(event);
    };

    //Handle close the unit upload modal
    const handleCloseUnitModal = () => {
        onClose();
    };

    return (
        <dialog
            className="modal w-[474px] rounded-lg backdrop:bg-black/50 backdrop-blur-md z-50 fixed inset-0"
            ref={uploadUnitModalRef}
        >
            <div className=" px-14 mb-5 rounded-[10px] relative z-40">
                <div className="">
                    <div
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[50px]"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA3 text-custom-bluegreen hover:bg-custom-grayFA"
                            onClick={handleCloseUnitModal}
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-center bg-custom-grayFA h-[54px]  mb-3">
                    <div>
                        <p className="underline text-blue-500 ">{fileName}</p>
                    </div>
                    <div>
                        <label
                            className="flex justify-center items-center w-[64px] h-[24px] bg-white text-xs border text-[#067AC5] border-[#067AC5] rounded-[5px] hover:shadow-custom4"
                            onClick={() => {
                                if (newFileInputRef.current) {
                                    newFileInputRef.current.click();
                                }
                            }}
                        >
                            Replace
                            <input
                                type="file"
                                className="hidden"
                                onChange={onChangeReplaceFile}
                            />
                        </label>
                    </div>
                </div>
                <div className="flex justify-start items-center h-40px my-6">
                    <p className="montserrat-bold">Confirm Columns</p>
                </div>
                <div className="flex flex-col gap-2">
                    {selectedExcelHeader &&
                        Object.values(formData).map((item, index) => {
                            return (
                                <div
                                    className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden"
                                    key={index}
                                >
                                    <p className="text-custom-gray81 bg-custom-grayFA flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm capitalize">
                                        {item?.rowHeader}
                                    </p>
                                    <div className="relative w-full">
                                        <select
                                            className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0"
                                            name="floor"
                                            id="floor-select"
                                            value={item?.columnIndex}
                                            onChange={(e) => {
                                                console.log(
                                                    " e.target.value,",
                                                    e.target.value,
                                                    typeof e.target.value
                                                );

                                                handleColumnChange(
                                                    e.target.value,
                                                    item?.rowHeader
                                                );
                                            }}
                                        >
                                            {Object.values(
                                                selectedExcelHeader
                                            ).map((optionItem) => (
                                                <option
                                                    key={
                                                        optionItem?.columnIndex
                                                    }
                                                    value={
                                                        optionItem?.columnIndex
                                                    }
                                                >
                                                    Column{" "}
                                                    {optionItem?.columnIndex}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                            <IoMdArrowDropdown className="text-custom-gray81" />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
                <div className="flex justify-center mt-4 mb-8">
                    {selectedExcelHeader && selectedExcelHeader.length > 0 ? (
                        <button
                            className={`w-[177px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px] hover:shadow-custom4  ${
                                isUploadingUnits ? "cursor-not-allowed" : ""
                            }`}
                            type="submit"
                            onClick={handleSubmit}
                        >
                            {isUploadingUnits ? (
                                <CircularProgress className="spinnerSize" />
                            ) : (
                                <>Confirm and Upload</>
                            )}
                        </button>
                    ) : null}
                </div>
            </div>
        </dialog>
    );
};

export default UploadUnitDetailsModal;
