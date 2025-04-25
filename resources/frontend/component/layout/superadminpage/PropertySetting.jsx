import React, { useEffect, useState } from "react";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import { PROPERTY_SETTING_COLUMNS } from "@/constant/data/tableColumns";
import usePropertyFeature from "@/context/RoleManagement/PropertyFeatureContext";
import PropertyFeatureRow from "@/component/layout/superadminpage/component/tableRow/PropertyFeatureRow";
import useFeature from "@/context/RoleManagement/FeatureContext";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import PropertyFeatureCheckbox from "@/component/layout/superadminpage/component/PropertyFeatureCheckbox";

const PropertySetting = () => {
    const { propertyFeatures, fetchPropertyFeatures, isLoading } =
        usePropertyFeature();
    const { propertySettingsFeatures, fetchPropertySettingsFeatures } =
        useFeature();
    const [propertySettingColumns, setPropertySettingColumns] = useState([]);
    useEffect(() => {
        fetchPropertyFeatures(true);
        fetchPropertySettingsFeatures();
    }, []);

    //Update the property setting columns
    useEffect(() => {
        if (PROPERTY_SETTING_COLUMNS && propertySettingsFeatures) {
            // Extract feature names from propertySettingsFeatures
            const featureColumns = propertySettingsFeatures.map((item) => ({
                label: item.name, // Use the feature name as the column label
                width: "w-[100px]", // Set a default width for the feature columns
            }));

            // Append the feature columns to the existing PROPERTY_SETTING_COLUMNS
            setPropertySettingColumns([
                ...PROPERTY_SETTING_COLUMNS, // Keep the existing columns
                ...featureColumns, // Add the dynamically generated feature columns
            ]);
        }
    }, [PROPERTY_SETTING_COLUMNS, propertySettingsFeatures]);

    const handlePropertyFeatureChange = (item, permission, checked) => {};

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
                        {isLoading ? (
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
                                                    className="px-4 py-2 montserrat-regular text-start"
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
                                                        "N/A"
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
        </div>
    );
};

export default PropertySetting;
