import React, { useEffect, useRef, useState } from "react";
import AssignDetails from "./AssignDetails";
import AssignModal from "./AssignModal";
import { useStateContext } from "../../../context/contextprovider";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import apiService from "../../servicesApi/apiService";
import { AiFillInfoCircle } from "react-icons/ai";
import { ALLOWED_EMPLOYEES_CRS } from "../../../constant/data/allowedEmployeesCRS";

const AssignSidePanel = ({ ticketId }) => {
    const {
        setTicketId,
        logs,
        allEmployees,
        user,
        data,
        specificInquiry,
        assigneesPersonnel,
        setAssigneesPersonnel,
        getAssigneesPersonnel,
        getInquiryLogs,
    } = useStateContext();

    const [isSelected, setIsSelected] = useState({});
    const [isAssign, setIsAssign] = useState(false);
    const logsMessages = logs[ticketId] || [];
    const [search, setSearch] = useState("");
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [tempSelection, setTempSelection] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const userLoggedInEmail = user?.employee_email;
    console.log("selectedOptions", selectedOptions);

    const modalRef = useRef(null);
    const dropdownRef = useRef(null);
    const dataConcern =
        data?.find((items) => items.ticket_id === ticketId) || {};

    const employeeOptions = allEmployees.map((employee) => ({
        name: `${employee.firstname} ${employee.lastname}`,
        email: employee.employee_email,
        firstname: employee.firstname,
        department:
            employee.department === "Customer Relations - Services"
                ? "Customer Relations - Services"
                : employee.department,
        abbreviationDep: employee.department,
        ticketId: ticketId,
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

    const handleCheckboxChange = (option, matchAssignee = null) => {
        if (matchAssignee) {
            if (
                !selectedOptions.some(
                    (selected) =>
                        selected.email === matchAssignee.employee_email
                )
            ) {
                removeAssignee(
                    ticketId,
                    matchAssignee.employee_email,
                    matchAssignee.name,
                    matchAssignee.department
                );
            }
        } else {
            if (
                selectedOptions.some(
                    (selected) => selected.email === option.email
                )
            ) {
                setSelectedOptions((prevSelected) =>
                    prevSelected.filter((item) => item.email !== option.email)
                );
            } else {
                setSelectedOptions((prevSelected) => [...prevSelected, option]);
                setTempSelection((prev) => [...prev, option]);
            }
        }
    };

    const removeTag = (option) => {
        if (option.employee_email) {
            removeAssignee(
                option.ticketId,
                option.employee_email,
                option.name,
                option.department
            );
        } else {
            setSelectedOptions((prevSelected) =>
                prevSelected.filter((item) => item !== option)
            );
        }
    };
    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setSelectedOptions((prevSelected) =>
                prevSelected.filter(
                    (item) => item.employee_email !== tempSelection.email
                )
            );
            setIsDropdownOpen(false);
        }
    };

    const handleConfirmation = () => {
        if (selectedOptions.length === 0) {
            /* alert("please select employee first"); */
            return;
        }
        setIsConfirmModalOpen(true);
    };

    const highlightText = (text) => {
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
    };

    const handleAssign = async () => {
        setIsConfirmModalOpen(false);
        if (selectedOptions.length === 0) {
            /* alert("please select employee first"); */
            return;
        }
        await saveAssignee();
        setIsDropdownOpen(false);
        setSelectedAssignees(selectedOptions);
        getAssigneesPersonnel();
    };

    const saveAssignee = async () => {
        try {
            const newAssignees = selectedOptions.filter(
                (selected) =>
                    !assigneesPersonnel[ticketId]?.some(
                        (assignee) => assignee.email === selected.email
                    )
            );
            if (newAssignees.length > 0) {
                const response = await apiService.post("add-assignee", {
                    selectedOptions: newAssignees,
                    assign_by: user?.firstname + " " + user?.lastname,
                    assign_by_department: user?.department,
                    /*  details_concern: dataConcern.details_concern,
                     buyer_name: dataConcern.buyer_name, */
                });
            } else {
                console.log("No new assignees to save");
            }

            getInquiryLogs(ticketId);

            return newAssignees;
        } catch (error) {
            console.log("Error assigning:", error);
            return [];
        }
    };

    const removeAssignee = async (ticket, email, name, department) => {
        try {
            const response = await apiService.post("remove-assignee", {
                ticketId: ticket,
                email: email,
                name: name,
                department: department,
                removedBy: user?.firstname + " " + user?.lastname,
            });

            if (response.data.message === "Unauthorized user") {
                /* alert("Unauthorized to remove assignee"); */
                return;
            } else {
                getInquiryLogs(ticketId);
                getAssigneesPersonnel();
            }
        } catch (error) {
            console.log("Error removing assignee:", error);
        }
    };

    useEffect(() => {
        setTicketId(ticketId);
        getAssigneesPersonnel();
    }, [ticketId, setTicketId]);

    useEffect(() => {
        if (assigneesPersonnel[ticketId]) {
            const assignees = assigneesPersonnel[ticketId];
            setSelectedOptions(assignees);
        }
    }, [assigneesPersonnel, ticketId]);

    const assigneeChannelFunc = (channel) => {
        channel.listen("RetrieveAssignees", (event) => {
            setAssigneesPersonnel((prevAssignees) => {
                const prevAssigneesTicket = prevAssignees[ticketId] || [];
                if (
                    prevAssigneesTicket.find(
                        (prev) => prev.id === event.data.assigneeId
                    )
                ) {
                    return prevAssignees;
                }
                const newData = event.data;
                return {
                    ...prevAssignees,
                    [ticketId]: [...prevAssigneesTicket, newData],
                };
            });
        });
    };

    const removeAChannelFunc = (channel) => {
        channel.listen("RemoveAssignees", (event) => {
            setAssigneesPersonnel((prevAssignees) => {
                const prevAssigneess = prevAssignees[ticketId] || [];
                const updatedAssignees = prevAssigneess.filter(
                    (assignee) => assignee.employee_email !== event.data.email
                );
                return {
                    ...prevAssignees,
                    [ticketId]: updatedAssignees,
                };
            });
        });
        getAssigneesPersonnel();
    };

    // useEffect(() => {
    //     let assigneeChannel;
    //     let newTicketId;
    //     let removeChannel;
    //     if (ticketId) {
    //         newTicketId = ticketId.replace("#", "");
    //         assigneeChannel = window.Echo.channel(
    //             `retrieveassignees.${newTicketId}`
    //         );
    //         removeChannel = window.Echo.channel(
    //             `removeassignees.${newTicketId}`
    //         );
    //         assigneeChannelFunc(assigneeChannel);
    //         removeAChannelFunc(removeChannel);
    //     }

    //     return () => {
    //         if (assigneeChannel) {
    //             assigneeChannel.stopListening("RetrieveAssignees");
    //             window.Echo.leaveChannel(`retrieveassignees.${newTicketId}`);
    //         }
    //         if (removeChannel) {
    //             removeChannel.stopListening("RemoveAssignees");
    //             window.Echo.leaveChannel(`removeassignees.${newTicketId}`);
    //         }
    //     };
    // }, [ticketId]);

    useEffect(() => {
        let assigneeChannel;
        let removeChannel;
        let newTicketId;

        // Function to initialize the channels when Echo is ready
        const initChannels = () => {
            if (ticketId && window.Echo) {
                newTicketId = ticketId.replace("#", "");
                assigneeChannel = window.Echo.channel(
                    `retrieveassignees.${newTicketId}`
                );
                removeChannel = window.Echo.channel(
                    `removeassignees.${newTicketId}`
                );
                assigneeChannelFunc(assigneeChannel);
                removeAChannelFunc(removeChannel);
            }
        };

        // Check if window.Echo is loaded before subscribing
        const checkBrowserReady = setInterval(() => {
            if (window.Echo) {
                initChannels();
                clearInterval(checkBrowserReady); // Stop checking once Echo is ready
            }
        }, 100); // Check every 100ms if Echo is initialized

        return () => {
            clearInterval(checkBrowserReady); // Clear interval if component unmounts

            if (assigneeChannel) {
                assigneeChannel.stopListening("RetrieveAssignees");
                window.Echo.leaveChannel(`retrieveassignees.${newTicketId}`);
            }
            if (removeChannel) {
                removeChannel.stopListening("RemoveAssignees");
                window.Echo.leaveChannel(`removeassignees.${newTicketId}`);
            }
        };
    }, [ticketId]);
    return (
        <>
            <div className="mb-3 mt-[2px]">
                <div className="relative w-[623px]" ref={dropdownRef}>
                    <div className="relative">
                        {user?.department ===
                            "Customer Relations - Services" && (
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Assign to..."
                                className={` 
                            ${
                                isDropdownOpen
                                    ? "rounded-[10px] rounded-b-none"
                                    : "rounded-[10px]"
                            }
                        
                                 h-[48px] px-[20px] pr-[40px] rounded-[10px] bg-custom-grayF1 w-full outline-none`}
                                onFocus={() => setIsDropdownOpen(true)}
                            />
                        )}

                        {/* Absolute button inside the input, aligned to the right */}
                        {isDropdownOpen && (
                            <button
                                onClick={handleConfirmation} // Close the dropdown when clicked
                                className="absolute right-[10px] top-1/2 transform -translate-y-1/2 gradient-btn5 text-white rounded-[10px] w-[80px] h-[31px] flex items-center justify-center"
                            >
                                Assign
                            </button>
                        )}
                        {isConfirmModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                <div className="bg-white p-[20px] rounded-[10px] shadow-custom5 w-[467px] h-[228]">
                                    <div className="flex justify-center items-center mt-[14px] ">
                                        <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                                    </div>
                                    <div className="flex justify-center mt-[30px]">
                                        <p className="montserrat-medium text-[20px]">
                                            Are you sure assigning this user?
                                        </p>
                                    </div>
                                    <div className="flex justify-center mt-[26px] space-x-[19px]">
                                        <button
                                            onClick={() =>
                                                setIsConfirmModalOpen(false)
                                            }
                                            className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]"
                                        >
                                            <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                                                <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                                    Cancel
                                                </p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleAssign}
                                            className="gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Conditionally render the list when dropdown is open */}
                    {isDropdownOpen && (
                        <>
                            <div className="absolute w-[623px] min-h-[550px] space-y-2 border-t-0 border-gray-300 p-2 py-[20px] shadow-custom6 rounded-t-none rounded-[10px] bg-custom-grayF1 z-20">
                                <div className="mb-4 flex flex-wrap gap-2 min-h-[26px]">
                                    {selectedOptions.map((option, index) => (
                                        <>
                                            {option.employee_email ? (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center text-xs bg-custom-solidgreen text-white min-w-[99px] h-[26px] rounded-full pr-[10px] pl-[10px]"
                                                >
                                                    <span className="flex-1 text-center">
                                                        {option.name}
                                                    </span>
                                                    {ALLOWED_EMPLOYEES_CRS.includes(
                                                        userLoggedInEmail
                                                    ) && (
                                                        <button
                                                            onClick={() =>
                                                                removeTag(
                                                                    option
                                                                )
                                                            }
                                                            className="ml-2 pb-[2px] border border-white text-[15px] text-white bg-custom-solidgreen rounded-full h-5 w-5 flex items-center justify-center  "
                                                        >
                                                            &times;
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center text-xs bg-custom-solidgreen text-white min-w-[99px] h-[26px] rounded-full pr-[10px] pl-[10px]"
                                                >
                                                    <span>{option.name}</span>
                                                    {user?.department ===
                                                        "Customer Relations - Services" && (
                                                        <button
                                                            onClick={() =>
                                                                removeTag(
                                                                    option
                                                                )
                                                            }
                                                            className="ml-2 pb-[2px] border border-white text-[15px] text-white bg-custom-solidgreen rounded-full h-5 w-5 flex items-center justify-center"
                                                        >
                                                            &times;
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ))}
                                </div>
                                <ul className="flex flex-col space-y-2 max-h-[550px] overflow-auto">
                                    {filteredOptions.map((option, index) => {
                                        const matchAssignee =
                                            assigneesPersonnel[ticketId]?.find(
                                                (assignee) =>
                                                    assignee.employee_email ===
                                                    option.email
                                            );
                                        return (
                                            <li
                                                key={index}
                                                className="flex h-[110px] w-full py-[20px] px-[30px] gap-[18px] bg-custom-lightestgreen rounded-[10px]"
                                            >
                                                <div className="flex items-start py-[5px]">
                                                    <input
                                                        type="checkbox"
                                                        disabled={
                                                            assigneesPersonnel[
                                                                ticketId
                                                            ]?.some(
                                                                (assignee) =>
                                                                    assignee.employee_email ===
                                                                    option.email
                                                            ) &&
                                                            !ALLOWED_EMPLOYEES_CRS.includes(
                                                                userLoggedInEmail
                                                            )
                                                        }
                                                        checked={
                                                            selectedOptions.some(
                                                                (selected) =>
                                                                    selected.email ===
                                                                    option.email
                                                            ) ||
                                                            assigneesPersonnel[
                                                                ticketId
                                                            ]?.some(
                                                                (assignee) =>
                                                                    assignee.employee_email ===
                                                                    option.email
                                                            )
                                                        }
                                                        onChange={() => {
                                                            // Allow the change only if the assignee is not pre-assigned OR if the user is in ALLOWED_EMPLOYEES_CRS
                                                            if (
                                                                !assigneesPersonnel[
                                                                    ticketId
                                                                ]?.some(
                                                                    (
                                                                        assignee
                                                                    ) =>
                                                                        assignee.employee_email ===
                                                                        option.email
                                                                ) ||
                                                                ALLOWED_EMPLOYEES_CRS.includes(
                                                                    userLoggedInEmail
                                                                )
                                                            ) {
                                                                handleCheckboxChange(
                                                                    option,
                                                                    matchAssignee
                                                                );
                                                            }
                                                        }}
                                                        className="form-checkbox custom-checkbox accent-custom-lightgreen text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <span>
                                                        {highlightText(
                                                            option.name
                                                        )}
                                                    </span>
                                                    <br />
                                                    <span className="text-sm">
                                                        {highlightText(
                                                            option.email
                                                        )}
                                                    </span>
                                                    <br />
                                                    <span className="text-sm">
                                                        {highlightText(
                                                            option.department
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
            </div>
            <div className=" w-full bg-white rounded-[10px] py-[16px] shadow-custom7">
                <div className="flex w-full px-[20px] justify-start items-start">
                    <p className="text-sm text-custom-bluegreen pt-1 font-semibold">
                        Assignee
                    </p>
                    <div className="ml-2 flex overflow-x-auto gap-2 max-w-full custom-scrollbar">
                        {/* {selectedOptions.length > 0 ? (
                            <>
                                {selectedOptions.map((assignee) => (
                                    <>
                                        <span
                                            key={assignee.name}
                                            className="bg-custom-lightgreen text-white rounded-full px-3 py-1 text-xs flex-shrink-0 flex mb-[4px]"
                                        >
                                            {assignee.name}
                                            {user?.department === "CRS" && (
                                                <button
                                                    onClick={() =>
                                                        removeTag(assignee)
                                                    }
                                                    className="ml-2 pb-[2px] border border-white text-[15px] text-white bg-custom-lightgreen rounded-full h-5 w-5 flex items-center justify-center"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </span>
                                    </>
                                ))}
                            </>
                        ) : (
                            <span className="text-sm text-gray-500 pt-1">
                                No assignee selected
                            </span>
                        )} */}
                        {selectedOptions.length > 0 ? (
                            <>
                                {selectedOptions.map((assignee) => (
                                    <>
                                        <span
                                            key={assignee.name}
                                            className="bg-custom-lightgreen text-white rounded-full px-3 py-1 text-xs flex-shrink-0 flex mb-[4px]"
                                        >
                                            {assignee.name}
                                            {ALLOWED_EMPLOYEES_CRS.includes(
                                                userLoggedInEmail
                                            ) && (
                                                <button
                                                    onClick={() =>
                                                        removeTag(assignee)
                                                    }
                                                    className="ml-2 pb-[2px] border border-white text-[15px] text-white bg-custom-lightgreen rounded-full h-5 w-5 flex items-center justify-center"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </span>
                                    </>
                                ))}
                            </>
                        ) : (
                            <span className="text-sm text-gray-500 pt-1">
                                No assignee selected
                            </span>
                        )}
                        {/* {selectedAssignees && selectedAssignees.length > 0 ? (
                            <div>
                                {selectedAssignees.map((item, index) => (
                                    <span
                                        key={index}
                                        className="bg-custom-lightgreen text-white rounded-full px-3 py-1 text-xs flex-shrink-0 flex mb-[4px]"
                                    >
                                        {item.name}
                                        {user?.department === "CRS" && (
                                            <button
                                                onClick={() => removeTag(item)}
                                                className="ml-2 pb-[2px] border border-white text-[15px] text-white bg-custom-lightgreen rounded-full h-5 w-5 flex items-center justify-center"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-500 pt-1">
                                No assignee selected
                            </span>
                        )} */}
                    </div>
                </div>

                <div className="h-full flex flex-col">
                    <div className=" min-h-[400px]">
                        <AssignDetails
                            logMessages={logsMessages}
                            ticketId={ticketId}
                        />
                    </div>
                    <div className="border border-t-1 border-custom-lightestgreen flex-shrink-0"></div>
                </div>
            </div>
            <div>
                <AssignModal
                    modalRef={modalRef}
                    employeeData={isSelected}
                    isAssign={isAssign}
                />
            </div>
        </>
    );
};

export default AssignSidePanel;
