import React, { useEffect, useRef, useState } from "react";
import ProjectDetails from "./ProjectDetails";
import PriceListSettings from "./accordion/PriceListSettings";
import AdditionalPremiums from "./accordion/AdditionalPremiums";
import PriceVersions from "./accordion/PriceVersions";
import PaymentSchemes from "./accordion/PaymentSchemes";
import ReviewsandApprovalRouting from "./accordion/ReviewsandApprovalRouting";
import FloorPremiums from "./accordion/FloorPremiums";
import AddPropertyModal from "./modals/AddPropertyModal";
import { Form, useLocation } from "react-router-dom";
import UploadUnitDetailsModal from "./modals/UploadUnitDetailsModal";
import { usePriceListStateContext } from "../../../../context/BasicPricing/PriceListSettingsContext";
import { useFloorPremiumStateContext } from "../../../../context/FloorPremium/FloorPremiumContext";
import { useStateContext } from "../../../../context/contextprovider";
import apiService from "../../../servicesApi/apiService";
import expectedHeaders from "../../../../constant/excelHeader";
import * as XLSX from "xlsx";

const BasicPricing = ({ props }) => {
    //state
    const {
        priceListSettingformData,
        setPriceListSettingformData,
        formDataState,
        propertyFloors,
        towerPhaseId,
        getPropertyFloors,
    } = usePriceListStateContext();
    const { floorPremiumFormData } = useFloorPremiumStateContext();
    const { setTowerPhaseId } = useStateContext();
    const modalRef = useRef(null);
    const uploadUnitModalRef = useRef(null);
    const fileInputRef = useRef(null);
    const location = useLocation();
    const { passPropertyDetails = {} } = location.state || {};

    const [fileName, setFileName] = useState("");
    const [fileSelected, setFileSelected] = useState({});
    const [excelData, setExcelData] = useState({});
    const [selectedExcelHeader, setSelectedExcelHeader] = useState([]);

    //hooks
    //event handler
    const handleOpenAddPropertyModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    }; //open the add property modal
    const handleOpenUnitUploadModal = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }; //open the unit upload modal

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        setFileSelected(file);
        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
            }); //all data in excel

            const selectedHeaders = jsonData[0]; // First row contains headers
            const dataRows = jsonData.slice(1); // All rows after the first one

            // Check for missing headers
            const missingHeaders = expectedHeaders.filter(
                (header) => !selectedHeaders.includes(header)
            );

            //Check for extra headers
            const extraHeaders = selectedHeaders.filter(
                (header) => !expectedHeaders.includes(header)
            );

            // Notify user if missing headers are found
            if (missingHeaders.length > 0) {
                alert(
                    `Please check your Excel header row.\nMissing Headers: ${missingHeaders.join(
                        ", "
                    )}`
                );
                setSelectedExcelHeader([]);
                return;
            }

            // Notify user if extra headers are found, but continue with expected headers
            if (extraHeaders.length > 0) {
                alert(
                    `Please check your Excel header row.\nExtra Headers: ${extraHeaders.join(
                        ", "
                    )}\nProcessing will continue with expected headers only.`
                );
            }

            const reorderedHeaders = expectedHeaders.map((expectedHeader) => {
                // Find the index of the selected header that matches the expected header
                const selectedIndex = selectedHeaders.indexOf(expectedHeader);
                return {
                    rowHeader: expectedHeader,
                    columnIndex: selectedIndex + 1, // Adjust for 1-based column index
                };
            }); //Reorder filtered headers based on expected headers order

            // Now we need to reorder data rows based on this mapping
            const reorderedData = dataRows.map((row) => {
                const reorderedRow = {};
                reorderedHeaders.forEach((headerMapping) => {
                    reorderedRow[headerMapping.rowHeader] =
                        row[headerMapping.columnIndex];
                });
                return reorderedRow;
            });

            //  console.log("reorderedData", reorderedData);
            // Save the formatted headers
            setSelectedExcelHeader(reorderedHeaders);
            //  setExcelData(reorderedData);
            // Proceed with your modal display logic
            if (uploadUnitModalRef.current) {
                uploadUnitModalRef.current.showModal();
            }
        };

        reader.readAsArrayBuffer(file);
    }; //handles the process of uploading an Excel file, extracting the headers

    // const handleSubmit = async (e, status) => {
    //     const priceListSettingFormData = new FormData();
    //     const floorPremiumFormData = new FormData();
    //     try {
    //         priceListSettingFormData.append(
    //             "propertyId",
    //             passPropertyDetails?.propertyData?.id
    //         );
    //         priceListSettingFormData.append(
    //             "basePrice",
    //             priceListSettingformData.basePrice
    //         );
    //         priceListSettingFormData.append(
    //             "transferCharge",
    //             priceListSettingformData.transferCharge
    //         );
    //         priceListSettingFormData.append(
    //             "effectiveBalconyBase",
    //             priceListSettingformData.effectiveBalconyBase
    //         );
    //         priceListSettingFormData.append(
    //             "vat",
    //             priceListSettingformData.vat
    //         );
    //         priceListSettingFormData.append(
    //             "vatableListPrice",
    //             priceListSettingformData.vatableListPrice
    //         );
    //         priceListSettingFormData.append(
    //             "reservationFee",
    //             priceListSettingformData.reservationFee
    //         );
    //         priceListSettingFormData.append("status", status);
    //         const response = await apiService.post(
    //             "basic-pricing",
    //             priceListSettingFormData,
    //             {
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //             }
    //         );
    //         alert(response.data.message);

    //         setPriceListSettingformData(formDataState);
    //     } catch (e) {
    //         console.log("error basic pricing", e);
    //     }
    // };
    const handleSubmit = async (e, status) => {
        try {
            const validFloorPremiums = floorPremiumFormData.floor.filter(
                (floor) => floor.premiumCost && floor.luckyNumber
            ); //Filter not to include if premiumCost/luckyNumber is empty
            const payload = {
                priceList:buildPriceListPayload(
                    priceListSettingformData,
                    status
                ), // Price list data
                floorPremiums: buildFloorPremiumPayload(validFloorPremiums), // Floor premium data
                //Later to add price versions
                // priceVersion: buildPriceVersionPayload(priceVersionFormData),
            };
            console.log("123", payload);
            const response = await apiService.post("basic-pricing", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            alert(response.data.message);

            // Reset form data
           setPriceListSettingformData(formDataState);
        } catch (e) {
            console.log("Error in basic pricing submission", e);
        }
    };
    //hooks
    useEffect(() => {
        if (passPropertyDetails) {
            const towerId =
                passPropertyDetails?.propertyData?.tower_phases[0].id;

            setTowerPhaseId((prev) => (prev !== towerId ? towerId : prev));
        }
    }, [passPropertyDetails]);

    //Helper function-> Logic is specific to the component and won't be reused.
    const buildPriceListPayload = (priceListData, status) => {
        return {
            propertyId: passPropertyDetails?.propertyData?.id,
            basePrice: parseInt(priceListData.basePrice),
            transferCharge: priceListData.transferCharge,
            effectiveBalconyBase: priceListData.effectiveBalconyBase,
            vat: priceListData.vat,
            vatableListPrice: priceListData.vatableListPrice,
            reservationFee: priceListData.reservationFee,
            status: status,
        };
    }; // Helper function to build price list payload

    const buildFloorPremiumPayload = (validFloorPremiums) => {
        return validFloorPremiums.map((floor) => ({
            floor: floor.floor,
            premiumCost: parseInt(floor.premiumCost),
            luckyNumber: floor.luckyNumber,
        }));
        // return validFloorPremiums.floor.map((floor) => ({
        //     floor: floor.floor,
        //     premiumCost: floor.premiumCost,
        //     luckyNumber: floor.luckyNumber,
        // }));
    }; // Helper function to build floor premium payload
    return (
        <div className="h-screen max-w-[957px] min-w-[897px] bg-custom-grayFA px-[30px] ">
            {/* button ra if walay pa property */}
            <div className="px-5 mb-7  ">
                <button
                    onClick={handleOpenAddPropertyModal}
                    className="montserrat-semibold text-sm px-2 gradient-btn2 w-[214px] h-[37px] rounded-[10px] text-white hover:shadow-custom4"
                >
                    Add Property and Pricing
                </button>
            </div>
            {/* kung naa nay property */}
            {passPropertyDetails &&
                Object.keys(passPropertyDetails).length > 0 && (
                    <ProjectDetails {...passPropertyDetails} />
                )}

            <div className="flex gap-[15px] py-5">
                <button
                    onClick={handleOpenUnitUploadModal}
                    className="h-[37px] w-[162px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4"
                >
                    Upload Unit Details
                </button>
                <button
                    className="h-[37px] w-[176px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4"
                    type="submit"
                    onClick={(e) => handleSubmit(e, "On-going Approval")}
                >
                    Submit for Approval
                </button>
                <button
                    className="h-[37px] w-[117px] rounded-[10px] text-custom-solidgreen montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4 p-[3px]"
                    type="submit"
                    onClick={(e) => handleSubmit(e, "Draft")}
                >
                    <div className="flex justify-center items-center h-full w-full rounded-[8px] bg-white">
                        Save as Draft
                    </div>
                </button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <div>
                <UploadUnitDetailsModal
                    excelData={excelData}
                    handleFileChange={handleFileChange}
                    propertyId={passPropertyDetails?.propertyData?.id}
                    // towerPhaseId={
                    //     passPropertyDetails?.propertyData?.tower_phases[0].id
                    // }
                    uploadUnitModalRef={uploadUnitModalRef}
                    fileName={fileName}
                    selectedExcelHeader={selectedExcelHeader}
                    fileSelected={fileSelected}
                />
            </div>
            {/* ------------------------- */}

            <div className="flex flex-col gap-1 w-full border-t-1 border-custom-lightestgreen py-4  ">
                <PriceListSettings />
                <FloorPremiums
                    propertyId={passPropertyDetails?.propertyData?.id}
                    // towerPhaseId={
                    //     passPropertyDetails?.propertyData?.tower_phases[0].id
                    // }
                />
                <AdditionalPremiums />
                <PriceVersions />
                <PaymentSchemes />
                <ReviewsandApprovalRouting />
            </div>

            <div>
                <AddPropertyModal modalRef={modalRef} />
            </div>
        </div>
    );
};

export default BasicPricing;
