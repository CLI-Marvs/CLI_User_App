import React, { useRef, useState } from "react";
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
import { useStateContext } from "../../../../context/BasicPricing/PriceListSettingsContext";
import apiService from "../../../servicesApi/apiService";

const BasicPricing = ({ props }) => {
    //state
    const modalRef = useRef(null);
    const location = useLocation();
    const { passPropertyDetails = {} } = location.state || {};

    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef(null);
    const uploadModalRef = useRef(null);
    const {
        priceListSettingformData,
        setPriceListSettingformData,
        formDataState,
    } = useStateContext();
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

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            if (modalRef.current) {
                modalRef.current.showModal();
            }
        }
    }; //get the selected file

    const handleSubmit = async (e, status) => {
        const priceListSettingFormData = new FormData();
        try {
            priceListSettingFormData.append(
                "propertyId",
                passPropertyDetails?.id
            );
            priceListSettingFormData.append(
                "basePrice",
                priceListSettingformData.basePrice
            );
            priceListSettingFormData.append(
                "transferCharge",
                priceListSettingformData.transferCharge
            );
            priceListSettingFormData.append(
                "effectiveBalconyBase",
                priceListSettingformData.effectiveBalconyBase
            );
            priceListSettingFormData.append(
                "vat",
                priceListSettingformData.vat
            );
            priceListSettingFormData.append(
                "vatableListPrice",
                priceListSettingformData.vatableListPrice
            );
            priceListSettingFormData.append(
                "reservationFee",
                priceListSettingformData.reservationFee
            );
            priceListSettingFormData.append("status", status);
            const response = await apiService.post(
                "basic-pricing",
                priceListSettingFormData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            alert(response.data.message);
            console.log("response Basic Pricing", response.data.message);
            setPriceListSettingformData(formDataState);
        } catch (e) {
            console.log("error basic pricing", e);
        }
    };
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
                    modalRef={uploadModalRef}
                    fileName={fileName}
                />
            </div>
            {/* ------------------------- */}

            <div className="flex flex-col gap-1 w-full border-t-1 border-custom-lightestgreen py-4  ">
                <PriceListSettings />
                <FloorPremiums />
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
