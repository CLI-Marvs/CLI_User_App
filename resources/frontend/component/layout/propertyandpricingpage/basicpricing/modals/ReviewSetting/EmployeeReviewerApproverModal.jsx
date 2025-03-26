import React, {
    useState,
    useRef,
    useCallback,
    useMemo,
    useEffect,
} from "react";
import { useStateContext } from "@/context/contextprovider";
import { debounce } from "lodash";
import highlightText from "@/util/hightlightText";
import { usePricing } from "@/component/layout/propertyandpricingpage/context/BasicPricingContext";
import usePriceListEmployees from "@/component/layout/propertyandpricingpage/hooks/usePriceListEmployees";
import CustomInput from "@/component/Input/CustomInput";
import _ from "lodash";

//Utility function
const isButtonDisabled = (
    type,
    oldData,
    reviewedByEmployees,
    approvedByEmployees
) => {
    const dataMap = {
        reviewedByEmployees,
        approvedByEmployees,
    };

    const oldDataKey =
        type === "reviewedByEmployees"
            ? "reviewedByEmployees"
            : "approvedByEmployees";
    const newData = dataMap[oldDataKey];

    if (!Array.isArray(newData) || !newData.length) return true;

    if (
        oldData?.[oldDataKey] &&
        Array.isArray(oldData[oldDataKey]) &&
        oldData[oldDataKey].length === newData.length &&
        _.isEqual(oldData[oldDataKey], newData)
    ) {
        return true; // Disable if data is unchanged
    }

    return false;
};

