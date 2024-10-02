import React, { useRef, useEffect, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import apiService from "../../../../servicesApi/apiService";
import { useStateContext } from "../../../../../context/contextprovider";
import CircularProgress from "@mui/material/CircularProgress";

const UploadUnitDetailsModal = ({
    excelData,
    uploadUnitModalRef,
    fileName,
    selectedExcelHeader,
    fileSelected,
    propertyId,
    handleFileChange,
}) => {
    //state
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const {
        setTowerPhaseId,
        towerPhaseId,
        setPropertyFloors,
        setFloorPremiumsAccordionOpen,
        getPropertyFloors,
    } = useStateContext();

    //hooks
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
    }, [selectedExcelHeader]); //Initialize formData once selectedExcelHeader is available

    //Event hander
    const handleColumnChange = (newColumnIndex, rowHeader) => {
        // console.log("newColumnIndex", newColumnIndex);
        setFormData((prevFormData) => ({
            ...prevFormData,
            [rowHeader]: {
                ...prevFormData[rowHeader],
                columnIndex: parseInt(newColumnIndex), // Update columnIndex for the selected rowHeader
            },
        }));
    }; // Handle change in column selection

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fileSelected || !propertyId || !towerPhaseId) {
            alert(
                "Please ensure a file is selected and all fields are filled."
            );
            return;
        }
        try {
            setLoading(true);
            const submittedHeader = Object.values(formData);
            const form = new FormData();
            submittedHeader.forEach((header) => {
                form.append("headers[]", JSON.stringify(header)); // Convert each header object to a JSON string rowHeader
            });
            // Append the file if necessary
            form.append("file", fileSelected);
            form.append("towerPhaseId", towerPhaseId);
            form.append("propertyId", propertyId);

            const response = await apiService.post("upload-units", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setTowerPhaseId(towerPhaseId);
            if (towerPhaseId) {
                console.log(
                    "towerPhaseId UploadUnitDetailsModal",
                    towerPhaseId
                );

                // Fetch floors immediately after successful upload to reflect the floor premium
                const floorsResponse = await getPropertyFloors(towerPhaseId);
                // Update propertyFloors in the context
                setPropertyFloors((prev) => ({
                    ...prev,
                    [towerPhaseId]: floorsResponse,
                }));
            }
            alert(response.data.message);
            if (uploadUnitModalRef.current) {
                uploadUnitModalRef.current.close();
            }
            setFloorPremiumsAccordionOpen(true);
        } catch (error) {
            console.log("error uploading excel", error);
        } finally {
            setLoading(false);
        }
    }; //Handle submit units from excel file

    return (
        <dialog
            className="modal w-[474px] rounded-lg backdrop:bg-black/50"
            ref={uploadUnitModalRef}
        >
            <div className=" px-14 mb-5 rounded-[10px]">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[50px]"
                    >
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA3 text-custom-bluegreen hover:bg-custom-grayFA">
                            ✕
                        </button>
                    </form>
                </div>
                <div className="flex justify-between items-center bg-custom-grayFA h-[54px] px-[15px] mb-3">
                    <div>
                        <p className="underline text-blue-500 cursor-pointer">
                            {fileName} -{propertyId}-TowerId{towerPhaseId}
                        </p>
                    </div>
                    <div>
                        <label
                            className="flex justify-center items-center w-[64px] h-[24px] bg-white text-xs border text-[#067AC5] border-[#067AC5] rounded-[5px] hover:shadow-custom4"
                            onClick={handleFileChange}
                        >
                            Replace
                            <input type="file" className="hidden" />
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
                    <button
                        className={`w-[177px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px] hover:shadow-custom4  ${
                            loading ? "cursor-not-allowed" : ""
                        }`}
                        type="submit"
                        onClick={handleSubmit}
                    >
                        {loading ? (
                            <CircularProgress className="spinnerSize" />
                        ) : (
                            <>Confirm and Upload</>
                        )}
                    </button>
                </div>
            </div>
        </dialog>
    );
};

export default UploadUnitDetailsModal;
