import React, { useRef, useState, useEffect } from 'react'
import { AiFillInfoCircle } from 'react-icons/ai'
import { IoMdArrowDropdown } from 'react-icons/io'
import { useStateContext } from '../../../../../context/contextprovider';
import { PERMISSIONS } from '../../../../../constant/data/permissions';
import highlightText from '../../../../../util/hightlightText.jsx';
const AddUserModals = ({ modalRef }) => {
    //States
    const { features, getAllFeatures, allEmployees } = useStateContext();
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: 0, // selected department
        features: [],   // array of features with permissions
    });

    const employeeOptions = allEmployees.map((employee) => ({
        id: employee?.id,
        name: `${employee.firstname} ${employee.lastname}`,
        email: employee.employee_email,
        firstname: employee.firstname,
        department:
            employee.department === "Customer Relations - Services"
                ? "Customer Relations - Services"
                : employee.department,
        abbreviationDep: employee.department,
    }));

    const filteredOptions = employeeOptions.filter(
        (option) =>
            (option.name &&
                option.name.toLowerCase().includes(search.toLowerCase())) ||
            (option.email &&
                option.email.toLowerCase().includes(search.toLowerCase())) ||
            (option.department &&
                option.department.toLowerCase().includes(search.toLowerCase()))
    );

    //Hooks
    //Get all feature
    useEffect(() => {
        getAllFeatures();
    }, []);

    // useEffect(() => {
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, []);

    //Event Handler

    //Handle select employee
    const handleSelectEmployee = (option) => {
        setSelectedEmployee({
            employee_id: option.id,
            name: option.name,
            department: option.department,
        })
        setSearch(option.name); // Fill the input with the selected employee's name
        setIsDropdownOpen(false);
    };

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
            employeeId: formData?.employee_id,
            features: formData.features
        };
        console.log("payload", JSON.stringify(payload))
        setIsLoading(true);
        try {
            // const response = apiService.post("employee-assign-feature-permissions", payload);
            // console.log("reponse", response)

            // if (response.statusCode === 200) {
            //     showToast("Data added successfully!", "Data added successfully!");
            //     setFormData({
            //         employee_id: 0, // selected department
            //         features: [],
            //     });
            //     if (modalRef.current) {
            //         modalRef.current.close();
            //     }
            // }

        } catch (error) {
            console.log("error", error);
        } finally {
            setIsLoading(false);
        }

    }

    //Handle close the modal
    const handleCloseModal = () => {
        //TODO: remove all state if the modal is open
        if (modalRef.current) {
            setFormData({
                employee_id: 0, // selected department
                features: [],
            });
            setSelectedEmployee([]);
            modalRef.current.close();
        }
    };


   

    //Handle click outside the dropdown
    // const handleClickOutside = (event) => {
    //     setIsDropdownOpen(false);
    // };
    /*  const highlightText = (text) => {
         if (!text) return text;
         if (!search) return text;
 
         const parts = text.split(new RegExp(`(${search})`, "gi"));
 
         return (
             <span>
                 {parts.map((part, index) =>
                     part.toLowerCase() === search.toLowerCase() ? (
                         <span key={index} className="font-semibold">
                             {part}
                         </span>
                     ) : (
                         part
                     )
                 )}
             </span>
         );
     }; */



    return (
        <dialog
            id="Department"
            className="modal w-[683px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={modalRef}
        >
            <div className='relative p-[20px] mb-5 rounded-lg'>
                <div className=''>
                    <div>
                        <button className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                            onClick={handleCloseModal}>
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex justify-center items-center mt-[14px] ">
                    <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                </div>

                <div className='flex flex-col gap-[36px] mt-[24px]'>
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
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={` 
                                    ${isDropdownOpen
                                        ? "rounded-[10px] rounded-b-none"
                                        : "rounded-[10px]"
                                    }
                                     w-full px-4 text-sm focus:outline-none mobile:text-xs`
                                }
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
                                readOnly={true}
                                value={selectedEmployee?.department}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div className='absolute mt-[100px]'>
                            {/* Absolute button inside the input, aligned to the right */}
                            {isDropdownOpen && (
                                <>
                                    <div className="absolute w-[610px] space-y-2 border-t-0 border-gray-300 p-2 py-[20px] shadow-custom6 rounded-[10px] bg-white z-20 mt-1">

                                        <ul className="flex flex-col space-y-2 max-h-[500px] overflow-auto ">
                                            {filteredOptions.map((option, index) => {
                                                return (
                                                    <li
                                                        key={index}
                                                        className="flex h-[110px] w-full py-[20px] px-[30px] gap-[18px] bg-custom-lightestgreen rounded-[10px] cursor-pointer"
                                                        onClick={() => handleSelectEmployee(option)}
                                                    >
                                                        <div>
                                                            <span>
                                                                {highlightText(
                                                                    option.name, search
                                                                )}
                                                            </span>
                                                            <br />
                                                            <span className="text-sm">
                                                                {highlightText(
                                                                    option.email, search
                                                                )}
                                                            </span>
                                                            <br />
                                                            <span className="text-sm">
                                                                {highlightText(
                                                                    option.department, search
                                                                )}
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
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
                        {/* Conditionally render the list when dropdown is open */}

                    </div>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Permissions</p>
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
                <form method="dialog" className="">
                    <div className="flex justify-center mt-[26px] space-x-[19px]">
                        <button
                            className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]"
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
                </form>
            </div>
        </dialog>
    )
}

export default AddUserModals