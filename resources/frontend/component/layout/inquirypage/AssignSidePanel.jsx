import React, { useEffect, useRef, useState } from "react";
import AssignDetails from "./AssignDetails";
import AssignModal from "./AssignModal";
import { useStateContext } from "../../../context/contextprovider";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import apiService from "../../servicesApi/apiService";

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
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedAssignees, setSelectedAssignees] = useState([]);

    const modalRef = useRef(null);
    const dropdownRef = useRef(null);

    const employeeOptions = allEmployees.map((employee) => ({
        name: `${employee.firstname} ${employee.lastname}`,
        email: employee.employee_email,
        firstname: employee.firstname,
        department:
            employee.department === "CRS"
                ? "Customer Relations Services"
                : employee.department,
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
                removeAssignee(ticketId, matchAssignee.employee_email);
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
            }
        }
    };

    const removeTag = (option) => {
        if (option.employee_email) {
            removeAssignee(option.ticketId, option.employee_email);
        } else {
            setSelectedOptions((prevSelected) =>
                prevSelected.filter((item) => item !== option)
            );

            setSelectedAssignees((prevAssignees) =>
                prevAssignees.filter(
                    (assignee) => assignee.email !== option.email
                )
            );
        }
    };

    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setIsDropdownOpen(false);
        }
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
        if (selectedOptions.length === 0) {
            alert("please select employee first");
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
            /*  return false;    */
            if (newAssignees.length > 0) {
                const response = await apiService.post("add-assignee", {
                    selectedOptions: newAssignees,
                    assign_by: user?.firstname + " " + user?.lastname,
                    assign_by_department: user?.department,
                });
                console.log("Assignees saved successfully:", response);
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

    const removeAssignee = async (ticket, email) => {
        try {
            const response = await apiService.post("remove-assignee", {
                ticketId: ticket,
                email: email,
            });

            if (response.data.message === "Unauthorized user") {
                alert("Unauthorized to remove assignee");
                return;
            } else {
                getAssigneesPersonnel();
                alert("success");
            }

            console.log("Assignee removed:", response);
        } catch (error) {
            console.log("Error removing assignee:", error);
        }
    };

    // const saveAssignee = async () => {
    //     try {
    //         const newAssignees = selectedOptions.filter((selected) => {
    //             !assigneesPersonnel[ticketId]?.some(
    //                 (assignee) => assignee.email === selected.email
    //             )
    //         });
    //         if (newAssignees.length > 0) {
    //             const response = await apiService.post("add-assignee", {
    //                 selectedOptions: newAssignees,
    //                 assign_by: user?.firstname + " " + user?.lastname,
    //                 assign_by_department: user?.department,
    //             });
    //             console.log('Assignees saved successfully:', response);
    //         } else {
    //             console.log('No new assignees to save');
    //         }

    //         // Return the newAssignees array
    //         return newAssignees;
    //         /* getInquiryLogs(employeeData.ticketId); */
    //         /*  getAllConcerns(); */
    //     } catch (error) {
    //         console.log("error assigning", error);
    //     }
    // };

    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setTicketId(ticketId);
        getAssigneesPersonnel();
    }, [ticketId, setTicketId]);

    useEffect(
        () => {
            if (assigneesPersonnel[ticketId]) {
                const assignees = assigneesPersonnel[ticketId]; /* || [] */
                setSelectedOptions(assignees);
            }
        },
        /* [assigneesPersonnel[ticketId], */ [assigneesPersonnel[ticketId]]
    );

    const assigneeChannelFunc = (channel) => {
        channel.listen("RetrieveAssignees", (event) => {
            console.log("event data for assigning", event.data);
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
            console.log("event data for removing", event.data);
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
    };
    useEffect(() => {
        let assigneeChannel;
        let newTicketId;
        let removeChannel;
        if (ticketId) {
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

        return () => {
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
            <div className="mb-3 mt-[4px]">
                <div className="relative w-[623px]" ref={dropdownRef}>
                    <div className="relative">
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
                        
                                 h-[47px] px-[20px] pr-[40px] rounded-[10px] bg-custom-grayF1 w-full outline-none`}
                            onFocus={() => setIsDropdownOpen(true)}
                        />

                        {/* Absolute button inside the input, aligned to the right */}
                        {isDropdownOpen && (
                            <button
                                onClick={handleAssign} // Close the dropdown when clicked
                                className="absolute right-[10px] top-1/2 transform -translate-y-1/2 gradient-btn5 text-white rounded-[10px] w-[80px] h-[31px] flex items-center justify-center"
                            >
                                Assign
                            </button>
                        )}
                    </div>

                    {/* Conditionally render the list when dropdown is open */}
                    {isDropdownOpen && filteredOptions.length > 0 && (
                        <>
                            <div className="absolute w-[623px] min-h-[550px] space-y-2 border-t-0 border-gray-300 p-2 py-[20px] shadow-custom4 rounded-t-non rounded-[10px] bg-custom-grayF1 z-20">
                                <div className="mb-4 flex flex-wrap gap-2 min-h-[26px]">
                                    {selectedOptions.map((option, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center text-xs bg-custom-solidgreen text-white min-w-[99px] h-[26px] rounded-full pr-[10px] pl-[10px]"
                                        >
                                            <span>{option.name}</span>
                                            {user?.department === "CRS" && (
                                                <button
                                                    onClick={() =>
                                                        removeTag(option)
                                                    }
                                                    className="ml-2 pb-[2px] border border-white text-[15px] text-white bg-custom-solidgreen rounded-full h-5 w-5 flex items-center justify-center"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
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
                                                        /* checked={selectedOptions.some(
                                                    (selected) =>
                                                        selected.email ===
                                                        option.email 
                                                )} */
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
                                                        onChange={() =>
                                                            handleCheckboxChange(
                                                                option,
                                                                matchAssignee
                                                            )
                                                        }
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
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className=" w-full bg-white rounded-[10px] py-[16px] px-[20px]">
                <div className="flex w-full justify-start items-start">
                    <p className="text-sm text-custom-bluegreen pt-1 font-semibold">
                        Assignee
                    </p>
                    <div className="ml-2 flex overflow-x-auto gap-2 max-w-full custom-scrollbar">
                        {selectedOptions.length > 0 ? (
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
                        )}
                    </div>
                </div>

                <div className="h-full flex flex-col">
                    <div className=" min-h-[400px]">
                        <AssignDetails
                            logMessages={logsMessages}
                            ticketId={ticketId}
                        />
                    </div>
                    <div className="border border-t-1 border-custom-lightestgreen flex-shrink-0 mb-[160px] mt-[17px]"></div>
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
