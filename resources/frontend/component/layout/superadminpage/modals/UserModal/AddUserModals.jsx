import React, { useRef, useState, useEffect } from "react";
import { AiFillInfoCircle } from "react-icons/ai";
import { useStateContext } from "@/context/contextprovider";
import highlightText from "@/util/hightlightText";
import { isButtonDisabled } from "@/component/layout/superadminpage/modals/UserModal/utils/isButtonDisabled";
import CircularProgress from "@mui/material/CircularProgress";
import { showToast } from "@/util/toastUtil";
import { getFilteredEmployeeOptions } from "@/component/layout/superadminpage/modals/UserModal/utils/employeeUtils";
import Feature from "@/component/layout/superadminpage/component/Feature";
import useFeature from "@/context/RoleManagement/FeatureContext";
import { employeePermissionService } from "@/component/servicesApi/apiCalls/roleManagement";
import useEmployeePermission from "@/context/RoleManagement/EmployeePermissionContext";

const AddUserModals = ({ userModalRef, employeesWithPermissions }) => {
    //States
    const { allEmployees } = useStateContext();
    const { fetchEmployeeWithPermissions } = useEmployeePermission();
    const { features} = useFeature();
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: 0,
        features: [],
    });

    const dropdownRef = useRef(null);
    const filteredOptions = getFilteredEmployeeOptions(
        allEmployees,
        employeesWithPermissions,
        search
    ); // Use the utility function

    
    // useEffect(() => {
    //     let permissionUpdateChannel;

    //     // Function to ensure window.Echo is loaded before subscribing
    //     const initChannels = () => {
    //         if (employeeId && window.Echo) {
    //             // Channel for permission updates
    //             permissionUpdateChannel = window.Echo.channel(
    //                 `permission-update.${employeeId}`
    //             );
    //             permissionUpdateChannel.listen(".PermissionUpdate", (data) => {
    //                 console.log("Permission updated:", data);
    //                 // Handle real-time permission updates here
    //                 getUserAccessData(); // Refresh user access data after updates
    //             });

    //         }
    //     };

    //     // Wait until the browser (Echo) is ready
    //     const checkBrowserReady = setInterval(() => {
    //         if (window.Echo) {
    //             initChannels();
    //             clearInterval(checkBrowserReady); // Stop checking once Echo is ready
    //         }
    //     }, 100); // Check every 100ms if Echo is initialized

    //     return () => {
    //         // Clear interval if component unmounts
    //         clearInterval(checkBrowserReady);
    //         // Cleanup permission update channel
    //         if (permissionUpdateChannel) {
    //             permissionUpdateChannel.stopListening(".PermissionUpdate");
    //             window.Echo.leaveChannel(`permission-update.${employeeId}`);
    //         }
    //     };
    // }, [employeeId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    //Event Handler
    //Handle select employee
    const handleSelectEmployee = (employee) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            employee_id: employee?.id || 0,
        }));
        setSelectedEmployee(employee);
        setSearch(employee.name);
        setIsDropdownOpen(false);
    };

    //Handle the permission change
    const handleFeaturePermissionChange = (item, permission, value) => {
        const featureId = item.id;
        // Update the formData with the new permissions
        setFormData((prevState) => {
            const updatedFeatures = prevState.features
                .map((feature) => {
                    if (feature.featureId === item.id) {
                        return { ...feature, [permission.value]: value };
                    }
                    return feature;
                })
                .filter((feature) => {
                    // Keep the feature if it has any of the permissions (R or W), otherwise remove it
                    return feature.can_read || feature.can_write; // Ensure you are checking for permission keys
                });
            // If the feature doesn't exist and the permission value is true, add it
            if (
                !updatedFeatures.find(
                    (feature) => feature.featureId === featureId
                ) &&
                value === true
            ) {
                updatedFeatures.push({ featureId, [permission.value]: value });
            }
            // Return updated state
            return { ...prevState, features: updatedFeatures };
        });
    };

    //Handle the submit/save button click
    const handleSubmit = async () => {
        const payload = {
            employee_id: formData?.employee_id,
            features: formData.features,
        };

        try {
            setIsLoading(true);
            const response =
                await employeePermissionService.storeEmployeesWithPermissions(
                    payload
                );
            if (response.data?.statusCode === 200) {
                showToast("Data added successfully!", "success");
                setFormData({
                    employee_id: 0,
                    features: [],
                });
                setSearch("");
                setSelectedEmployee(null);

                if (userModalRef.current) {
                    userModalRef.current.close();
                }
            }
            await fetchEmployeeWithPermissions(true, false);
        } catch (error) {
            console.log("Error saving add user modal:", error);
        } finally {
            setIsLoading(false);
        }
    };

    //Handle close the modal and reset all state
    const handleCloseModal = () => {
        if (userModalRef.current) {
            setSelectedEmployee(null);
            setFormData({
                employee_id: 0,
                features: [],
            });
            setSearch("");
            setIsDropdownOpen(false);
            userModalRef.current.close();
        }
    };

    return (
        <dialog
            id="Department"
            className="modal w-[683px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={userModalRef}
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
                <div className="flex justify-center items-center mt-[14px] ">
                    <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                </div>
                <div className="flex flex-col gap-[36px] mt-[24px]">
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
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={` 
                                    ${
                                        isDropdownOpen
                                            ? "rounded-[10px] rounded-b-none"
                                            : "rounded-[10px]"
                                    }
                                     w-full px-4 text-sm focus:outline-none mobile:text-xs`}
                                onFocus={() => setIsDropdownOpen(true)}
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
                                placeholder=""
                            />
                        </div>
                        <div className="absolute mt-[100px]">
                            {/* Absolute button inside the input, aligned to the right */}
                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="absolute w-[610px] space-y-2 border-t-0 border-gray-300 p-2 py-[20px] shadow-custom6 rounded-[10px] bg-white z-20 mt-1"
                                        ref={dropdownRef}
                                    >
                                        <ul className="flex flex-col space-y-2 max-h-[500px] overflow-auto ">
                                            {filteredOptions &&
                                                filteredOptions.map(
                                                    (option, index) => {
                                                        return (
                                                            <li
                                                                key={index}
                                                                className="flex h-[110px] w-full py-[20px] px-[30px] gap-[18px] bg-custom-lightestgreen rounded-[10px] cursor-pointer"
                                                                onClick={() =>
                                                                    handleSelectEmployee(
                                                                        option
                                                                    )
                                                                }
                                                            >
                                                                <div>
                                                                    <span>
                                                                        {highlightText(
                                                                            option.name,
                                                                            search
                                                                        )}
                                                                    </span>
                                                                    <br />
                                                                    <span className="text-sm">
                                                                        {highlightText(
                                                                            option.email,
                                                                            search
                                                                        )}
                                                                    </span>
                                                                    <br />
                                                                    <span className="text-sm">
                                                                        {highlightText(
                                                                            option.department,
                                                                            search
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        );
                                                    }
                                                )}
                                            {filteredOptions.length == 0 && (
                                                <div>
                                                    <p>No results found</p>
                                                </div>
                                            )}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="w-full p-[10px] flex flex-col gap-[10px]">
                        <p className="text-sm font-semibold">Permissions</p>
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
                                />
                            ))}
                    </div>
                </div>
                <div>
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
                            className={`gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold ${
                                isLoading || isButtonDisabled(formData)
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
    );
};
export default AddUserModals;
