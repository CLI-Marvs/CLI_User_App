import React, { useEffect, useState } from 'react'
import { AiFillInfoCircle } from 'react-icons/ai'
import { IoMdArrowDropdown } from 'react-icons/io'
import { useStateContext } from '../../../../../context/contextprovider';
import { PERMISSIONS } from '../../../../../constant/data/permissions';
import apiService from "../../../../servicesApi/apiService";
import { showToast } from "../../../../../util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";

const AddDepartmentModal = ({ modalRef }) => {
    //States
    const { employeeDepartments, features, getAllEmployeeDepartment, getAllFeatures } = useStateContext();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        department_id: 0, // selected department
        features: [],   // array of features with permissions
    });

    //TODO:
    //1. Dont show the department in the select tag  if it already exists in the database
    //2. Only ONCE TO insert a record/deparment, if already in database, show the label "IF not visible department, it means already inserted"

    //Hooks
    useEffect(() => {
        getAllEmployeeDepartment();
        getAllFeatures()
    }, [])



    //Event handler

    //Handle the change event of select tag for employee department
    const handleSelectDepartmentChange = (e) => {
        setFormData({ ...formData, department_id: parseInt(e.target.value) });
    }

    //Handle the permission change
    const handleFeaturePermissionChange = (item, permission, value) => {
        const featureId = item.id;

        // Update the formData with the new permissions
        setFormData((prevState) => {
            const updatedFeatures = prevState.features.map((feature) => {
                if (feature.featureId === item.id) {
                    return { ...feature, [permission.value]: value };
                }
                return feature;
            }).filter((feature) => {
                // Keep the feature if it has any of the permissions (R or W), otherwise remove it
                return feature.can_read || feature.can_write;  // Ensure you are checking for permission keys
            });

            // If the feature doesn't exist and the permission value is true, add it
            if (!updatedFeatures.find((feature) => feature.featureId === featureId) && value === true) {
                updatedFeatures.push({ featureId, [permission.value]: value });
            }

            // Return updated state
            return { ...prevState, features: updatedFeatures };
        });
    };


    //Handle the submit/save button click
    const handleSubmit = () => {
        //TODO: disable the button if there is no data in form data


        const payload = {
            department_id: formData.department_id,
            features: formData.features
        };
        console.log("payload", JSON.stringify(payload))
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
                if (modalRef.current) {
                    modalRef.current.close();
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
        if (modalRef.current) {
            setFormData({
                department_id: 0, // selected department
                features: [],
            });
            modalRef.current.close();
        }
    }

    return (
        <dialog
            id="Department"
            className="modal w-[683px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={modalRef}
        >
            <div className='relative p-[20px] mb-5 rounded-lg'>
                <div className=''>
                    <div>
                        <button className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg" onClick={handleCloseModal}>
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex justify-center items-center mt-[14px] flex-col gap-y-2">
                    <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                    <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                        <p>Validation error here</p>
                    </div>
                </div>
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
                                {/* Display the employee department */}
                                <select
                                    onChange={handleSelectDepartmentChange}
                                    name="department"
                                    value={formData.department_id}
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    {employeeDepartments.map((item) => (
                                        <option value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        {/* <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Role
                            </span>
                            <div className="relative w-full">
                                <select
                                  
                                    name="department"
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="CRS">Role I</option>
                                    <option value="Treasury">Role II</option>
                                    <option value="Accounting">Role III</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div> */}
                    </div>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Permissions</p>
                        {/*Display the features */}
                        {features && features.map((item, index) => (
                            <div
                                className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen h-[56px]`}
                                key={index}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[275px] h-full px-[15px]">
                                    {item.name}
                                </span>
                                <div className="relative h-full w-full flex justify-center items-center">
                                    <div className='w-[342px] h-[44px]'>
                                        <div className='w-full h-[44px] gap-[63px] flex items-center justify-center rounded-[5px]'>

                                            {PERMISSIONS && PERMISSIONS.map((permission, index) => {
                                                const isDisabled = ["S", "D", "E"].includes(permission.name); // Check based on `name`

                                                return (
                                                    <div className="flex flex-col gap-[2.75px] items-center" key={index}>
                                                        {/* Display the name of the permission */}
                                                        <p className="montserrat-semibold text-[10px] leading-[12.19px]">
                                                            {permission.name}
                                                        </p>
                                                        {/* Checkbox for each permission */}
                                                        <input
                                                            // value={formData && formData.features.find((feature) => feature.featureId === item.id)?.[permission.value]}
                                                            type="checkbox"
                                                            disabled={isDisabled}
                                                            className={`h-[16px] w-[16px] ${isDisabled ? "cursor-not-allowed bg-custom-grayF1" : ""
                                                                }`}
                                                            onChange={(e) =>
                                                                handleFeaturePermissionChange(item, permission, e.target.checked)
                                                            }
                                                        />
                                                    </div>
                                                );
                                            })}


                                        </div>
                                    </div>
                                </div>
                            </div>
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

export default AddDepartmentModal