const EmployeeReviewerApproverModal = ({
    reviewerApproverModalRef,
    type,
    onClose,
}) => {
    //States
    const { allEmployees } = useStateContext();
    const [searchEmployee, setSearchEmployee] = useState("");
    const dropdownRef = useRef(null);
    const { setPricingData, pricingData } = usePricing();
    const {
        handleRemoveEmployee,
        reviewedByEmployees,
        approvedByEmployees,
        setApprovedByEmployees,
        setReviewedByEmployees,
    } = usePriceListEmployees();
    const [oldData, setOldData] = useState({
        reviewedByEmployees: reviewedByEmployees || [],
        approvedByEmployees: approvedByEmployees || [],
    });
    const isDisabled = isButtonDisabled(
        type,
        oldData,
        reviewedByEmployees,
        approvedByEmployees
    );

    //Hooks
    useEffect(() => {
        setOldData({
            reviewedByEmployees: pricingData.reviewedByEmployees || [],
            approvedByEmployees: pricingData.approvedByEmployees || [],
        });

        if (type === "reviewedByEmployees") {
            setReviewedByEmployees(pricingData.reviewedByEmployees || []);
        } else {
            setApprovedByEmployees(pricingData.approvedByEmployees || []);
        }
        if (!type) {
            setSearchEmployee("");
        }
    }, [type, pricingData]);

    //Debounced function to optimize searchEmployee input performance
    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchEmployee(value);
        }, 300),
        []
    );

    /**
     * Memoized list of filtered employees based on search criteria and existing reviewer/approver lists.
     * Filters the 'allEmployees' array to exclude employees already selected as reviewers or approvers,
     * depending on the 'type' parameter. It also applies a search filter based on employee first name,
     * last name, and department.
     *
     * @returns {Array<Object>} An array of filtered employee objects.
     * @dependencies {string} searchEmployee - The search term for filtering employees.
     * @dependencies {Array<Object>} allEmployees - The complete list of employee objects.
     * @dependencies {Array<Object>} pricingData.reviewedByEmployees - List of employees already selected as reviewers.
     * @dependencies {Array<Object>} pricingData.approvedByEmployees - List of employees already selected as approvers.
     * @dependencies {string} type - The type of employee list to filter ('reviewedByEmployees' or 'approvedByEmployees').
     */
    const filteredEmployees = useMemo(() => {
        if (!allEmployees) return [];

        return allEmployees.filter((employee) => {
            const isAlreadyReviewer = pricingData.reviewedByEmployees.some(
                (reviewer) => reviewer.id === employee.id
            );
            const isAlreadyApprover = pricingData.approvedByEmployees.some(
                (approver) => approver.id === employee.id
            );

            if (type === "approvedByEmployees") {
                // Exclude employees who are in reviewedByEmployees but KEEP those in approvedByEmployees
                if (isAlreadyReviewer) return false;
            } else if (type === "reviewedByEmployees") {
                //  Exclude employees who are in approvedByEmployees but KEEP those in reviewedByEmployees
                if (isAlreadyApprover) return false;
            }

            // Apply search filtering logic
            const firstName = employee?.firstname?.toLowerCase() || "";
            const lastName = employee?.lastname?.toLowerCase() || "";
            const employeeDepartment = employee?.department
                ? employee.department.toLowerCase()
                : "";
            const searchTerm = searchEmployee.toLowerCase();

            return (
                firstName.includes(searchTerm) ||
                lastName.includes(searchTerm) ||
                employeeDepartment.includes(searchTerm)
            );
        });
    }, [
        searchEmployee,
        allEmployees,
        pricingData.reviewedByEmployees,
        pricingData.approvedByEmployees,
        type,
    ]);

    //Event handler
    //Handle the change event of the searchEmployee input
    const handleSearchOnChange = (value) => {
        setSearchEmployee(value);
        debouncedSearch(value);
    };

    /**
     * Handles the selection or deselection of an employee based on a checkbox event.
     * Updates either the 'reviewedByEmployees' or 'approvedByEmployees' state array,
     * adding or removing the selected employee based on the checkbox's checked status.
     *
     * @param {Event} e - The checkbox change event.
     * @param {Object} employee - The employee object containing id, firstname, and lastname.
     * @param {string} employee.id - The unique identifier of the employee.
     * @param {string} employee.firstname - The first name of the employee.
     * @param {string} employee.lastname - The last name of the employee.
     * @param {string} type - The type of employee list to update ('reviewedByEmployees' or 'approvedByEmployees').
     * @param {Function} setReviewedByEmployees - State setter for the reviewedByEmployees array.
     * @param {Function} setApprovedByEmployees - State setter for the approvedByEmployees array.
     */
    const handleSelectedEmployee = (e, employee) => {
        const employeeId = employee.id;
        const isChecked = e.target.checked;

        if (type === "reviewedByEmployees") {
            setReviewedByEmployees((prevEmployees) => {
                if (!Array.isArray(prevEmployees)) prevEmployees = [];

                if (isChecked) {
                    // Add only if not already present
                    if (!prevEmployees.some((emp) => emp.id === employeeId)) {
                        return [
                            ...prevEmployees,
                            {
                                id: employeeId,
                                name:
                                    employee.firstname +
                                    " " +
                                    employee.lastname,
                            },
                        ];
                    }
                } else {
                    // Remove the employee if unchecked
                    return prevEmployees.filter((emp) => emp.id !== employeeId);
                }

                return prevEmployees;
            });
        } else {
            setApprovedByEmployees((prevEmployees) => {
                if (!Array.isArray(prevEmployees)) prevEmployees = [];

                if (isChecked) {
                    // Add only if not already present
                    if (!prevEmployees.some((emp) => emp.id === employeeId)) {
                        return [
                            ...prevEmployees,
                            {
                                id: employeeId,
                                name:
                                    employee.firstname +
                                    " " +
                                    employee.lastname,
                            },
                        ];
                    }
                } else {
                    // Remove the employee if unchecked
                    return prevEmployees.filter((emp) => emp.id !== employeeId);
                }

                return prevEmployees;
            });
        }
    };

    //Handle apply button
    const handleApply = () => {
        setPricingData((prev) => {
            const updatedData = {
                ...prev,
                ...(type === "reviewedByEmployees"
                    ? { reviewedByEmployees: [...reviewedByEmployees] }
                    : { approvedByEmployees: [...approvedByEmployees] }),
            };
            return updatedData;
        });
        setSearchEmployee("");
        // Delay closing the modal slightly to ensure state updates first
        setTimeout(() => onClose(), 0);
    };

    // //Utility function to handle button disable state
    // const isButtonDisabled = (reviewedByEmployees, approvedByEmployees) => {
    //     if (type === "reviewedByEmployees") {
    //         if (
    //             oldData &&
    //             Array.isArray(oldData.reviewedByEmployees) &&
    //             Array.isArray(reviewedByEmployees) &&
    //             oldData.reviewedByEmployees.length ===
    //                 reviewedByEmployees.length &&
    //             _.isEqual(oldData.reviewedByEmployees, reviewedByEmployees)
    //         ) {
    //             return true;
    //         }
    //         return !reviewedByEmployees?.length; // Disable if empty
    //     } else {
    //         if (
    //             oldData &&
    //             Array.isArray(oldData.approvedByEmployees) &&
    //             Array.isArray(approvedByEmployees) &&
    //             oldData.approvedByEmployees.length ===
    //                 approvedByEmployees.length &&
    //             _.isEqual(oldData.approvedByEmployees, approvedByEmployees)
    //         ) {
    //             return true;
    //         }
    //         return !approvedByEmployees?.length; // Disable if empty
    //     }
    // };

    return (
        <dialog
            className="modal w-[623px] rounded-lg h-[700px] backdrop:bg-black/50 backdrop-blur-md"
            ref={reviewerApproverModalRef}
        >
            <div className=" px-14 rounded-[10px] h-full">
                <div
                    method="dialog"
                    className="pt-2 flex justify-end -mr-[50px] "
                >
                    <button
                        className="flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                {/* Search input */}
                <div
                    className={`flex items-center border  rounded-[5px] overflow-hidden `}
                >
                    <CustomInput
                        type="text"
                        name="no_of_allowed_buyers"
                        value={searchEmployee || ""}
                        className={` 
                                 h-[40px] px-[20px] pr-[40px] rounded-[10px]  w-full outline-none`}
                        onChange={(e) => handleSearchOnChange(e.target.value)}
                        placeholder="Search by employee name"
                    />
                </div>
                {/*Selected Employee  */}
                <div className="mt-2  ">
                    <div className="py-1 overflow-x-auto whitespace-nowrap flex gap-2 ">
                        <div className="inline-flex flex-wrap items-center gap-2">
                            {type === "reviewedByEmployees" ? (
                                reviewedByEmployees.length > 0 ? (
                                    reviewedByEmployees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="flex items-center bg-custom-solidgreen text-white text-xs rounded-full px-3 py-1"
                                        >
                                            <span>{emp.name}</span>
                                            <button
                                                className="ml-2 pb-[2px] border border-white text-[15px] text-white bg-custom-solidgreen rounded-full h-5 w-5 flex items-center justify-center"
                                                onClick={(e) =>
                                                    handleRemoveEmployee(
                                                        emp.id,
                                                        type
                                                    )
                                                }
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-500 px-1 montserrat-semibold">
                                        No selected reviewer
                                    </span>
                                )
                            ) : approvedByEmployees.length > 0 ? (
                                approvedByEmployees.map((emp) => (
                                    <div
                                        key={emp.id}
                                        className="flex items-center bg-custom-solidgreen text-white text-xs rounded-full px-3 py-1"
                                    >
                                        <span>{emp.name}</span>
                                        <button
                                            onClick={(e) =>
                                                handleRemoveEmployee(
                                                    emp.id,
                                                    type
                                                )
                                            }
                                            className="ml-2 pb-[2px] border border-white text-[15px] text-white bg-custom-solidgreen rounded-full h-5 w-5 flex items-center justify-center"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <span className="text-xs text-gray-500 px-1 montserrat-semibold">
                                    No selected approver
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-1  h-[600px] ">
                    <>
                        <div
                            className="absolute w-[520px] space-y-2 border-t-0 border-gray-300 p-2 py-[20px]  rounded-[10px] bg-white z-20 mt-1"
                            ref={dropdownRef}
                        >
                            <ul className="flex flex-col space-y-2 max-h-[500px] overflow-auto  ">
                                {filteredEmployees &&
                                    filteredEmployees.map((item) => {
                                        return (
                                            <li
                                                key={item.id}
                                                className="flex h-[110px] w-full py-[20px] px-[30px] gap-[18px] bg-custom-lightestgreen rounded-[10px]"
                                            >
                                                <div className="flex items-start py-[5px]">
                                                    <input
                                                        checked={
                                                            type ===
                                                            "reviewedByEmployees"
                                                                ? reviewedByEmployees.some(
                                                                      (emp) =>
                                                                          emp.id ===
                                                                          item.id
                                                                  )
                                                                : approvedByEmployees.some(
                                                                      (emp) =>
                                                                          emp.id ===
                                                                          item.id
                                                                  )
                                                        }
                                                        onChange={(e) =>
                                                            handleSelectedEmployee(
                                                                e,
                                                                item
                                                            )
                                                        }
                                                        type="checkbox"
                                                        className="form-checkbox custom-checkbox accent-custom-lightgreen text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <span>
                                                        {highlightText(
                                                            item?.firstname,
                                                            searchEmployee
                                                        )}{" "}
                                                        {highlightText(
                                                            item?.lastname,
                                                            searchEmployee
                                                        )}
                                                    </span>
                                                    <br />
                                                    <span className="text-sm">
                                                        {highlightText(
                                                            item?.employee_email,
                                                            searchEmployee
                                                        )}
                                                    </span>
                                                    <br />
                                                    <span className="text-sm">
                                                        {highlightText(
                                                            item.department,
                                                            searchEmployee
                                                        )}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                {filteredEmployees.length == 0 && (
                                    <div>
                                        <p>No results found</p>
                                    </div>
                                )}
                            </ul>
                        </div>
                    </>
                </div>
                <div className="py-4 flex justify-center">
                    <button
                        disabled={isDisabled}
                        className={`h-[37px] w-[176px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn5 hover:shadow-custom4 ${
                            isDisabled ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        onClick={handleApply}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </dialog>
    );
};

export default EmployeeReviewerApproverModal;
