import React, { useEffect, useState, useRef } from "react";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import { PROPERTY_SETTING_COLUMNS } from "@/constant/data/tableColumns";
import usePropertyFeature from "@/context/RoleManagement/PropertyFeatureContext";
import PropertyFeatureRow from "@/component/layout/superadminpage/component/tableRow/PropertyFeatureRow";
import useFeature from "@/context/RoleManagement/FeatureContext";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import PropertyFeatureCheckbox from "@/component/layout/superadminpage/component/PropertyFeatureCheckbox";
import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";
import { showToast } from "@/util/toastUtil";
import EditPropertyFeature from "@/component/layout/superadminpage/modals/PropertySettingModal/EditPropertyFeature";
import { HiPencil } from "react-icons/hi";

const PropertySetting = () => {
    const editPropertyFeatureRef = useRef(null);
    const { propertyFeatures, fetchPropertyFeatures, isLoading } =
        usePropertyFeature();
    const { propertySettingsFeatures, fetchPropertySettingsFeatures } =
        useFeature();
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState([]);

    //Hooks
    useEffect(() => {
        fetchPropertyFeatures(true);
        fetchPropertySettingsFeatures();
        setIsFirstLoad(false);
    }, []);

    // Derive columns dynamically
    const propertySettingColumns = [
        { label: "Property Name", width: "w-[200px]" },
        { label: "Description", width: "w-[200px]" },
        { label: "Entity", width: "w-[120px]" },
        ...(propertySettingsFeatures?.map((item) => ({
            label: item.name,
            width: "w-[100px]",
        })) || []),
        { label: "Actions", width: "w-[0px]" },
    ];

    //Event handler
    const handlePropertyFeatureChange = async (
        property,
        featureName,
        isChecked
    ) => {
        try {
            // Find the feature to update
            const featureToUpdate = property.features.find(
                (feature) => feature.name === featureName
            );

            if (!featureToUpdate) {
                console.error("Feature not found:", featureName);
                return;
            }

            // Prepare the payload for the API call
            const payload = {
                propertyId: property.id, // Property ID
                featureId: featureToUpdate.id, // Feature ID
                status: isChecked, // New status (true for enabled, false for disabled)
            };

            // Call the API to update the feature status
            const response =
                await propertyMasterService.updatePropertyFeatureSettings(
                    payload
                );
            console.log("response from update:", response);
            if (response.status === 200) {
                showToast(response.data.message, "success");
            }
            await fetchPropertyFeatures(false); // Refresh the property features after update
        } catch (error) {
            console.error("Error updating feature:", error);
        }
    };

    //Open modal
    const handleOpenModal = (property, action) => {
        if (action === "edit") {
            if (action === "edit" && editPropertyFeatureRef.current) {
                setSelectedProperty(property);
                editPropertyFeatureRef.current.showModal();
            }
        }
    };
    return (
        <div className="h-screen max-w-full bg-custom-grayFA p-[20px]">
            <button className="montserrat-semibold text-sm px-5 gradient-btn h-[37px] rounded-[10px] text-white hover:shadow-custom4">
                <span className="text-[18px] mt-1 mr-2">+</span>
                Add Property
            </button>

            {/* Table */}
            <div className="mt-3 mx-1 py-4">
                {/* <CustomTable
                    className="flex gap-4 items-center h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen mb-4 -mx-1 px-4"
                    columns={PROPERTY_SETTING_COLUMNS}
                    data={propertyFeatures}
                    renderRow={(item, index) => (
                        <tr key={index}>
                            <td>{item.property_name}</td>
                            <td>
                                {item.features.map((feature, featureIndex) => (
                                    <div key={featureIndex}>
                                        {feature.name} - {feature.status}
                                    </div>
                                ))}
                            </td>
                            <td>Static Content 3</td>
                            <td>Static Content 4</td>
                        </tr>
                    )}
                /> */}
                <table className="  w-full border-collapse">
                    <thead>
                        <tr className="h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen">
                            {propertySettingColumns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`text-start px-4 py-2 ${col.width}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && isFirstLoad ? (
                            <tr>
                                <td
                                    colSpan={propertySettingColumns.length}
                                    className="text-center py-4"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : propertyFeatures &&
                          propertyFeatures.features &&
                          propertyFeatures.features.length > 0 ? (
                            propertyFeatures.features.map((property, index) => (
                                <tr
                                    key={index}
                                    className="even:bg-custombg3 h-16"
                                >
                                    {/* Static columns */}
                                    <td className="px-4 py-2 montserrat-regular">
                                        {/* {toLowerCaseText(
                                            property?.property_name
                                        )} */}
                                        {property?.property_name}
                                    </td>
                                    <td className="px-4 py-2 montserrat-regular">
                                        {property.description || "N/A"}
                                    </td>
                                    <td className="px-4 py-2 montserrat-regular">
                                        {property.entity || "N/A"}
                                    </td>

                                    {/* Dynamic feature columns */}
                                    {propertySettingColumns
                                        .slice(3)
                                        .map((featureColumn, colIndex) => {
                                            const feature =
                                                property.features.find(
                                                    (f) =>
                                                        f.name ===
                                                        featureColumn.label
                                                );
                                            return (
                                                <td
                                                    key={colIndex}
                                                    className="px-4 py-2 montserrat-regular text-start "
                                                >
                                                    {feature ? (
                                                        <PropertyFeatureCheckbox
                                                            checked={
                                                                feature.status ===
                                                                "Enabled"
                                                            }
                                                            onChange={(e) =>
                                                                handlePropertyFeatureChange(
                                                                    property,
                                                                    feature.name,
                                                                    e.target
                                                                        .checked
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <div>
                                                            <HiPencil
                                                                onClick={() =>
                                                                    handleOpenModal(
                                                                        property,
                                                                        "edit"
                                                                    )
                                                                }
                                                                className="w-5 h-5 text-custom-bluegreen cursor-pointer"
                                                            />
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={propertySettingColumns.length}
                                    className="text-center py-4"
                                >
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div>
                <EditPropertyFeature
                    selectedProperty={selectedProperty}
                    editPropertyFeatureRef={editPropertyFeatureRef}
                />
            </div>
        </div>
    );
};

export default PropertySetting;
