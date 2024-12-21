import React, { useEffect, useState, useMemo } from 'react'
import { useStateContext } from '../../../../../context/contextprovider';
import { PERMISSIONS } from '../../../../../constant/data/permissions';
import apiService from "../../../../servicesApi/apiService";
import { showToast } from "../../../../../util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";
import { normalizeData } from '../UserModal/utils/normalizeData';
import isEqual from 'lodash/isEqual';


const EditUserModal = ({ editEmployeeModalRef, selectedEmployee }) => {
    //States
    const { features, getEmployeesWithPermissions } = useStateContext();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: 0,  
        features: [],   
    });
    const [selectedEmployeeOldData, setSelectedEmployeeOldData] = useState(null); //Holds the old data of the selected department

    //Hooks
    useEffect(() => {
        if (selectedEmployee) {
            setFormData({
                employee_id: selectedEmployee.id,
                features: selectedEmployee.features,
            });
            setSelectedEmployeeOldData(selectedEmployee);
        }
    }, [selectedEmployee])

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
        const featureExists = updatedFeatures.some((feature) => feature.id === featureId);
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
    const handleSubmit = async () => {
        const payload = {
            employee_id: parseInt(formData.employee_id),
            features: formData.features
        };
        try {
            setIsLoading(true);
            const response = await apiService.put("update-employees-feature-permissions", payload);

            if (response.data?.statusCode === 200) {
                showToast("Data updated successfully!", "success");
                setFormData({
                    employee_id: 0,
                    features: [],
                });
                getEmployeesWithPermissions();
                if (editEmployeeModalRef.current) {
                    editEmployeeModalRef.current.close();
                }
            }
        } catch (error) {
            console.log("error", error);
        } finally {
            setIsLoading(false);
        }
    }


    //Handle close the modal and cancel the modal
    const handleCloseModal = () => {
        //TODO: remove all state if the
        if (selectedEmployee) {
            setFormData({
                employee_id: selectedEmployee.id,
                features: selectedEmployee.features,
            });
        }
        if (editEmployeeModalRef.current) {
            editEmployeeModalRef.current.close();
        }
    }

    //Function to check if the old data is the same as the new data, if so, disable the button
    const isButtonDisabled = useMemo(() => {
        if (!selectedEmployeeOldData || !formData) {
            return true;
        }

        const oldDataNormalized = normalizeData(selectedEmployeeOldData);
        const newDataNormalized = normalizeData(formData);

        // Compare old and new data  
        return isEqual(oldDataNormalized, newDataNormalized);
    }, [selectedEmployeeOldData, formData]);

    return (
        <dialog
            id="EditDepartment"
            className="modal w-[683px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={editEmployeeModalRef}
        >
            <div className='relative p-[20px] mb-5 rounded-lg'>
                <div className=''>
                    <div>
                        <button className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg" onClick={handleCloseModal}>
                            ✕
                        </button>
                    </div>
                </div>
                {/* <div className="flex justify-center items-center mt-[14px] flex-col gap-y-2">
                    <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                    <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                        <p>Validation error here</p>
                    </div>
                </div> */}
                <div className='flex flex-col gap-[36px] mt-[26px]'>
                    <div className='w-full p-[10px] flex flex-col gap-[10px] relative mb-2'>
                        <p className='text-sm font-semibold'>User</p>
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Name
                            </span>
                            <input
                                name="name"
                                type="text"
                                value={selectedEmployee?.firstname + " " + selectedEmployee?.lastname}
                                disabled
                                className=' w-full px-4 text-sm focus:outline-none mobile:text-xs'
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
                                readOnly={true}
                                value={selectedEmployee?.department}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>

                    </div>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Permissions</p>
                        {/*Display the features */}
                        {features &&
                            features.map((item, index) => {
                                const featurePermissions = selectedEmployee && selectedEmployee?.features.find(
                                    (feature) => feature.id === item.id
                                )?.pivot;


                                return (
                                    <div
                                        className="flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen h-[56px]"
                                        key={index}
                                    >
                                        <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[275px] h-full px-[15px]">
                                            {item.name}
                                        </span>
                                        <div className="relative h-full w-full flex justify-center items-center">
                                            <div className="w-[342px] h-[44px]">
                                                <div className="w-full h-[44px] gap-[63px] flex items-center justify-center rounded-[5px]">
                                                    {PERMISSIONS &&
                                                        PERMISSIONS.map((permission, permIndex) => {
                                                            const isDisabled = ["S", "D", "E"].includes(permission.name);
                                                            return (
                                                                <div
                                                                    className="flex flex-col gap-[2.75px] items-center"
                                                                    key={permIndex}
                                                                >
                                                                    {/* Display the name of the permission */}
                                                                    <p className="montserrat-semibold text-[10px] leading-[12.19px]">
                                                                        {permission.name}
                                                                    </p>
                                                                    {/* Checkbox for each permission */}
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData &&
                                                                            formData?.features?.find((feature) => feature.id === item.id)?.pivot[
                                                                            permission.value
                                                                            ] || false
                                                                        }

                                                                        disabled={isDisabled}
                                                                        className={`h-[16px] w-[16px] ${isDisabled
                                                                            ? "cursor-not-allowed bg-custom-grayF1"
                                                                            : ""
                                                                            }`}
                                                                        onChange={(e) =>
                                                                            handleFeaturePermissionChange(
                                                                                item,
                                                                                permission,
                                                                                e.target.checked
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
                            onClick={handleSubmit}
                            disabled={isButtonDisabled || isLoading}
                            className={`gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold ${isButtonDisabled || isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                            {isLoading ? <CircularProgress className="spinnerSize" /> : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default EditUserModal