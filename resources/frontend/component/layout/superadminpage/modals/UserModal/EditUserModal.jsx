import React, { useEffect, useState, useMemo } from "react";
import { showToast } from "@/util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";
import { normalizeData } from "@/component/layout/superadminpage/modals/UserModal/utils/normalizeData";
import isEqual from "lodash/isEqual";
import Feature from "@/component/layout/superadminpage/component/Feature";
import useFeature from "@/context/RoleManagement/FeatureContext";
import useEmployeePermission from "@/context/RoleManagement/EmployeePermissionContext";
import { employeePermissionService } from "@/component/servicesApi/apiCalls/roleManagement";
import Alert from "@/component/Alert";

const EditUserModal = ({ editEmployeeModalRef, selectedEmployee }) => {
    //States
    const { fetchEmployeeWithPermissions } = useEmployeePermission();
    const { features, fetchFeatures } = useFeature();
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: 0,
        features: [],
    });
    const [selectedEmployeeOldData, setSelectedEmployeeOldData] =
        useState(null); //Holds the old data of the selected department

    //Hooks
    useEffect(() => {
        if (selectedEmployee) {
            setFormData({
                employee_id: selectedEmployee.id,
                features: selectedEmployee.features,
            });
            setSelectedEmployeeOldData(selectedEmployee);
            fetchFeatures();
        }
    }, [selectedEmployee]);

    //Event handler
    //Handle the permission change
    const handleFeaturePermissionChange = (item, permission, value) => {
        const featureId = item.id;
        // Map through the features to update the old permissions
        const updatedFeatures = formData.features.map((feature) => {
            if (feature.id === featureId) {
                return {
                    ...feature,
                    pivot: {
                        ...feature.pivot,
                        [permission.value]: value,
                    },
                };
            }
            return feature; // Return feature unchanged if id doesn't match
        });

        // If the feature doesn't exist in formData, add it with the correct structure
        const featureExists = updatedFeatures.some(
            (feature) => feature.id === featureId
        );
        if (!featureExists) {
            updatedFeatures.push({
                id: featureId,
                name: item.name, // Ensure the feature has a name if it's not already present
                pivot: {
                    feature_id: featureId,
                    [permission.value]: value,
                },
            });
        }

        // Update the state with the modified features
        setFormData((prevState) => ({
            ...prevState,
            features: updatedFeatures,
        }));
    };

    //Handle the submit/save button click
    const updateUserPermission = async () => {
        const payload = {
            employee_id: parseInt(formData.employee_id),
            features: formData.features,
        };
        try {
            setIsLoading(true);
            const response =
                await employeePermissionService.editEmployeesWithPermissions(
                    payload
                );

            if (response.data?.statusCode === 200) {
                showToast("Data updated successfully!", "success");
                setFormData({
                    employee_id: 0,
                    features: [],
                });

                if (editEmployeeModalRef.current) {
                    editEmployeeModalRef.current.close();
                }
            }
            await fetchEmployeeWithPermissions(true, false);
        } catch (error) {
            console.log("Error updating user permission:", error);
        } finally {
            setIsLoading(false);
        }
    };

    //Handle close the modal and cancel the modal
    const handleCloseModal = () => {
        if (selectedEmployee) {
            setFormData({
                employee_id: selectedEmployee.id,
                features: selectedEmployee.features,
            });
        }
        if (editEmployeeModalRef.current) {
            editEmployeeModalRef.current.close();
        }
    };

    //Function to check if the old data is the same as the new data, if YES, disable the button
    const isButtonDisabled = useMemo(() => {
        if (!selectedEmployeeOldData || !formData) {
            return true;
        }

        const oldDataNormalized = normalizeData(selectedEmployeeOldData);
        const newDataNormalized = normalizeData(formData);

        // Compare old and new data
        return isEqual(oldDataNormalized, newDataNormalized);
    }, [selectedEmployeeOldData, formData]);

    //Handle cancel the alert modal
    const handleCancel = () => {
        setShowAlert(false);
    };

    //Handle confirm the alert modal
    const handleConfirm = () => {
        updateUserPermission();
        setShowAlert(false);
        setTimeout(() => {
            editEmployeeModalRef.current.close();
        }, 1000);
    };

    //Handle show the alert modal
    const handleShowUpdateAlert = () => {
        setShowAlert(true);
        editEmployeeModalRef.current.showModal();
    };

    return (
        <dialog
            id="EditDepartment"
            className="modal w-[683px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={editEmployeeModalRef}
        >
            <div className="relative p-[20px] mb-5 rounded-lg">
                <div className="">
                    <div>
                        <button
                            className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-[36px] mt-[26px]">
                    <div className="w-full p-[10px] flex flex-col gap-[10px] relative mb-2">
                        <p className="text-sm font-semibold">User</p>
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Name
                            </span>
                            <input
                                name="name"
                                type="text"
                                value={
                                    selectedEmployee?.firstname +
                                        " " +
                                        selectedEmployee?.lastname || ""
                                }
                                disabled
                                className=" w-full px-4 text-sm focus:outline-none mobile:text-xs"
                            />
                        </div>
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Department
                            </span>
                            <input
                                name="department"
                                type="text"
                                disabled
                                value={selectedEmployee?.department || ""}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                            />
                        </div>
                    </div>
                    <div className="w-full p-[10px] flex flex-col gap-[10px]">
                        <p className="text-sm font-semibold">Permissions</p>
                        {/*Display the features */}
                        {features &&
                            features.map((item, index) => (
                                <Feature
                                    key={item.id}
                                    index={index}
                                    item={item}
                                    formData={formData}
                                    handleFeaturePermissionChange={
                                        handleFeaturePermissionChange
                                    }
                                    checkedExtractor={(
                                        item,
                                        permission,
                                        formData
                                    ) =>
                                        formData?.features?.find(
                                            (feature) => feature.id === item.id
                                        )?.pivot?.[permission.value] || false
                                    }
                                />
                            ))}
                    </div>
                </div>
                <div className="">
                    <div className="flex justify-center mt-[26px] space-x-[19px]">
                        <button
                            className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]"
                            onClick={handleCloseModal}
                        >
                            <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                                <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                    Cancel
                                </p>
                            </div>
                        </button>
                        <button
                            type="submit"
                            onClick={handleShowUpdateAlert}
                            disabled={isButtonDisabled || isLoading}
                            className={`gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold ${
                                isButtonDisabled || isLoading
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                            }`}
                        >
                            {isLoading ? (
                                <CircularProgress className="spinnerSize" />
                            ) : (
                                "Save"
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <div className="">
                    <Alert
                        title="Are you sure you want to update this data?"
                        show={showAlert}
                        onCancel={handleCancel}
                        onConfirm={handleConfirm}
                        //You can pass onConfirm and onCancel props to customize the text of the buttons. Example below;
                        // confirmText="Update"
                        // cancelText="Cancel"
                    />
                </div>
            </div>
        </dialog>
    );
};

export default EditUserModal;
