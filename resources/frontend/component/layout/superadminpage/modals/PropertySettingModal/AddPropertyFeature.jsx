import React, { useState, useEffect } from "react";
import CustomInput from "@/component/Input/CustomInput";
import useFeature from "@/context/RoleManagement/FeatureContext";
import PropertyFeatureCheckbox from "@/component/layout/superadminpage/component/PropertyFeatureCheckbox";
import Spinner from "@/util/Spinner";
import usePropertyFeature from "@/context/RoleManagement/PropertyFeatureContext";
import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";
import { showToast } from "@/util/toastUtil";
import isButtonDisabled from "@/util/isFormButtonDisabled";

const formInitialState = {
    propertyName: "",
    description: "",
    entity: "",
    features: [],
    propertyType: "",
    google_map_link: "",
    barangay: "",
    city: "",
    province: "",
    country: "",
};

const AddPropertyFeature = ({ addPropertyFeatureRef }) => {
    const [formData, setFormData] = useState(formInitialState);
    const [isLoading, setIsLoading] = useState(false);
    const { propertySettingsFeatures } = useFeature();
    const { refreshData } = usePropertyFeature();
    const isPropertyButtonDisabled = isButtonDisabled(
        formData,
        Object.keys(formInitialState).filter((key) => key !== "google_map_link")
    );

    //Event handler
    // Handle input changes for text fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle checkbox changes for features
    const handleFeatureChange = (featureId, isChecked) => {
        setFormData((prev) => ({
            ...prev,
            features: isChecked
                ? [...prev.features, { id: featureId, status: "Enabled" }]
                : prev.features.filter((f) => f.id !== featureId),
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                propertyName: formData.propertyName,
                description: formData.description,
                entity: formData.entity,
                features: formData.features.map((feature) => ({
                    id: feature.id,
                    status: feature.status === "Enabled",
                })),
                type: formData.propertyType,
                google_map_link: formData.google_map_link,
                barangay: formData.barangay,
                city: formData.city,
                province: formData.province,
                country: formData.country,
            };

            const response =
                await propertyMasterService.storePropertyFeatureSettings(
                    payload
                );

            if (response.status === 201 || response.status === "success") {
                showToast(
                    response.data.message ||
                    "Property features added successfully.",
                    "success"
                );
                await refreshData();
                handleCloseModal();
            }
        } catch (error) {
            console.error("Error saving property features:", error);
            setIsLoading(false);
        }
    };

    //Handle modal close
    const handleCloseModal = () => {
        if (addPropertyFeatureRef.current) {
            addPropertyFeatureRef.current.close();
            setIsLoading(false);
            setFormData(formInitialState);
        }
    };

    return (
        <dialog
            className="modal w-[550px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={addPropertyFeatureRef}
        >
            <div className="relative p-[20px] mb-5 rounded-lg h-auto">
                <button
                    className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                    onClick={handleCloseModal}
                >
                    ✕
                </button>
                <div className="pt-5 flex justify-center items-center mb-5">
                    <p className="montserrat-bold text-center text-custom-solidgreen">
                        Add Property Feature
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        {/* Property Name */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5 flex items-center w-3/4 pl-3 montserrat-semibold text-sm">
                                Property Name
                            </span>
                            <div className="relative w-full">
                                <CustomInput
                                    type="text"
                                    name="propertyName"
                                    value={formData.propertyName}
                                    className="w-full px-4 focus:outline-none"
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Property Description */}
                        <div className="rounded-[5px] border-custom-gray81 border bg-custombg3">
                            <div className="flex items-center justify-between">
                                <p className="text-custom-bluegreen bg-custom-lightestgreen py-[11px] lg:py-[12px] text-sm pl-3 montserrat-semibold rounded-tl-md">
                                    Description
                                </p>
                                <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border-l pl-2 pr-12 rounded-tr-[4px]">
                                    {formData.description.length}/300 characters
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <CustomInput
                                    type="textarea"
                                    name="description"
                                    value={formData.description}
                                    className="rounded-b-[5px] border-t w-full pl-2 outline-none"
                                    onChange={handleInputChange}
                                    rows="4"
                                    maxLength={300}
                                />
                            </div>
                        </div>

                        {/* Entity */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5 flex w-3/4 pl-3 montserrat-semibold text-sm">
                                Entity
                            </span>
                            <CustomInput
                                type="text"
                                name="entity"
                                value={formData.entity}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Address */}
                        <div className="mt-10">
                            <p className="text-sm font-semibold text-custom-solidgreen">
                                Address
                            </p>
                        </div>
                        {/*Street/ Barangy */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex w-3/4 pl-3  montserrat-semibold  text-sm">
                                Street/Barangay
                            </span>
                            <CustomInput
                                type="text"
                                name="barangay"
                                value={formData.barangay || ""}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>


                        {/* City */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex w-3/4 pl-3  montserrat-semibold text-sm">
                                City
                            </span>
                            <CustomInput
                                type="text"
                                name="city"
                                value={formData.city || ""}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Province */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex w-3/4 pl-3 montserrat-semibold  text-sm">
                                Province
                            </span>
                            <CustomInput
                                type="text"
                                name="province"
                                value={formData.province || ""}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Country */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex w-3/4 pl-3   montserrat-semibold  text-sm">
                                Country
                            </span>
                            <CustomInput
                                type="text"
                                name="country"
                                value={formData.country || ""}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Google Map Link */}
                        <div className="rounded-[5px] border-custom-gray81 border bg-custombg3">
                            <div className="">
                                <p className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  pl-3  montserrat-semibold flex-grow mobile:text-xs mobile:w-[170px] w-[215px] rounded-tl-md">
                                    Google Map Link
                                </p>
                            </div>
                            <div className="flex gap-3 ">
                                <CustomInput
                                    type="textarea"
                                    id="google_map_link"
                                    name="google_map_link"
                                    value={formData.google_map_link || ""}
                                    className={` rounded-b-[5px] border-t w-full pl-2 outline-none`}
                                    onChange={handleInputChange}
                                    rows="4"
                                />
                            </div>
                        </div>


                        {/* Features */}
                        <div className="mt-10">
                            <p className="text-sm font-semibold text-custom-solidgreen">
                                Features
                            </p>
                        </div>
                        <div className="flex justify-center gap-x-8 items-center">
                            {propertySettingsFeatures && propertySettingsFeatures.map((feature, index) => {
                                const isEnabled = formData.features.some(
                                    (f) => f.id === feature.id
                                );
                                return (
                                    <div className="flex  gap-x-4">
                                        <p className="text-custom-bluegreen pl-3 montserrat-semibold text-sm">
                                            {feature.name || "Feature Name 1"}
                                        </p>
                                        <PropertyFeatureCheckbox
                                            checked={isEnabled}
                                            onChange={(e) =>
                                                handleFeatureChange(
                                                    feature.id,
                                                    e.target.checked
                                                )
                                            }
                                            className="custom-checkbox-permission"
                                        />
                                    </div>
                                )
                            })}


                        </div>

                        {/* Types */}
                        <div className="mt-10">
                            <p className="text-sm font-semibold text-custom-solidgreen">
                                Type
                            </p>
                        </div>

                        <div className="flex justify-center gap-x-6 items-center">
                            <div className="flex  gap-x-4">
                                <p className="text-custom-bluegreen pl-3 montserrat-semibold text-sm">
                                    {"Vertical"}
                                </p>
                                <PropertyFeatureCheckbox
                                    type="radio"
                                    name="propertyType"
                                    value="Vertical"
                                    checked={formData?.propertyType === "Vertical"}
                                    onChange={(e) => handleInputChange({
                                        target: {
                                            name: "propertyType",
                                            value: "Vertical"
                                        }
                                    })}
                                    className="property-feature-radio"
                                />
                            </div>
                            <div className="flex  gap-x-4">
                                <p className="text-custom-bluegreen pl-3 montserrat-semibold text-sm">
                                    {"Horizontal"}
                                </p>
                                <PropertyFeatureCheckbox
                                    type="radio"
                                    name="propertyType"
                                    value="Horizontal"
                                    checked={formData?.propertyType === "Horizontal"}
                                    onChange={(e) => handleInputChange({
                                        target: {
                                            name: "propertyType",
                                            value: "Horizontal"
                                        }
                                    })}
                                    className="property-feature-radio"
                                />
                            </div>
                        </div>


                        {/* Save Button */}
                        <div className="flex justify-center mt-10">
                            <button
                                onClick={handleSubmit}
                                className={`w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn rounded-[10px] hover:shadow-custom4 ${isLoading || isPropertyButtonDisabled
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                    }`}
                                disabled={isLoading || isPropertyButtonDisabled}
                            >
                                {isLoading ? (
                                    <Spinner className="spinnerSize" />
                                ) : (
                                    <>Add</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default AddPropertyFeature;
