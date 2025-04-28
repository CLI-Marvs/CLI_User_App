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
import AddPropertyFeature from "@/component/layout/superadminpage/modals/PropertySettingModal/AddPropertyFeature";
import { HiPencil } from "react-icons/hi";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";

const PropertySetting = () => {
    const editPropertyFeatureRef = useRef(null);
    const addPropertyFeatureRef = useRef(null);
    const {
        propertyFeatures,
        isLoading,
        pagination,
        filters,
        updateFilters,
        updatePagination,
        resetToDefaults,
        fetchData,
        refreshData,
        setIsPropertyFeatureActive,
    } = usePropertyFeature();

    const { propertySettingsFeatures, fetchPropertySettingsFeatures } =
        useFeature();
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState([]);

    //Hooks
    useEffect(() => {
        setIsPropertyFeatureActive(true);
        return () => {
            setIsPropertyFeatureActive(false);
        };
    }, []);

    useEffect(() => {
        fetchPropertySettingsFeatures();
        if (propertyFeatures?.length > 0 && isFirstLoad) setIsFirstLoad(false);
    }, [propertyFeatures]);

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

    //Open modal
    const handleOpenModal = (property, action) => {
        if (action === "edit" && editPropertyFeatureRef.current) {
            setSelectedProperty(property);
            editPropertyFeatureRef.current.showModal();
        } else if (action === "add" && addPropertyFeatureRef.current) {
            addPropertyFeatureRef.current.showModal();
        }
    };

    // Handles pagination: Moves to the next page when clicked
    const handlePageChange = (selectedPage) => {
        if (selectedPage !== pagination.currentPage) {
            console.log("Selected page:", selectedPage);
            console.log("pagination.currentPagee:", pagination.currentPage);

            updatePagination(selectedPage);
        }
    };

    return (
        <div className="h-screen max-w-full bg-custom-grayFA p-[20px]">
            <button
                onClick={() => {
                    handleOpenModal("", "add");
                }}
                className="montserrat-semibold text-sm px-5 gradient-btn h-[37px] rounded-[10px] text-white hover:shadow-custom4"
            >
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
                                    colSpan={
                                        propertySettingColumns &&
                                        propertySettingColumns.length
                                    }
                                    className="text-center py-4"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : propertyFeatures && propertyFeatures.length > 0 ? (
                            propertyFeatures.map((property, index) => (
                                <tr
                                    key={index}
                                    className="even:bg-custombg3 h-16"
                                >
                                    {/* Static columns */}
                                    <td className="px-4 py-2 montserrat-regular">
                                        {toLowerCaseText(
                                            property?.property_name
                                        )}
                                    </td>
                                    <td className="px-4 py-2 montserrat-regular">
                                        {property.description || "N/A"}
                                    </td>
                                    <td className="px-4 py-2 montserrat-regular">
                                        {property.entity || "N/A"}
                                    </td>

                                    {/* Dynamic feature columns */}
                                    {propertySettingColumns &&
                                        propertySettingColumns
                                            .slice(3, -1)
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
                                                                isDisabled={
                                                                    true
                                                                }
                                                            />
                                                        ) : (
                                                            <div>
                                                                <PropertyFeatureCheckbox
                                                                    checked={
                                                                        false
                                                                    }
                                                                    isDisabled
                                                                />
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                    <td className="px-4 py-2 montserrat-regular text-start">
                                        <HiPencil
                                            onClick={() =>
                                                handleOpenModal(
                                                    property,
                                                    "edit"
                                                )
                                            }
                                            className="w-5 h-5 text-custom-bluegreen cursor-pointer"
                                        />
                                    </td>
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

            <div className="py-2 flex justify-end mx-1">
                <Pagination
                    pageCount={pagination?.lastPage || 1}
                    currentPage={pagination?.currentPage || 1}
                    onPageChange={handlePageChange}
                />
            </div>

            <div>
                <EditPropertyFeature
                    selectedProperty={selectedProperty}
                    editPropertyFeatureRef={editPropertyFeatureRef}
                />
            </div>

            <div>
                <AddPropertyFeature
                    addPropertyFeatureRef={addPropertyFeatureRef}
                />
            </div>
        </div>
    );
};

export default PropertySetting;
