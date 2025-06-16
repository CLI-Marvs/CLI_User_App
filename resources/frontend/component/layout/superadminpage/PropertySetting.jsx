import React, { useEffect, useState, useRef } from "react";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import usePropertyFeature from "@/context/RoleManagement/PropertyFeatureContext";
import PropertyFeatureTableRow from "@/component/layout/superadminpage/component/tableRow/PropertyFeatureTableRow";
import useFeature from "@/context/RoleManagement/FeatureContext";
import EditPropertyFeature from "@/component/layout/superadminpage/modals/PropertySettingModal/EditPropertyFeature";
import AddPropertyFeature from "@/component/layout/superadminpage/modals/PropertySettingModal/AddPropertyFeature";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import Skeleton from "@/component/Skeletons";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";

const PropertySetting = () => {
    const editPropertyFeatureRef = useRef(null);
    const addPropertyFeatureRef = useRef(null);
    const {
        propertyFeatures,
        isLoading,
        pagination,
        updatePagination,
        setIsPropertyFeatureActive,
        setFilters,
        updateFilters,
        error,
    } = usePropertyFeature();
    const [searchValues, setSearchValues] = useState({});
    const {
        propertySettingsFeatures,
        fetchPropertySettingsFeatures,
        isFeatureFetching,
    } = useFeature();
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [isFirstFeatureLoad, setIsFirstFeatureLoad] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState([]);
    const fields = [
        { name: "property_name", label: "Property Name" },
        { name: "business_entity_sap", label: "Business Entity(SAP)" },
        {
            name: "project_category",
            label: "Project Category",
            type: "select",
            defaultValue: "",
            options: [
                { label: "Select Project  Category", value: "" },
                { label: "CLI", value: "CLI" },
                { label: "JV", value: "JV" },
            ],
        },
    ];

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
        { label: "Business Entity", width: "w-[120px]" },
        { label: "Project Category", width: "w-[50px]" },
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

    //Handle input search
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handles search submit: updates filters with current search values
    const handleSearchSubmit = () => {
        // Only submit if at least one search value is not empty
        const hasValue = Object.values(searchValues).some(
            (v) => v && v.toString().trim() !== ""
        );
        if (!hasValue) return;

        setFilters(searchValues);
        updateFilters(searchValues);
    };

    // Handles filter reset: clears search values and resets filters
    const handleResetFilters = () => {
        setSearchValues({});
        setFilters({});
        updateFilters({});
    };

    return (
        <div className="h-screen max-w-full bg-custom-grayFA p-[20px]">
            <div className="py-2 px-0">
                {" "}
                <TransactionSearchBar
                    fields={fields}
                    searchValues={searchValues}
                    setSearchValues={setSearchValues}
                    onChangeSearch={handleInputChange}
                    onSubmit={handleSearchSubmit}
                    setFilters={handleResetFilters}
                />
            </div>
            <div className="px-2">
                <button
                    onClick={() => {
                        handleOpenModal("", "add");
                    }}
                    className="montserrat-semibold text-sm px-6 gradient-btn h-[37px] rounded-[10px] text-white hover:shadow-custom4"
                >
                    <span className="text-[18px] mt-1 mr-2">+</span>
                    Add Property
                </button>
            </div>

            {/* Table */}
            <div className="mt-3 mx-1 py-4">
                {isFeatureFetching && isFirstFeatureLoad ? (
                    <div className="text-center py-4">
                        <Skeleton height={140} className="my-1" />
                        <Skeleton height={140} className="my-1" />
                        <Skeleton height={140} className="my-1" />
                    </div>
                ) : error === "No properties found." ? (
                    <div className="text-center py-4 text-custom-bluegreen">
                        No data available
                    </div>
                ) : propertySettingsFeatures?.length > 0 &&
                    propertyFeatures?.length > 0 ? (
                    <CustomTable
                        tableClassName="w-full min-w-[882px] px-2"
                        className="gap-4 w-full h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen mb-4 -mx-1 px-4"
                        columns={propertySettingColumns}
                        data={propertyFeatures}
                        isLoading={isLoading && isFirstLoad}
                        renderRow={(item) => (
                            <PropertyFeatureTableRow
                                key={item.id}
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
                {!error && (
                    <Pagination
                        pageCount={pagination?.lastPage || 1}
                        currentPage={pagination?.currentPage || 1}
                        onPageChange={handlePageChange}
                    />
                )}
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
