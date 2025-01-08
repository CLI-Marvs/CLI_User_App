import React, { useEffect, useState, useMemo } from 'react'
import { useStateContext } from '../../../../../context/contextprovider';
import { PERMISSIONS } from '../../../../../constant/data/permissions';
import apiService from "../../../../servicesApi/apiService";
import { showToast } from "../../../../../util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";
import isEqual from 'lodash/isEqual';
import { normalizeData } from '../DepartmentModal/utils/normalizeData';

const EditDepartmentModal = ({ editDepartmentModalRef, selectedDepartment }) => {
    //States
    const { features, getDepartmentsWithPermissions } = useStateContext();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDepartmentOldData, setSelectedDepartmentOldData] = useState(null); //Holds the old data of the selected department
    const [formData, setFormData] = useState({
        department_id: 0,
        features: [],
    });

    //Hooks
    useEffect(() => {
        if (selectedDepartment) {
            setFormData({
                department_id: selectedDepartment.id,
                features: selectedDepartment.features,
            });
        }
        setSelectedDepartmentOldData(selectedDepartment);
    }, [selectedDepartment])


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
            department_id: parseInt(formData.department_id),
            features: formData.features
        };
        try {
            setIsLoading(true);
            const response = await apiService.put("update-departments-feature-permissions", payload);

            if (response.data?.statusCode === 200) {
                showToast("Data updated successfully!", "success");
                setFormData({
                    department_id: 0,
                    features: [],
                });
                getDepartmentsWithPermissions();
                if (editDepartmentModalRef.current) {
                    editDepartmentModalRef.current.close();
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
        if (selectedDepartment) {
            setFormData({
                department_id: selectedDepartment.id,
                features: selectedDepartment.features,
            });
        }
        if (editDepartmentModalRef.current) {
            editDepartmentModalRef.current.close();
        }
    }

    //Function to check if the old data is the same as the new data, if so, disable the button
    const isButtonDisabled = useMemo(() => {
        if (!selectedDepartmentOldData || !formData) {
            return true;
        }
        const oldDataNormalized = normalizeData(selectedDepartmentOldData);
        const newDataNormalized = normalizeData(formData);
        // Compare old and new data  
        return isEqual(oldDataNormalized, newDataNormalized);
    }, [selectedDepartmentOldData, formData]);

    //Render function
    //Display the features
    const renderFeatures = (item, index) => {
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
                                PERMISSIONS.map((permission) =>
                                    renderPermissionCheckbox(
                                        item,
                                        permission,
                                        handleFeaturePermissionChange
                                    )
                                )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    //Display the permission checkbox
    const renderPermissionCheckbox = (item, permission, handleFeaturePermissionChange) => {
        const isDisabled = ["S", "D", "E"].includes(permission.name);
        return (
            <div
                className="flex flex-col gap-[2.75px] items-center"
                key={permission.name}
            >
                <p className="montserrat-semibold text-[10px] leading-[12.19px]">
                    {permission.name}
                </p>
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
    }
    return (
        <dialog
            id="EditDepartment"
            className="modal w-[683px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={editDepartmentModalRef}
        >
            <div className='relative p-[20px] mb-5 rounded-lg'>
                <div className=''>
                    <div>
                        <button className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg" onClick={handleCloseModal}>
                            ✕
                        </button>
                    </div>
                </div>
                <div className='flex flex-col gap-[36px] mt-[26px]'>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Department</p>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[280px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Department
                            </span>
                            <div className="relative w-full">
                                <input type="input"
                                    name="department"
                                    disabled
                                    value={selectedDepartment?.name || ''}
                                    className="appearance-none text-sm w-full px-4 py-1 focus:outline-none border-0 mobile:text-xs" />

                            </div>
                        </div>
                    </div>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Permissions</p>
                        {/*Display the features */}
                        {features &&
                            features.map((item, index) => (
                                renderFeatures(item, index)
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

export default EditDepartmentModal