import React, { useEffect, useState, useRef } from "react";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import usePropertyFeature from "@/context/RoleManagement/PropertyFeatureContext";
import PropertyFeatureTableRow from "@/component/layout/superadminpage/component/tableRow/PropertyFeatureTableRow";
import useFeature from "@/context/RoleManagement/FeatureContext";
import EditPropertyFeature from "@/component/layout/superadminpage/modals/PropertySettingModal/EditPropertyFeature";
import AddPropertyFeature from "@/component/layout/superadminpage/modals/PropertySettingModal/AddPropertyFeature";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import Skeleton from "@/component/Skeletons";

const PropertySetting = () => {
    const editPropertyFeatureRef = useRef(null);
    const addPropertyFeatureRef = useRef(null);
    const {
        propertyFeatures,
        isLoading,
        pagination,
        updatePagination,
        setIsPropertyFeatureActive,
    } = usePropertyFeature();

    const { propertySettingsFeatures, fetchPropertySettingsFeatures, isFeatureFetching } =
        useFeature();
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [isFirstFeatureLoad, setIsFirstFeatureLoad] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState([]);

    //Hooks
    useEffect(() => {
        setIsPropertyFeatureActive(true);
        return () => {
            setIsPropertyFeatureActive(false);
        };
    }, []);

    useEffect(() => {
        const initializeComponent = async () => {
            setIsPropertyFeatureActive(true);
            await fetchPropertySettingsFeatures();
            if (propertyFeatures?.length > 0 && isFirstLoad) {
                setIsFirstLoad(false);
            }
        };

        initializeComponent();

        // Cleanup function
        return () => {
            setIsPropertyFeatureActive(false);
        };
    }, [propertyFeatures]);

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
            {/* Table */}
            <div className="mt-3 mx-1 py-4">
                {(isFeatureFetching && isFirstFeatureLoad) ? (
                    <div className="text-center py-4">
                        <Skeleton height={140} className="my-1" />
                        <Skeleton height={140} className="my-1" />
                        <Skeleton height={140} className="my-1" />
                    </div>
                ) : propertySettingsFeatures?.length > 0 && propertyFeatures?.length > 0 ? (
                    <CustomTable
                        tableClassName="w-full min-w-[882px]"
                        className="gap-4 w-full h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen mb-4 -mx-1 px-4"
                        columns={propertySettingColumns}
                        data={propertyFeatures}
                        isLoading={isLoading && isFirstLoad}
                        renderRow={(item) => (
                            <PropertyFeatureTableRow
                                key={item.property_feature_id}
                                item={item}
                                handleOpenModal={handleOpenModal}
                                propertySettingColumns={propertySettingColumns}
                            />
                        )}
                    />
                ) : (
                    <div className="text-center py-4">
                        <Skeleton height={140} className="my-1" />
                        <Skeleton height={140} className="my-1" />
                        <Skeleton height={140} className="my-1" />
                    </div>
                )}
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
