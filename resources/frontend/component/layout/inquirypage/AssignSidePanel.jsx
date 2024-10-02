import React, { useEffect, useRef, useState } from "react";
import AssignDetails from "./AssignDetails";
import AssignModal from "./AssignModal";
import { useStateContext } from "../../../context/contextprovider";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const AssignSidePanel = ({ ticketId }) => {
    const { setTicketId, logs, allEmployees, user, data, specificInquiry } =
        useStateContext();
    const [isSelected, setIsSelected] = useState({});
    const [isAssign, setIsAssign] = useState(false);
    const logsMessages = logs[ticketId] || [];
    const [search, setSearch] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const modalRef = useRef(null);
    const dropdownRef = useRef(null);

    const options = [
        { name: 'Jane Doe', email: 'jane.doe@example.com', position: 'Customer Relations' },
        { name: 'John Smith', email: 'john.smith@example.com', position: 'Sales Manager' },
        { name: 'Alice Johnson', email: 'alice.johnson@example.com', position: 'Marketing Specialist' },
        { name: 'Bob Williams', email: 'bob.williams@example.com', position: 'HR Manager' },
        { name: 'Charlie Brown', email: 'charlie.brown@example.com', position: 'Product Manager' },
    ];

    const dataConcern =
        data?.find((items) => items.ticket_id === ticketId) || {};

    const handleOpenModal = () => {
        if (modalRef.current) {
            setIsAssign(dataConcern.resolve_from !== null);
            modalRef.current.showModal();
        }
    };

    const selectedEmployee = (event, value) => {
        setIsSelected(value);
    };

    const employeeOptions = allEmployees.map((employee) => ({
        label: `${employee.firstname} ${employee.lastname} (${employee.department})`,
        email: employee.employee_email,
        firstname: employee.firstname,
        department: employee.department,
        ticketId: ticketId,
    }));

    const assignedTicketId = specificInquiry
        ? specificInquiry.includes(ticketId)
        : null;
    const hasAccessToAssign = user?.department === "CRS" || assignedTicketId;


    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(search.toLowerCase()) ||
        option.email.toLowerCase().includes(search.toLowerCase()) ||
        option.position.toLowerCase().includes(search.toLowerCase())
    );

    // Handle checkbox selection
    const handleCheckboxChange = (option) => {
        if (selectedOptions.some(selected => selected.email === option.email)) {
            // Remove the option if it's already selected (unchecked)
            setSelectedOptions(prevSelected =>
                prevSelected.filter(item => item.email !== option.email)
            );
        } else {
            // Add the option if it's not selected (checked)
            setSelectedOptions(prevSelected => [...prevSelected, option]);
        }
    };

    // Handle tag removal
    const removeTag = (option) => {
        setSelectedOptions(prevSelected =>
            prevSelected.filter(item => item !== option)
        );
    };

    // Hide the dropdown when clicking outside
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    const highlightText = (text) => {
        if (!search) return text;
        const parts = text.split(new RegExp(`(${search})`, 'gi'));
        return (
          <span>
            {parts.map((part, index) =>
              part.toLowerCase() === search.toLowerCase() ? (
                <span key={index} className="font-semibold">{part}</span>
              ) : (
                part
              )
            )}
          </span>
        );
      };

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    useEffect(() => {
        setTicketId(ticketId);
    }, [ticketId, setTicketId]);

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
                            ${isDropdownOpen ? 'rounded-[10px] rounded-b-none' : 'rounded-[10px]'}
                        
                                 h-[47px] px-[20px] pr-[40px] rounded-[10px] bg-custom-grayF1 w-full outline-none`}
                        onFocus={() => setIsDropdownOpen(true)}
                    />

                    {/* Absolute button inside the input, aligned to the right */}
                    {isDropdownOpen && (
                        <button
                            onClick={() => setIsDropdownOpen(false)} // Close the dropdown when clicked
                            className="absolute right-[10px] top-1/2 transform -translate-y-1/2 gradient-btn5 text-white rounded-[10px] w-[80px] h-[31px] flex items-center justify-center"
                        >
                           Assign
                        </button>
                    )}
                </div>

                    {/* Conditionally render the list when dropdown is open */}
                    {isDropdownOpen && filteredOptions.length > 0 && (
                        <>
                        <div className="absolute w-[623px] min-h-[550px] space-y-2 border-t-0 border-gray-300 p-2 py-[20px] shadow-custom4 rounded-t-non rounded-[10px] bg-custom-grayF1">
                            <div className="mb-4 flex flex-wrap gap-2 h-[26px]">
                                        {selectedOptions.map(option => (
                                            <div
                                                key={option.name}
                                                className="flex justify-between items-center text-xs bg-custom-solidgreen text-white min-w-[99px] h-[26px] rounded-full pr-[10px] pl-[10px]"
                                            >
                                                <span>{option.name}</span>
                                                <button
                                                    onClick={() => removeTag(option)}
                                                    className="ml-2 pb-[2px] border border-white text-[15px] text-white bg-custom-solidgreen rounded-full h-5 w-5 flex items-center justify-center"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                <ul className="flex flex-col space-y-2 max-h-[550px] overflow-auto">
                                    {/* Selected options displayed as tags */}
                                
                                    
                                    {/* Render filtered options */}
                                    {filteredOptions.map((option) => (
                                        <li key={option.name} className="flex h-[110px] w-full py-[20px] px-[30px] gap-[18px] bg-custom-lightestgreen rounded-[10px]">
                                            <div className="flex items-start py-[5px]">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOptions.some(selected => selected.name === option.name)}
                                                    onChange={() => handleCheckboxChange(option)}
                                                    className="form-checkbox custom-checkbox accent-custom-lightgreen text-white"
                                                />
                                            </div>
                                            
                                            <div>
                                                <span>{highlightText(option.name)}</span><br />
                                                <span className="text-sm">{highlightText(option.email)}</span><br />
                                                <span className="text-sm">{highlightText(option.position)}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                        </>
                    )}
                </div>
            </div>
            <div className=" w-full bg-white rounded-[10px] py-[16px] px-[20px]">
                <div className="flex w-full justify-start items-center ">
                   <p className="text-sm text-custom-bluegreen font-semibold">Assignee</p>
                </div>
                <div className="flex h-[49px] w-full gradient-btn2 p-[2px] rounded-[10px] items-center justify-center my-[16px]">
                    <div className="w-full h-full flex items-center bg-white rounded-[8px] p-[10px]">
                        <input type="text" className="w-full outline-none" />
                        <button className="w-[76px] h-[28px] gradient-btn2 rounded-[10px] text-xs text-white">
                            Comment
                        </button>
                    </div>
                </div>
                <div className="border border-t-1 border-custom-lightestgreen"></div>
                <div className="h-full flex flex-col">
                    <div className=" h-[400px] overflow-y-auto">
                        <AssignDetails logMessages={logsMessages} />
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
