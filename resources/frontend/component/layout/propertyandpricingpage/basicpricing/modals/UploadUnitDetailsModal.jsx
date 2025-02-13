import React, { useRef, useEffect, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import CircularProgress from "@mui/material/CircularProgress";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { showToast } from "@/util/toastUtil";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";

const UploadUnitDetailsModal = ({
    uploadUnitModalRef,
    fileName,
    selectedExcelHeader,
    fileSelected,
    handleFileChange,
    propertyData,
}) => {
    //State
    const [formData, setFormData] = useState({});
    const newFileInputRef = useRef();
    const [towerPhaseId, setTowerPhaseId] = useState();
    const [propertyMasterId, setPropertyMasterId] = useState();
    const [priceListMasterId, setPriceListMasterId] = useState();
    const {
        uploadUnits,
        isUploadingUnits,
        fetchFloorCount,
        setFloors,
        setFloorPremiumsAccordionOpen,
    } = useUnit();
    const { priceListMaster } = usePriceListMaster();

    //Hooks
    useEffect(() => {
        if (selectedExcelHeader || propertyData) {
            const initialFormData = selectedExcelHeader.reduce((acc, item) => {
                acc[item.rowHeader] = {
                    rowHeader: item.rowHeader,
                    columnIndex: item.columnIndex,
                };
                return acc;
            }, {});

            const towerPhaseId =
                propertyData?.data?.tower_phases[0]?.id ||
                propertyData?.tower_phase_id;

            const priceListMasterId =
                priceListMaster && priceListMaster.length > 0
                    ? priceListMaster.find(
                          (master) => master.tower_phase_id === towerPhaseId
                      )?.price_list_master_id
                    : null;
            setFormData(initialFormData);
            setTowerPhaseId(propertyData?.tower_phase_id || towerPhaseId);
            setPropertyMasterId(
                propertyData?.property_commercial_detail?.property_master_id ||
                    propertyData?.data?.property_commercial_detail
                        ?.property_master_id
            );
            //If the mode is straight forward Add
            setPriceListMasterId(
                propertyData?.price_list_master_id || priceListMasterId
            );
        }
    }, [selectedExcelHeader, propertyData]);

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
        const payload = {
            headers: Object.values(formData),
            file: fileSelected,
            tower_phase_id: towerPhaseId,
            property_masters_id: propertyMasterId,
            price_list_master_id: priceListMasterId,
        };

        try {
            const response = await uploadUnits(payload);
            if (response?.success === true) {
                setFloors([]);
                console.log("it runs here 93")
                const floors = await fetchFloorCount(
                    towerPhaseId,
                    response?.excelId
                );
                setFloors(floors);
                showToast("Unit uploaded successfully", "success");
                setFloorPremiumsAccordionOpen(true);
                if (uploadUnitModalRef.current) {
                    uploadUnitModalRef.current.close();
                }
            }
        } catch (error) {
            console.log("error uploading excel", error);
        }
    };

    const replaceFile = async (event) => {
        // Trigger the `handleFileChange` function received from BasicPricing
        await handleFileChange(event);
    }; //Handle in replacing the file

    //Handle close the unit upload modal
    const handleClose = () => {
        //TODO: if close, reset the ref of file input field
        if (uploadUnitModalRef.current) {
            uploadUnitModalRef.current.close();
        }
    };
    return (
        <dialog
            className="modal w-[474px] rounded-lg backdrop:bg-black/50"
            ref={uploadUnitModalRef}
        >
            <div className=" px-14 mb-5 rounded-[10px]">
                <div className="">
                    <div
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[50px]"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA3 text-custom-bluegreen hover:bg-custom-grayFA"
                            onClick={handleClose}
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-center bg-custom-grayFA h-[54px] px-[15px] mb-3">
                    <div>
                        <p className="underline text-blue-500 cursor-pointer">
                            {fileName} -TowerId- {towerPhaseId}- PropertyId-{" "}
                            {propertyMasterId}
                        </p>
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
                                onChange={replaceFile}
                            />
                        </label>
                    </div>
                </div>
                <div className="flex justify-start items-center h-40px my-6">
                    <p className="montserrat-bold">Confirm Columns</p>
                </div>
                {/* <div className="py-2 bg-red-900">
                    <p>
                        Loader/ progress bar here
                        TODO: add loader here or progress bar
                    </p>
                </div> */}
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

                    {/* <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Room Number</span>
                        <div  className="relative w-full">
                            <select name="roomNumber" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column1">Column 1</option>
                                <option value="column2">Column 2</option>
                                <option value="column3">Column 3</option>
                                <option value="column4">Column 4</option>
                                <option value="column5">Column 5</option>
                                <option value="column6">Column 6</option>
                                <option value="column7">Column 7</option>
                                <option value="column8">Column 8</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Unit</span>
                        <div  className="relative w-full">
                            <select name="unit" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column1">Column 1</option>
                                <option value="column2">Column 2</option>
                                <option value="column3">Column 3</option>
                                <option value="column4">Column 4</option>
                                <option value="column5">Column 5</option>
                                <option value="column6">Column 6</option>
                                <option value="column7">Column 7</option>
                                <option value="column8">Column 8</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Type</span>
                        <div  className="relative w-full">
                            <select name="type" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column1">Column 1</option>
                                <option value="column2">Column 2</option>
                                <option value="column3">Column 3</option>
                                <option value="column4">Column 4</option>
                                <option value="column5">Column 5</option>
                                <option value="column6">Column 6</option>
                                <option value="column7">Column 7</option>
                                <option value="column8">Column 8</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Floor Area</span>
                        <div  className="relative w-full">
                            <select name="floorArea" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column1">Column 1</option>
                                <option value="column2">Column 2</option>
                                <option value="column3">Column 3</option>
                                <option value="column4">Column 4</option>
                                <option value="column5">Column 5</option>
                                <option value="column6">Column 6</option>
                                <option value="column7">Column 7</option>
                                <option value="column8">Column 8</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Balcony Area</span>
                        <div  className="relative w-full">
                            <select name="balconyArea" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column1">Column 1</option>
                                <option value="column2">Column 2</option>
                                <option value="column3">Column 3</option>
                                <option value="column4">Column 4</option>
                                <option value="column5">Column 5</option>
                                <option value="column6">Column 6</option>
                                <option value="column7">Column 7</option>
                                <option value="column8">Column 8</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Garden Area</span>
                        <div  className="relative w-full">
                            <select name="gardenArea" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column1">Column 1</option>
                                <option value="column2">Column 2</option>
                                <option value="column3">Column 3</option>
                                <option value="column4">Column 4</option>
                                <option value="column5">Column 5</option>
                                <option value="column6">Column 6</option>
                                <option value="column7">Column 7</option>
                                <option value="column8">Column 8</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Total Area</span>
                        <div  className="relative w-full">
                            <select name="totalArea" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column1">Column 1</option>
                                <option value="column2">Column 2</option>
                                <option value="column3">Column 3</option>
                                <option value="column4">Column 4</option>
                                <option value="column5">Column 5</option>
                                <option value="column6">Column 6</option>
                                <option value="column7">Column 7</option>
                                <option value="column8">Column 8</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div> */}
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
