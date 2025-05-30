import React, { useState, useEffect } from "react";
import CustomInput from "@/component/Input/CustomInput";
import useFeature from "@/context/RoleManagement/FeatureContext";
import PropertyFeatureCheckbox from "@/component/layout/superadminpage/component/PropertyFeatureCheckbox";
import Spinner from "@/util/Spinner";
import usePropertyFeature from "@/context/RoleManagement/PropertyFeatureContext";
import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";
import { showToast } from "@/util/toastUtil";
import { hasFormChanged } from "@/component/layout/superadminpage/utils/hasFormChanged";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import isFormButtonDisabled from "@/util/isFormButtonDisabled";

const formInitialState = {
    propertyName: "",
    description: "",
    entity: "",
    features: [],
    type: "",
    google_map_link: "",
    barangay: "",
    city: "",
    province: "",
    country: "",
};

const PropertyFeatureForm = ({
    modalRef,
    mode = "add", // 'add' or 'edit'
    selectedProperty = null,
    onClose,
}) => {
    const [formData, setFormData] = useState(formInitialState);
    const [initialData, setInitialData] = useState(formInitialState);
    const [isLoading, setIsLoading] = useState(false);
    const { propertySettingsFeatures } = useFeature();
    const { refreshData } = usePropertyFeature();
    const [error, setError] = useState("");

    // Initialize form data based on mode
    useEffect(() => {
        if (mode === "edit" && selectedProperty) {
            const initialFormState = {
                propertyName: selectedProperty.property_name || "",
                description: selectedProperty.description || "",
                entity: selectedProperty.entity || "",
                features: selectedProperty.features || [],
                type: selectedProperty.type || "",
                google_map_link: selectedProperty.google_map_link || "",
                barangay: selectedProperty.barangay || "",
                city: selectedProperty.city || "",
                province: selectedProperty.province || "",
                country: selectedProperty.country || "",
            };
            setFormData(initialFormState);
            setInitialData(initialFormState);
        } else {
            setFormData(formInitialState);
            setInitialData(formInitialState);
        }
    }, [selectedProperty, mode]);

    // Handle input changes for text fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle checkbox changes for features
    const handleFeatureChange = (feature, isChecked) => {
        if (mode === "edit") {
            const updatedFeatures = formData.features.map((existingFeature) => {
                if (existingFeature.id === feature.id) {
                    return {
                        ...existingFeature,
                        status: isChecked ? "Enabled" : "Disabled",
                    };
                }
                return existingFeature;
            });

            const featureExists = updatedFeatures.some(
                (existingFeature) => existingFeature.id === feature.id
            );

            if (!featureExists && isChecked) {
                updatedFeatures.push({
                    id: feature.id,
                    name: feature.name,
                    status: "Enabled",
                });
            }

            setFormData((prev) => ({
                ...prev,
                features: updatedFeatures,
            }));
        } else {
            // Add mode
            setFormData((prev) => ({
                ...prev,
                features: isChecked
                    ? [
                          ...prev.features,
                          {
                              id: feature.id,
                              name: feature.name,
                              status: "Enabled",
                          },
                      ]
                    : prev.features.filter((f) => f.id !== feature.id),
            }));
        }
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
                type: formData.type,
                google_map_link: formData.google_map_link,
                barangay: formData.barangay,
                city: formData.city,
                province: formData.province,
                country: formData.country,
            };

            // Add propertyId for edit mode
            if (mode === "edit" && selectedProperty) {
                payload.propertyId = selectedProperty.id;
            }

            const response =
                mode === "edit"
                    ? await propertyMasterService.updatePropertyFeatureSettings(
                          payload
                      )
                    : await propertyMasterService.storePropertyFeatureSettings(
                          payload
                      );

            if (
                response.status === 200 ||
                response.status === 201 ||
                response.status === "success"
            ) {
                showToast(
                    response.data.message ||
                        `Property features ${
                            mode === "edit" ? "updated" : "added"
                        } successfully.`,
                    "success"
                );
                await refreshData();
                handleCloseModal();
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const errorMessage = error.response.data.message;
                setError(errorMessage);
            } else {
                showToast(
                    "An error occurred while processing your request.",
                    "error"
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        modalRef.current.close();
        setFormData(mode === "edit" ? initialData : formInitialState);
        setError("");
        if (onClose) onClose();
    };

    // Check if form is valid for submission
    const isFormValid = () => {
        if (mode === "edit") {
            return hasFormChanged(formData, initialData);
        } else {
            const isPropertyButtonDisabled = isFormButtonDisabled(
                formData,
                Object.keys(formInitialState).filter(
                    (key) =>
                        key !== "google_map_link" &&
                        key !== "barangay" &&
                        key !== "city" &&
                        key !== "province" &&
                        key !== "country" &&
                        key !== "description" &&
                        key !== "entity"
                )
            );
            return !isPropertyButtonDisabled;
        }
    };

    return (
        <div className="relative p-[20px] mb-5 rounded-lg h-auto">
            <button
                className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                onClick={handleCloseModal}
            >
                ✕
            </button>
            <div className="pt-5 flex justify-center items-center mb-5">
                <p className="montserrat-bold text-center text-custom-solidgreen">
                    {mode === "edit" ? "Edit" : "Add"} Property Feature
                </p>
            </div>
            {error && (
                <div className="w-full flex justify-center items-center h-auto bg-red-100 mb-4 rounded-lg">
                    <p className="flex text-[#C42E2E] text-center p-1">
                        {error}
                    </p>
                </div>
            )}
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
                                value={
                                    mode === "edit"
                                        ? toLowerCaseText(formData.propertyName)
                                        : formData.propertyName
                                }
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Property Description */}
                    <div className="rounded-[5px] border-custom-gray81 border bg-custombg3">
                        <div className="flex items-center ">
                            <p className="text-custom-bluegreen bg-custom-lightestgreen py-[11px] lg:py-[12px] text-sm pl-3 montserrat-semibold rounded-tl-md w-[70%]">
                                Description
                            </p>
                            <span className="  text-sm2 text-gray-400 font-normal pl-2 pr-12 rounded-tr-[4px] mx-2 w-[30%] h-[42px] flex items-center">
                                {formData.description.length}/350 characters
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
                                maxLength={350}
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
                        <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5 flex w-3/4 pl-3 montserrat-semibold text-sm">
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
                        <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5 flex w-3/4 pl-3 montserrat-semibold text-sm">
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
                        <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5 flex w-3/4 pl-3 montserrat-semibold text-sm">
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
                        <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5 flex w-3/4 pl-3 montserrat-semibold text-sm">
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
                    <div className="  border border-custom-gray81 rounded-md overflow-hidden">
                        <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5 flex    pl-3 montserrat-semibold text-sm">
                            Google Map Link
                        </span>
                        <CustomInput
                            type="textarea"
                            id="google_map_link"
                            name="google_map_link"
                            value={formData.google_map_link || ""}
                            className="w-full px-4 focus:outline-none"
                            onChange={handleInputChange}
                            rows="4"
                        />
                    </div>
                    {/* Features */}
                    <div className="mt-10">
                        <p className="text-sm font-semibold text-custom-solidgreen">
                            Features
                        </p>
                    </div>
                    <div className="flex justify-center gap-x-8 items-center mt-4">
                        {propertySettingsFeatures &&
                            propertySettingsFeatures.map((feature, index) => {
                                const isEnabled = formData.features.some(
                                    (f) =>
                                        f.id === feature.id &&
                                        f.status === "Enabled"
                                );
                                return (
                                    <div className="flex gap-x-4" key={index}>
                                        <p className="text-custom-bluegreen pl-3 montserrat-semibold text-sm">
                                            {feature.name || "Feature Name"}
                                        </p>
                                        <PropertyFeatureCheckbox
                                            checked={isEnabled}
                                            onChange={(e) =>
                                                handleFeatureChange(
                                                    feature,
                                                    e.target.checked
                                                )
                                            }
                                            className="custom-checkbox-permission"
                                        />
                                    </div>
                                );
                            })}
                    </div>

                    {/* Types */}
                    <div className="mt-10">
                        <p className="text-sm font-semibold text-custom-solidgreen">
                            Type
                        </p>
                    </div>
                    <div className="flex justify-center gap-x-6 items-center mt-4">
                        <div className="flex gap-x-4">
                            <p className="text-custom-bluegreen pl-3 montserrat-semibold text-sm">
                                {"Vertical"}
                            </p>
                            <PropertyFeatureCheckbox
                                type="radio"
                                name="type"
                                value="Vertical"
                                checked={formData.type === "Vertical"}
                                onChange={() =>
                                    handleInputChange({
                                        target: {
                                            name: "type",
                                            value: "Vertical",
                                        },
                                    })
                                }
                                className="property-feature-radio"
                            />
                        </div>
                        <div className="flex gap-x-2">
                            <p className="text-custom-bluegreen pl-3 montserrat-semibold text-sm">
                                {"Horizontal"}
                            </p>
                            <PropertyFeatureCheckbox
                                type="radio"
                                name="type"
                                value="Horizontal"
                                checked={formData.type === "Horizontal"}
                                onChange={() =>
                                    handleInputChange({
                                        target: {
                                            name: "type",
                                            value: "Horizontal",
                                        },
                                    })
                                }
                                className="property-feature-radio"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mt-10">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className={`w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn rounded-[10px] hover:shadow-custom4 ${
                                isLoading || !isFormValid()
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                            }`}
                            disabled={isLoading || !isFormValid()}
                        >
                            {isLoading ? (
                                <Spinner className="spinnerSize" />
                            ) : (
                                <>{mode === "edit" ? "Save" : "Add"}</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PropertyFeatureForm;
