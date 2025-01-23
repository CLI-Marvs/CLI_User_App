import React, { useEffect, useState } from 'react'
import { IoMdArrowDropdown } from 'react-icons/io'
import { showToast } from "../../../../../util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";
import { isButtonDisabled } from './utils/isButtonDisabled';
import Feature from '../../component/Feature';
import { departmentPermissionService } from '@/component/servicesApi/apiCalls/roleManagement';
import useFeature from '@/context/RoleManagement/FeatureContext';
import useDepartmentPermission from '@/context/RoleManagement/DepartmentPermissionContext';

const AddDepartmentModal = ({ departmentModalRef, employeeDepartments }) => {

    //States
    const { fetchDepartmentPermissions } = useDepartmentPermission();
    const { features } = useFeature();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        department_id: 0,
        features: [],
    });

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
                return feature.can_read || feature.can_write;
            });

            // Add to the features array if the feature doesn't exist and the permission value is true
            if (!updatedFeatures.find((feature) => feature.featureId === featureId) && value === true) {
                updatedFeatures.push({ featureId, [permission.value]: value });
            }
            return { ...prevState, features: updatedFeatures };
        });
    };


    //Handle the submit/save button click
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            department_id: formData.department_id,
            features: formData.features
        };
        (false);
        try {
            setIsLoading(true);
            const response = await departmentPermissionService.storeDepartmentsWithPermissions(payload);

            if (response.data?.statusCode === 200) {
                showToast("Data added successfully!", "success");
                setFormData({
                    department_id: 0,
                    features: [],
                });
                if (departmentModalRef.current) {
                    setTimeout(() => {
                        departmentModalRef.current.close();
                    }, 1000);
                }
            }
            await fetchDepartmentPermissions(true);

            // setDepartmentsWithPermissions((prevPermissions) => [
            //     ...prevPermissions,
            //     newPermission,
            // ]);
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data?.error || "An error occurred.";
                showToast(errorMessage, "error");
            }
        } finally {
            setIsLoading(false);
        }
    }


    //Handle close the modal/cancel and reset all state
    const handleCloseModal = () => {
        if (departmentModalRef.current) {
            setFormData({
                department_id: 0,
                features: [],
            });
            departmentModalRef.current.close();
        }
    }


    return (
        <dialog
            id="Department"
            className="modal w-[683px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={departmentModalRef}
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
                                    <option value="">
                                        (Select)
                                    </option>
                                    {employeeDepartments && employeeDepartments.map((item) => (
                                        <option value={item.id} key={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div className='py-2 w-[343pxpx]'>
                            <label htmlFor="" className='text-red-500 text-sm'>
                                Note: Department not visible is already in the list.
                            </label>
                        </div>

                    </div>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Permissions</p>
                        {/*Display the features */}
                        {features && features.map((item, index) => (
                            <Feature
                                key={item.id}
                                index={index}
                                item={item}
                                formData={formData}
                                handleFeaturePermissionChange={handleFeaturePermissionChange}
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
                            onClick={handleSubmit}
                            disabled={isButtonDisabled(formData) || isLoading}
                            className={`gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold ${isLoading || isButtonDisabled(formData)
                                ? "opacity-50 cursor-not-allowed"
                                : ""
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