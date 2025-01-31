import React, { useEffect, useState, useRef } from "react";
import TicketTable from "./TicketTable";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import ReactPaginate from "react-paginate";
import { useStateContext } from "../../../context/contextprovider";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import { MdRefresh } from "react-icons/md";
import InquiryFormModal from "./InquiryFormModal";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams, useLocation } from "react-router-dom";
import Spinner from "../../../util/Spinner";
const InquiryList = () => {
    const location = useLocation();

    /*   const searchParams = new URLSearchParams(location.search);
    const propertyParam = searchParams.get("property");
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");
    const channelsParam = searchParams.get("channels");
    const categoryParam = searchParams.get("category");
    const departmentParam = searchParams.get("department");
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year"); */

    /*    const searchParams = new URLSearchParams(location.search); */

    const {
        currentPage,
        setCurrentPage,
        data,
        pageCount,
        fullYear,
        getAllConcerns,
        daysFilter,
        setDaysFilter,
        setStatusFilter,
        setSearchFilter,
        statusFilter,
        searchFilter,
        user,
        dataCount,
        setSpecificAssigneeCsr,
        specificAssigneeCsr,
        department,
        loading,
        allEmployees,
        selectedOption,
        setSelectedOption,
        activeDayButton,
        setActiveDayButton,
        searchSummary,
        setSearchSummary,
        resultSearchActive,
        setResultSearchActive,
        /*  setHasAttachments,
        hasAttachments */
        userAccessData
    } = useStateContext();

    const propertyParam = searchFilter?.selectedProperty;
    const statusParam = searchFilter?.status;
    const typeParam = searchFilter?.type;
    const channelsParam = searchFilter?.channels;
    const categoryParam = searchFilter?.category;
    const departmentParam = searchFilter?.departments;
    const monthParam = searchFilter?.selectedMonth;
    const yearParam = searchFilter?.selectedYear;

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");

    const [email, setEmail] = useState("");
    const [ticket, setTicket] = useState("");
    const [status, setStatus] = useState("");
    const [type, setType] = useState("");
    const [channels, setChannels] = useState("");
    const [departments, setDepartments] = useState("");
    const [selectedProperty, setSelectedProperty] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [hasAttachments, setHasAttachments] = useState(false);
    const { propertyNamesList } = useStateContext();
    const [assignedToMeActive, setAssignedToMeActive] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(null);
    const filterBoxRef = useRef(null);
    const [isOpenSelect, setIsOpenSelect] = useState(false);
    const [canWrite, setCanWrite] = useState(false);

    useEffect(() => {
        if (userAccessData) {
            const inquiryPermissions = userAccessData?.employeePermissions?.find(
                (perm) => perm.name === 'Inquiry Management'
            ) || userAccessData?.departmentPermissions?.find(
                (perm) => perm.name === 'Inquiry Management'
            );
            setCanWrite(inquiryPermissions?.pivot?.can_write);
        }
    }, [userAccessData]);

   


    const handleSelect = (option) => {
        onChange(option);
        setIsOpenSelect(false);
    };
    const handleCheckboxChange = () => {
        setHasAttachments(!hasAttachments);
    };
    const handlePageClick = (data) => {
        const selectedPage = data.selected;
        setCurrentPage(selectedPage);
    };


    const handleRefresh = () => {
        setResultSearchActive(false);
        if (daysFilter) {
            setDaysFilter(null);
            setActiveDayButton(null);
        } else if (statusFilter) {
            setStatusFilter("All");
        } else if (searchFilter) {
            setSearchFilter({});
        } else if (specificAssigneeCsr) {
            setSpecificAssigneeCsr("");
            setAssignedToMeActive(false);
        }
        setStartDate(null);

        if (specificAssigneeCsr !== "" && daysFilter !== null) {
            setSpecificAssigneeCsr("");
            setAssignedToMeActive(false);
            setDaysFilter(null);
        }

        getAllConcerns();
    };

    const displayAll = () => {
        setDaysFilter(null);
        setCurrentPage(0);
    };

    /*  const handleFilterChange = (days) => {
         setDaysFilter(days);
         setCurrentPage(0);
 
     }; */
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const toggleFilterBox = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleDateChange = (date) => {
        setStartDate(date);
    };

    const handleClickOutside = (event) => {
        if (
            filterBoxRef.current &&
            !filterBoxRef.current.contains(event.target)
        ) {
            setIsFilterVisible(false);
        }
    };

    const handleOptionClick = (option) => {
        setResultSearchActive(false);
        setSelectedOption(option);
        setIsOpen(false);

        if (option === "All") {
            setDaysFilter(null);
            setStatusFilter(null);
            setCurrentPage(0);
            setSearchFilter("");
            setActiveDayButton(null);
            setSpecificAssigneeCsr("");
            setAssignedToMeActive(false);
        } else if (option === "Resolved") {
            setStatusFilter("Resolved");
            setCurrentPage(0);
            setSearchFilter("");
            setSpecificAssigneeCsr("");
            setAssignedToMeActive(false);
        } else if (option === "Closed") {
            setStatusFilter("Closed");
            setCurrentPage(0);
            setSearchFilter("");
            setSpecificAssigneeCsr("");
            setAssignedToMeActive(false);
        } else if (option === "Unresolved") {
            setStatusFilter("unresolved");
            setCurrentPage(0);
            setSearchFilter("");
            setSpecificAssigneeCsr("");
            setAssignedToMeActive(false);
        }
    };

    const handleSelectProperty = (e) => {
        setSelectedProperty(e.target.value);
    };

    // const handleDayClick = (day) => {
    //     let newValue = 0;

    //     if (day === "3+ Days") {
    //         newValue = 3;
    //     } else if (day === "2 Days") {
    //         newValue = 2;
    //     } else if (day === "1 Day") {
    //         newValue = 1;
    //     } else if(day === "") {
    //         setDaysFilter("");
    //     }
    //     setActiveDayButton((prev) => (prev === day ? null : day));
    //     setDaysFilter(newValue);
    //     setCurrentPage(0);
    // };

    const handleDayClick = (day) => {
        setActiveDayButton((prev) => {
            if (prev === day) {
                setDaysFilter("");
                return null;
            }

            let newValue = 0;
            if (day === "3+ Days") {
                newValue = "3+";
            } else if (day === "2 Days") {
                newValue = 2;
            } else if (day === "1 Day") {
                newValue = 1;
            }
            setDaysFilter(newValue);
            return day;
        });

        setCurrentPage(0);
    };

    const handleAssignedToMeClick = () => {
        setAssignedToMeActive(!assignedToMeActive);
        if (assignedToMeActive) {
            setSpecificAssigneeCsr("");
            setCurrentPage(0);
        } else {
            setSpecificAssigneeCsr(user?.employee_email);
        }
    };

    const modalRef = useRef(null);

    const handleOpenModal = () => {
        toast.dismiss();
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const formatFunc = (name) => {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formattedPropertyNames = [
        "N/A",
        ...(Array.isArray(propertyNamesList) && propertyNamesList.length > 0
            ? propertyNamesList
                  .filter((item) => !item.toLowerCase().includes("phase"))
                  .map((item) => {
                      let formattedItem = formatFunc(item);

                      // Capitalize each word in the string
                      formattedItem = formattedItem
                          .split(" ")
                          .map((word) => {
                              // Check for specific words that need to be fully capitalized
                              if (/^(Sjmv|Lpu|Cdo|Dgt)$/i.test(word)) {
                                  return word.toUpperCase();
                              }
                              // Capitalize the first letter of all other words
                              return (
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              );
                          })
                          .join(" ");

                      // Replace specific names if needed
                      if (formattedItem === "Casamira South") {
                          formattedItem = "Casa Mira South";
                      }

                      return formattedItem;
                  })
                  .sort((a, b) => {
                      if (a === "N/A") return -1;
                      if (b === "N/A") return 1;
                      return a.localeCompare(b);
                  })
            : []),
    ];

    const monthNames = {
        "01": "January",
        "02": "February",
        "03": "March",
        "04": "April",
        "05": "May",
        "06": "June",
        "07": "July",
        "08": "August",
        "09": "September",
        10: "October",
        11: "November",
        12: "December",
    };

    const updateLastActivity = () => {
        const currentTime = new Date();
        setLastActivity(currentTime);
    };
    const dayButtonLabels = ["3+ Days", "2 Days", "1 Day"];

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            setIsFilterVisible(false);
        }
    };

    const getTimeDifference = () => {
        if (!lastActivity) return "0 minutes";
        const now = new Date();
        const diff = Math.floor((now - lastActivity) / (1000 * 60));
        return diff === 0 ? "0 minutes" : `${diff} minutes ago`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short", // Jan
            day: "2-digit", // 16
            year: "numeric", // 2025
        });
    };

    const formatMonth = (monthNumber) => {
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        return monthNames[parseInt(monthNumber, 10) - 1]; // Adjust for zero-based index
    };


    const handleSearch = () => {
        setResultSearchActive(true);
        let summaryParts = []; // Array to hold each part of the summary

        if (category) summaryParts.push(`Category: ${category}`);
        if (status) {
            const displayStatus =
                status === "unresolved" ? "Unresolved" : status;
            summaryParts.push(`Status: ${displayStatus}`);
        }
        if (name) summaryParts.push(`Name: ${name}`);
        if (type) summaryParts.push(`Type: ${type}`);
        if (email) summaryParts.push(`Email: ${email}`);
        if (channels) {
            const formattedChannels =
                channels === "Walk in"
                    ? "Walk-in"
                    : channels === "Social media"
                    ? "Social Media"
                    : channels;
            summaryParts.push(`Channel: ${formattedChannels}`);
        }
        if (departments) summaryParts.push(`Department: ${departments}`);
        if (ticket) summaryParts.push(`Ticket: ${ticket}`);
        if (startDate)
            summaryParts.push(`Start Date: ${formatDate(startDate)}`);
        if (selectedProperty)
            summaryParts.push(`Property: ${selectedProperty}`);
        if (selectedMonth)
            summaryParts.push(`Month: ${formatMonth(selectedMonth)}`);
        if (selectedYear) summaryParts.push(`Year: ${selectedYear}`);
        if (hasAttachments) summaryParts.push(`Attachments: Yes`);

        setSearchSummary(summaryParts);

        setSearchFilter({
            name,
            category,
            type,
            status,
            email,
            channels,
            departments,
            ticket,
            startDate,
            selectedProperty,
            hasAttachments,
            selectedMonth,
            selectedYear,
        });
        setDaysFilter(null);
        setStatusFilter(null);
        setIsFilterVisible(false);
        setCurrentPage(0);
        setName("");
        setCategory("");
        setEmail("");
        setTicket("");
        setStatus("");
        setType("");
        setChannels("");
        setSelectedProperty("");
        setHasAttachments(false);
        setSpecificAssigneeCsr("");
        setSelectedYear("");
        setSelectedMonth("");
        setDepartments("");
    };

   
    useEffect(() => {
      /*   console.log("categoryParam", categoryParam);
        console.log("statusParam", statusParam);
        console.log("monthParam", monthParam);
        console.log("yearParam", yearParam);
        console.log("departmentParam", departmentParam);
        console.log("channelsParam", channelsParam);
 */

        if (
            propertyParam ||
            statusParam ||
            monthParam ||
            yearParam ||
            departmentParam ||
            channelsParam ||
            categoryParam
        ) {

            setResultSearchActive(true);

            let summaryParts = []; // Array to hold each part of the summary

            if (categoryParam)
                summaryParts.push(`Category: ${categoryParam}`);
            if (statusParam) {
                const displayStatus =
                statusParam === "unresolved" ? "Unresolved" : statusParam;
                summaryParts.push(`Status: ${displayStatus}`);
            }
            if (name) summaryParts.push(`Name: ${name}`);
            if (typeParam) summaryParts.push(`Type: ${typeParam}`);
            if (email) summaryParts.push(`Email: ${email}`);
            if (channelsParam) {
                // Format 'Walk in' to 'Walk-in'
                const formattedChannel =
                    channelsParam === "Walk in"
                        ? "Walk-in"
                        : channelsParam === "Social media"
                        ? "Social Media"
                        : channelsParam;
                summaryParts.push(`Channel: ${formattedChannel}`);
            }
            if (departmentParam)
                summaryParts.push(`Department: ${departmentParam}`);
            if (ticket) summaryParts.push(`Ticket: ${ticket}`);
            if (startDate)
                summaryParts.push(`Start Date: ${formatDate(startDate)}`);
            if (propertyParam)
                summaryParts.push(`Property: ${propertyParam}`);
            if (yearParam) summaryParts.push(`Year: ${yearParam}`);
            if (monthParam)
                summaryParts.push(`Month: ${formatMonth(monthParam)}`);
            if (hasAttachments) summaryParts.push(`Attachments: Yes`);

            setSearchSummary(summaryParts);

          /*   setSearchFilter({
            name,
            category: categoryParam,
            type: typeParam,
            status: statusParam,
            email,
            channels: channelsParam,
            departments: departmentParam,
            ticket,
            startDate,
            selectedProperty: propertyParam,
            hasAttachments,
            selectedMonth: monthParam,
            selectedYear: yearParam,
        }); */
        }
    }, [/* propertyParam, statusParam, departmentParam, monthParam, yearParam */]);

    useEffect(() => {
        if (isFilterVisible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isFilterVisible]);

    useEffect(() => {
        updateLastActivity();
        getAllConcerns();
    }, [
        searchFilter,
        statusFilter,
        daysFilter,
        specificAssigneeCsr,
        currentPage,
    ]);


    return (
        <>
            <div className="h-screen max-w-full bg-custom-grayFA px-[20px]">
                <div className="bg-custom-grayFA">
                    <div className="relative flex justify-start gap-3 pt-1">
                        {canWrite && (
                            <div className="relative w-[604px]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-4 absolute left-3 top-4 text-gray-500"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    readOnly={true}
                                    onClick={toggleFilterBox}
                                    className="h-[47px] w-[606px] bg-custom-grayF1 rounded-[10px] pl-9 pr-6 text-sm"
                                    placeholder="Search"
                                />
                                <svg
                                    onClick={toggleFilterBox}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-[24px] absolute right-3 top-3 text-custom-bluegreen hover:bg-gray-200 cursor-pointer"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                                    />
                                </svg>
                            </div>
                        )}
                        <div className="flex items-center">
                            {!canWrite || user?.department === "Customer Relations - Services" && (
                                <button
                                    onClick={handleOpenModal}
                                    className="h-[38px] w-[121px] gradient-btn5 text-white text-xs rounded-[10px]"
                                >
                                    <span className="text-[18px]">+</span> Add Inquiry
                                </button>
                            )}
                        </div>
                        {isFilterVisible && (
                            <div
                                ref={filterBoxRef}
                                className="absolute left-0 mt-12 p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[604px]"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            className="w-full  border-b-1 outline-none text-sm px-[8px]"
                                        />
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Category
                                        </label>

                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={category}
                                                onChange={(e) =>
                                                    setCategory(e.target.value)
                                                }
                                            >
                                                <option value=" ">
                                                    Select Category
                                                </option>
                                                <option value="Reservation Documents">
                                                    Reservation Documents
                                                </option>
                                                <option value="Payment Issues">
                                                    Payment Issues
                                                </option>
                                                <option value="SOA/ Buyer's Ledger">
                                                    SOA/ Buyer's Ledger
                                                </option>
                                                <option value="Turn Over Status">
                                                    Turn Over Status
                                                </option>
                                                <option value="Unit Status">
                                                    Unit Status
                                                </option>
                                                <option value="Loan Application">
                                                    Loan Application
                                                </option>
                                                <option value="Title and Other Registration Documents">
                                                    Title and Other Registration
                                                    Documents
                                                </option>
                                                <option value="Commissions">
                                                    Commissions
                                                </option>
                                                <option value="Other Concerns">
                                                    Other Concerns
                                                </option>
                                            </select>
                                        </div>

                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Type
                                        </label>
                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={type}
                                                onChange={(e) =>
                                                    setType(e.target.value)
                                                }
                                            >
                                                <option value="">
                                                    Select Type
                                                </option>
                                                <option value="Complaint">
                                                    Complaint
                                                </option>
                                                <option value="Request">
                                                    Request
                                                </option>
                                                <option value="Inquiry">
                                                    Inquiry
                                                </option>
                                                <option value="Suggestion or Recommendation">
                                                    Suggestion or Recommendation
                                                </option>
                                                <option value="No Type">
                                                    No Type
                                                </option>
                                            </select>
                                        </div>

                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Status
                                        </label>
                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={status}
                                                onChange={(e) =>
                                                    setStatus(e.target.value)
                                                }
                                            >
                                                <option value=" ">
                                                    Select Status
                                                </option>
                                                <option value="Resolved">
                                                    Resolved
                                                </option>
                                                <option value="unresolved">
                                                    Unresolved
                                                </option>
                                                <option value="Closed">
                                                    Closed
                                                </option>
                                            </select>
                                        </div>

                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>

                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Channels
                                        </label>
                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={channels}
                                                onChange={(e) =>
                                                    setChannels(e.target.value)
                                                }
                                            >
                                                <option value="">
                                                    {" "}
                                                    Select Channels
                                                </option>
                                                <option value="Email">
                                                    Email
                                                </option>
                                                <option value="Call">
                                                    Call
                                                </option>
                                                <option value="Walk in">
                                                    Walk-in
                                                </option>
                                                <option value="Website">
                                                    Website
                                                </option>
                                                <option value="Social media">
                                                    Social media
                                                </option>
                                                <option value="Branch Tablet">
                                                    Branch Table
                                                </option>
                                                <option value="Internal Endorsement">
                                                    Internal Endorsement
                                                </option>
                                                <option value="No Channel">
                                                    No Channel
                                                </option>
                                            </select>
                                        </div>

                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Department
                                        </label>
                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2" 
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={departments}
                                                onChange={(e) =>
                                                    setDepartments(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    {" "}
                                                    Select Department
                                                </option>
                                                {[
                                                    ...new Set(
                                                        allEmployees
                                                            .map(
                                                                (item) =>
                                                                    item.department
                                                            )
                                                            .filter(
                                                                (department) =>
                                                                    department !==
                                                                        null &&
                                                                    department !==
                                                                        undefined &&
                                                                    department !==
                                                                        "NULL"
                                                            )
                                                    ),
                                                ]
                                                    .sort((a, b) =>
                                                        a.localeCompare(b)
                                                    )
                                                    .map(
                                                        (department, index) => (
                                                            <option
                                                                key={index}
                                                                value={
                                                                    department
                                                                }
                                                            >
                                                                {department}
                                                            </option>
                                                        )
                                                    )}
                                            </select>
                                        </div>
                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Email
                                        </label>
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            className="w-full  border-b-1 outline-none text-sm px-[8px]"
                                        />
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Ticket
                                        </label>
                                        <input
                                            type="text"
                                            value={ticket}
                                            onChange={(e) =>
                                                setTicket(e.target.value)
                                            }
                                            className="w-full  border-b-1 outline-none text-sm px-[8px]"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex">
                                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[94px]">
                                                Date
                                            </label>
                                            <div className="relative">
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={handleDateChange}
                                                    className="border-b-1 outline-none w-[146px] text-sm px-[8px]"
                                                    calendarClassName="custom-calendar"
                                                />

                                                <img
                                                    src={DateLogo}
                                                    alt="date"
                                                    className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6 cursor-pointer pointer-events-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex relative">
                                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[65px]">
                                                {" "}
                                                Property
                                            </label>
                                            <select
                                                className="w-[220px] border-b-1 outline-none appearance-none text-sm px-[8px]"
                                                onChange={handleSelectProperty}
                                                value={selectedProperty}
                                            >
                                                <option value="">
                                                    Select Property
                                                </option>
                                                {formattedPropertyNames.map(
                                                    (item, index) => {
                                                        return (
                                                            <option
                                                                key={index}
                                                                value={item}
                                                            >
                                                                {item}
                                                            </option>
                                                        );
                                                    }
                                                )}
                                            </select>
                                            <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                                <IoIosArrowDown />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex">
                                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[94px]">
                                                Year
                                            </label>
                                            <div className="relative w-[146px]">
                                                <select
                                                    className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                    value={selectedYear}
                                                    onChange={(e) =>
                                                        setSelectedYear(
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        {" "}
                                                        Select Year
                                                    </option>
                                                    {fullYear &&
                                                        fullYear.map(
                                                            (item, index) => (
                                                                <option
                                                                    key={index}
                                                                    value={
                                                                        item.year
                                                                    }
                                                                >
                                                                    {" "}
                                                                    {item.year}
                                                                </option>
                                                            )
                                                        )}
                                                </select>
                                                <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                                    <IoIosArrowDown />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex relative">
                                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[65px]">
                                                {" "}
                                                Month
                                            </label>
                                            <select
                                                className="w-[220px] border-b-1 outline-none appearance-none text-sm px-[8px]"
                                                onChange={(e) =>
                                                    setSelectedMonth(
                                                        e.target.value
                                                    )
                                                }
                                                value={selectedMonth}
                                            >
                                                <option value="">
                                                    {" "}
                                                    Select Month
                                                </option>
                                                {Object.entries(monthNames)
                                                    .sort(
                                                        ([keyA], [keyB]) =>
                                                            keyA - keyB
                                                    )
                                                    .map(([key, name]) => (
                                                        <option
                                                            key={key}
                                                            value={key}
                                                        >
                                                            {name}
                                                        </option>
                                                    ))}
                                            </select>
                                            <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                                <IoIosArrowDown />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-5 flex gap-5">
                                        <input
                                            type="checkbox"
                                            checked={hasAttachments}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Has Attachments
                                        </label>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            className="h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm"
                                            onClick={handleSearch}
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/*  <div className="flex items-center">
                        <button onClick={handleOpenModal} className='h-[38px] w-[121px] gradient-btn5 text-white  text-xs rounded-[10px]'> <span className='text-[18px]'>+</span> Add Inquiry</button>
                    </div> */}
                    {resultSearchActive && (
                        <div className="flex flex-col gap-1 p-2 mt-[15px] bg-white w-max rounded-[8px] shadow-custom7 text-sm">
                            <div className="flex flex-col">
                                <div className="mb-5">
                                    <strong>Search {data?.length > 1 ? 'results for' : 'result for'} &nbsp;</strong>
                                </div>
                                <div className="flex flex-col flex-wrap gap-2">
                                    {searchSummary.map((part, index) => {
                                        const [label, value] = part.split(": ");
                                        return (
                                            <div key={index}>
                                                <strong>{label}:</strong>{" "}
                                                {value}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="max-w-[1260px]">
                    <div className="flex justify-between items-center h-12 mt-[15px] px-6 bg-white rounded-t-lg mb-1 ">
                        <div className="relative mr-4 ">
                            <button
                                className="flex text-[20px] w-max items-center gap-3 text-custom-bluegreen font-semibold"
                                onClick={toggleDropdown}
                            >
                                {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}{" "}
                                {resultSearchActive ? (
                                    dataCount && dataCount === 0 ? (
                                        <p>No Records Found</p>
                                    ) : (
                                        <p>{dataCount} {data?.length > 1 ? 'Results' : 'Result'} Found</p>
                                    )
                                ) : (
                                    <p>{selectedOption}</p>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isOpen && (
                                <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md">
                                    <ul className="py-2">
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                                handleOptionClick("All")
                                            }
                                        >
                                            All
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                                handleOptionClick("Resolved")
                                            }
                                        >
                                            Resolved
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                                handleOptionClick("Closed")
                                            }
                                        >
                                            Closed
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                                handleOptionClick("Unresolved")
                                            }
                                        >
                                            Unresolved
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-[10px]">
                            <div className="flex gap-2">
                                <div className="flex items-center space-x-2">
                                    {user?.department ===
                                        "Customer Relations - Services" && (
                                            <button
                                                onClick={handleAssignedToMeClick}
                                                className={`flex items-center text-custom-lightgreen h-[25px] w-[125px] rounded-[55px] p-[2px] ${assignedToMeActive
                                                    ? "bglightgreen-btn"
                                                    : "gradient-btn2hover "
                                                    }`}
                                            >
                                                <p
                                                    className={`h-full w-full flex justify-center items-center text-xs montserrat-semibold rounded-[50px]   ${assignedToMeActive
                                                        ? "bglightgreen-btn"
                                                        : "bg-white hover:bg-custom-lightestgreen"
                                                        }
                                        `}
                                                >
                                                    Assigned to me
                                                </p>
                                            </button>
                                        )}
                                    {dayButtonLabels.map((label) => (
                                        <button
                                            key={label}
                                            onClick={() =>
                                                handleDayClick(label)
                                            }
                                            className={`flex justify-center items-center  text-custom-lightgreen h-[25px] rounded-[55px] p-[2px] ${activeDayButton === label
                                                ? "bglightgreen-btn hover:bg-custom-lightgreen"
                                                : "gradient-btn2hover border-custom-lightgreen"
                                                } hover:bg-custom-lightestgreen ${label === "3+ Days"
                                                    ? "w-[76px]"
                                                    : label === "2 Days"
                                                        ? "w-[69px]"
                                                        : "w-[60px]"
                                                }`}
                                        >
                                            <p
                                                className={`h-full w-full flex justify-center items-center text-xs montserrat-semibold rounded-[50px]
                                            ${activeDayButton === label
                                                        ? "bglightgreen-btn"
                                                        : "bg-white hover:bg-custom-lightestgreen"
                                                    }
                                            `}
                                            >
                                                {label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end items-center ">
                                <button
                                    className="flex justify-center items-center h-[30px] w-[30px] hover:bg-custom-grayF1 rounded-full text-custom-bluegreen hover:text-custom-lightblue"
                                    onClick={handleRefresh}
                                >
                                    <MdRefresh />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="w-[1260px]">
                        {/*  {loading ? (
                            <>
                             <p className="text-center">
                               <Spinner/>
                             </p>
                            </>
                        ) : (
                           <>
                            {data && data.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">
                                    No records found.
                                </p>
                            ) : (
                                <TicketTable concernData={data || []} />
                            )}
                           </>
                        )} */}
                        {data && data.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">
                                No records found.
                            </p>
                        ) : (
                            <TicketTable concernData={data || []} />
                        )}
                    </div>
                    <div className="flex justify-end items-center h-12 px-6 gap-2 bg-white rounded-b-lg">
                        <p className="text-sm text-gray-400 hidden">
                            Last account activity: {getTimeDifference()}
                        </p>
                    </div>
                    <div className="flex justify-end mt-4">
                        <div className="flex w-full justify-end mt-3 mb-10">
                            <ReactPaginate
                                previousLabel={
                                    <MdKeyboardArrowLeft className="text-[#404B52]" />
                                }
                                nextLabel={
                                    <MdKeyboardArrowRight className="text-[#404B52]" />
                                }
                                breakLabel={"..."}
                                pageCount={pageCount}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={1}
                                onPageChange={handlePageClick}
                                containerClassName={"flex gap-2"}
                                previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                                nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                                pageClassName=" border border-[#EEEEEE] bg- text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                                activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                                pageLinkClassName="w-full h-full flex justify-center items-center"
                                activeLinkClassName="w-full h-full flex justify-center items-center"
                                disabledLinkClassName={
                                    "text-gray-300 cursor-not-allowed"
                                }
                                forcePage={currentPage}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <InquiryFormModal modalRef={modalRef} />
                </div>
            </div>
        </>
    );
};

export default InquiryList;
