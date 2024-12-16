import React, { useEffect, useState } from 'react'
import { AiFillInfoCircle } from 'react-icons/ai'
import { IoMdArrowDropdown } from 'react-icons/io'
import { useStateContext } from '../../../../../context/contextprovider';
import { PERMISSIONS } from '../../../../../constant/data/permissions';
import apiService from "../../../../servicesApi/apiService";
import { showToast } from "../../../../../util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";

const EditDepartmentModal = ({ editDepartmentModalRef, selectedDepartment }) => {
    //States
    const { employeeDepartments, features } = useStateContext();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        department_id: 0, // selected department
        features: [],   // array of features with permissions
    });
   // console.log("formData", JSON.stringify(formData))
    //TODO:
    //1. Dont show the department in the select tag  if it already exists in the database
    //2. Only ONCE TO insert a record/deparment, if already in database, show the label "IF not visible department, it means already inserted"

    //Hooks
    useEffect(() => {
        if (selectedDepartment) {
            setFormData({
                department_id: selectedDepartment.id,
                features: selectedDepartment.features,
            });
        }
    }, [selectedDepartment])



    //Event handler

    //Handle the change event of select tag for employee department
    // const handleSelectDepartmentChange = (e) => {
    //     setFormData({ ...formData, department_id: parseInt(e.target.value) });
    // }

    //Handle the permission change
    const handleFeaturePermissionChange = (item, permission, value) => {
        const featureId = item.id;

        console.log("Feature being updated:", featureId, permission.value, value);
        console.log("Current formData:", formData);

        // Map through the features to update the pivot permissions
        const updatedFeatures = formData.features.map((feature) => {
            if (feature.id === featureId) {
                console.log("Updating feature:", feature);
                return {
                    ...feature,
                    pivot: {
                        ...feature.pivot,
                        [permission.value]: value, // Dynamically set the permission value
                    },
                };
            }
            return feature; // Return feature unchanged if id doesn't match
        });

        // Update the state with the modified features
        setFormData((prevState) => ({
            ...prevState,
            features: updatedFeatures,
        }));

        console.log("Updated formData:", { ...formData, features: updatedFeatures });
    };



    //Handle the submit/save button click
    const handleSubmit = () => {
        //TODO: disable the button if there is no data in form data
        const payload = {
            department_id: formData.department_id,
            features: formData.features
        };
        // console.log("payload", JSON.stringify(payload))
        setIsLoading(true);
        try {
            const response = apiService.post("departments-assign-feature-permissions", payload);
            console.log("reponse", response)

            if (response.statusCode === 200) {
                showToast("Data added successfully!", "Data added successfully!");
                setFormData({
                    department_id: 0, // selected department
                    features: [],
                });
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
        //TODO: remove all state if the
        if (editDepartmentModalRef.current) {
            setFormData({
                department_id: 0, // selected department
                features: [],
            });
            editDepartmentModalRef.current.close();
        }
    }
    const PermissionCheckboxGroup = ({ permissions, features, departmentFeature, onPermissionChange }) => {
        return (
            <div className="w-[342px] h-[44px]">
                <div className="w-full h-[44px] gap-[63px] flex items-center justify-center rounded-[5px]">
                    {permissions &&
                        permissions.map((permission, index) => {
                            const isDisabled = ["S", "D", "E"].includes(permission.name); // Disable based on name
                            const permissionValue =
                                features.find((feature) => feature.id === departmentFeature?.id)?.pivot[permission.value] ?? false;

                            return (
                                <div className="flex flex-col gap-[2.75px] items-center" key={index}>
                                    <p className="montserrat-semibold text-[10px] leading-[12.19px]">
                                        {permission.name}
                                    </p>
                                    <input
                                        type="checkbox"
                                        checked={permissionValue}
                                        disabled={isDisabled}
                                        className={`h-[16px] w-[16px] ${isDisabled ? "cursor-not-allowed bg-custom-grayF1" : ""}`}
                                        onChange={(e) =>
                                            onPermissionChange(departmentFeature || {}, permission, e.target.checked)
                                        }
                                    />
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

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
                {/* <div className="flex justify-center items-center mt-[14px] flex-col gap-y-2">
                    <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                    <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                        <p>Validation error here</p>
                    </div>
                </div> */}
                <div className='flex flex-col gap-[36px] mt-[26px]'>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Department</p>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Department
                            </span>
                            <div className="relative w-full">
                                {/* Display the passed employee department */}
                                <select
                                    // onChange={handleSelectDepartmentChange}
                                    name="department"
                                    disabled
                                    value={formData.department_id}
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    {employeeDepartments.map((item) => (
                                        <option value={item.id} >{item.name}</option>
                                    ))}
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Permissions</p>
                        {/*Display the features */}
                        {features &&
                            features.map((item, index) => {
                                // Check if the feature is associated with the selected department
                                const departmentFeature = selectedDepartment?.features.find(
                                    (f) => f.id === item.id
                                );

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

                                                            // Dynamically determine permission value based on departmentFeature
                                                            const permissionValue = departmentFeature
                                                                ? departmentFeature.pivot[permission.value] ?? false
                                                                : false; // Default to false for non-associated features

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
                                                                        checked={permissionValue}
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
                            onClick={
                                handleSubmit
                            }
                            disabled={
                                isLoading
                            }
                            className={`gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold ${isLoading ? "cursor-not-allowed" : ""
                                }`}
                        >
                            {isLoading ? (
                                <CircularProgress className="spinnerSize" />
                            ) : (
                                <>Save</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default EditDepartmentModal