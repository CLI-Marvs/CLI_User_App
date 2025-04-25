import React, { useEffect, useState } from "react";
import CustomInput from "@/component/Input/CustomInput";
import Spinner from "@/util/Spinner";
import PropertyFeatureCheckbox from "@/component/layout/superadminpage/component/PropertyFeatureCheckbox";
import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";
import { showToast } from "@/util/toastUtil";

const formInitialState = {
    propertyName: "",
    description: "",
    entity: "",
    features: [],
};
const EditPropertyFeature = ({ editPropertyFeatureRef, selectedProperty }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(formInitialState);

    // Initialize form data when `selectedProperty` changes
    useEffect(() => {
        if (selectedProperty) {
            setFormData({
                propertyName: selectedProperty.property_name || "",
                description: selectedProperty.description || "",
                entity: selectedProperty.entity || "",
                features: selectedProperty.features || [],
            });
        }
    }, [selectedProperty]);

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
            features: prev.features.map((feature) =>
                feature.id === featureId
                    ? { ...feature, status: isChecked ? "Enabled" : "Disabled" }
                    : feature
            ),
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                propertyId: selectedProperty.id,
                propertyName: formData.propertyName,
                description: formData.description,
                entity: formData.entity,
                features: formData.features.map((feature) => ({
                    id: feature.id,
                    status: feature.status === "Enabled", // Convert "Enabled"/"Disabled" to boolean
                })),
            };

            // // Call the `onSave` function passed as a prop to send the payload to the backend
            // await onSave(formData);
            // setIsLoading(false);
            // handleCloseModal();
            const response =
                await propertyMasterService.updatePropertyFeatureSettings(
                    payload
                );

            if (response.status === 200) {
                showToast(response.data.message, "success");
            }
        } catch (error) {
            console.error("Error saving property features:", error);
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (editPropertyFeatureRef.current) {
            editPropertyFeatureRef.current.close();
            // Reset form data when closing the modal
            // setFormData((prev) => ({
            //     ...prev,
            //     propertyName: "",
            //     description: "",
            //     entity: "",
            //     features: [],
            // }));
            //TODO: reset form data if close modal
        }
    };

    return (
        <dialog
            className="modal w-[550px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={editPropertyFeatureRef}
        >
            <div className="relative p-[20px] mb-5 rounded-lg">
                <button
                    className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                    onClick={handleCloseModal}
                >
                    ✕
                </button>
                <div className="pt-5 flex justify-center items-center mb-5">
                    <p className="montserrat-bold text-center text-custom-solidgreen">
                        Edit Property Feature
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
                                <p className="text-custom-bluegreen bg-custom-lightestgreen py-[10px] lg:py-[12px] text-sm pl-3 montserrat-semibold">
                                    Description
                                </p>
                                <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border-l pl-2 pr-12">
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

                        {/* Features */}
                        <div className="mt-10">
                            <p className="text-sm font-semibold text-custom-solidgreen">
                                Features
                            </p>
                        </div>
                        {formData.features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex gap-x-6 items-center border border-custom-gray81 rounded-md overflow-hidden w-[300px]"
                            >
                                <p className="text-custom-bluegreen bg-custom-lightestgreen py-1.5 pl-3 montserrat-semibold text-sm w-[215px]">
                                    {feature.name || "Feature Name"}
                                </p>
                                <PropertyFeatureCheckbox
                                    checked={feature.status === "Enabled"}
                                    onChange={(e) =>
                                        handleFeatureChange(
                                            feature.id,
                                            e.target.checked
                                        )
                                    }
                                />
                            </div>
                        ))}

                        {/* Save Button */}
                        <div className="flex justify-center mt-10">
                            <button
                                className={`w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn rounded-[10px] hover:shadow-custom4 ${
                                    isLoading
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Spinner className="spinner-size" />
                                ) : (
                                    <>Save</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default EditPropertyFeature;
