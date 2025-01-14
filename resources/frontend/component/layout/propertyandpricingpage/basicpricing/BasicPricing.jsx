import React, { useEffect, useRef, useState } from "react";
import ProjectDetails from "./ProjectDetails";
import PriceListSettings from "./accordion/PriceListSettings";
import AdditionalPremiums from "./accordion/AdditionalPremiums";
import PriceVersions from "./accordion/PriceVersions";
import PaymentSchemes from "./accordion/PaymentSchemes";
import ReviewsandApprovalRouting from "./accordion/ReviewsandApprovalRouting";
import FloorPremiums from "./accordion/FloorPremiums";
import AddPropertyModal from "./modals/Property/AddPropertyModal";
import { Form, useLocation } from "react-router-dom";
import UploadUnitDetailsModal from "./modals/UploadUnitDetailsModal";
import { usePriceBasicDetailStateContext } from "../../../../context/PriceBasicDetail/PriceBasicContext";
import { useFloorPremiumStateContext } from "../../../../context/FloorPremium/FloorPremiumContext";
import { useStateContext } from "../../../../context/contextprovider";
import apiService from "../../../servicesApi/apiService";
import expectedHeaders from "../../../../constant/data/excelHeader";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const BasicPricing = () => {
    //State
    const {
        priceBasicDetailsFormData,
        setPriceBasicDetailsFormData,
        formDataState,
    } = usePriceBasicDetailStateContext();
    const { floorPremiumFormData } = useFloorPremiumStateContext();
    const { propertyId, user, towerPhaseId } = useStateContext();
    const modalRef = useRef(null);
    const uploadUnitModalRef = useRef(null);
    const fileInputRef = useRef(null);
    const location = useLocation();
    const { passPropertyDetails = {} } = location.state || {};
    const [localPropertyData, setLocalPropertyData] =
        useState(passPropertyDetails);
    const navigate = useNavigate();
    const [fileName, setFileName] = useState("");
    const [fileSelected, setFileSelected] = useState({});
    const [selectedExcelHeader, setSelectedExcelHeader] = useState([]);

    //Hooks
    useEffect(() => {
        setLocalPropertyData(passPropertyDetails);
    }, []);

    //Event handler

    /**
     * Open the add property modal
     */
    const handleOpenAddPropertyModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    /**
     * Open the unit upload modal
     */
    const handleOpenUnitUploadModal = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    /**
     * Handles the process of uploading an Excel file, extracting the headers
     */
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
                //TODO: Convert this into Toast
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
                //TODO: Convert this into Toast
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
    };

    /**
     * Handles in submitting all data in creating price master list
     */
    const handleSubmit = async (e, status) => {
        const validFloorPremiums = floorPremiumFormData.floor.filter(
            (floor) => {
                return (
                    floor.premiumCost !== undefined &&
                    floor.premiumCost !== "" &&
                    floor.luckyNumber !== undefined
                ); // Only check if `luckyNumber` is defined
            }
        );

        if (
            validFloorPremiums.length ||
            priceBasicDetailsFormData.basePrice ||
            priceBasicDetailsFormData.reservationFee
        ) {
            try {
                const payload = {
                    priceList: buildPriceListPayload(
                        priceBasicDetailsFormData,
                        status
                    ), // Price list data
                    empId: user?.id,
                    towerPhaseId: towerPhaseId,
                    propertyId: propertyId,
                    floorPremiums: buildFloorPremiumPayload(validFloorPremiums), // Floor premium data
                    //Later to add price versions
                    // priceVersion: buildPriceVersionPayload(priceVersionFormData),
                };
                const response = await apiService.post(
                    "basic-pricing",
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                //TODO: Convert this into Toast
                alert(response.data.message);
                // Reset form data
                // setTimeout(() => {
                //     setPriceBasicDetailsFormData(formDataState);
                //     navigate("/propertyandpricing/pricingmasterlist");
                // }, 1000);
            } catch (error) {
                console.log("Error in basic pricing submission", e);
            }
        } else {
            console.log("Else run here");
            // setTimeout(() => {
            //     navigate("/propertyandpricing/pricingmasterlist");
            // }, 1000);
        }
    };

    /**
     *Helper function-> This function's logic is tightly coupled with the component's requirements and is not intended for reuse in other components.
     */
    const buildPriceListPayload = (priceListData, passedStatus) => {
        return {
            propertyId: propertyId,
            basePrice: parseInt(priceListData.basePrice),
            transferCharge: priceListData.transferCharge,
            effectiveBalconyBase: priceListData.effectiveBalconyBase,
            vat: priceListData.vat,
            vatableListPrice: priceListData.vatableListPrice,
            reservationFee: priceListData.reservationFee,
            status: passedStatus,
        };
    };
    const buildFloorPremiumPayload = (validFloorPremiums) => {
        return validFloorPremiums.map((floor) => ({
            floor: floor.floor,
            premiumCost: parseInt(floor.premiumCost),
            luckyNumber: floor.luckyNumber,
            excludedUnits: floor.excludedUnits,
        }));
    };

    return (
        <div className="h-screen max-w-[957px] min-w-[897px] bg-custom-grayFA px-[30px] ">
            {/* button ra if walay pa property */}
            <div className="px-5 mb-7  ">
                {!passPropertyDetails && (
                    <button
                        onClick={handleOpenAddPropertyModal}
                        className="montserrat-semibold text-sm px-2 gradient-btn2 w-[214px] h-[37px] rounded-[10px] text-white hover:shadow-custom4"
                    >
                        Add Property and Pricing
                    </button>
                )}
            </div>
            {/* kung naa nay property */}
            {localPropertyData && Object.keys(localPropertyData).length > 0 && (
                <ProjectDetails localPropertyData={localPropertyData} />
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
                    handleFileChange={handleFileChange}
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
