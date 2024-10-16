import React, { useEffect, useState, useRef } from "react";
import TicketTable from "./TicketTable";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import ReactPaginate from "react-paginate";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import moment from "moment";
import { MdRefresh } from "react-icons/md";
import { Alert } from "@mui/material";
import InquiryFormModal from "./InquiryFormModal";
import axios from "axios";

const InquiryList = () => {
    const {
        currentPage,
        setCurrentPage,
        data,
        pageCount,
        getAllConcerns,
        daysFilter,
        setDaysFilter,
        setStatusFilter,
        setSearchFilter,
        statusFilter,
        searchFilter,
        user,
        setSpecificAssigneeCsr,
        specificAssigneeCsr,
        /*  setHasAttachments,
        hasAttachments */
    } = useStateContext();
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [email, setEmail] = useState("");
    const [ticket, setTicket] = useState("");
    const [status, setStatus] = useState("");
    const [hasAttachments, setHasAttachments] = useState(false);

    const [activeDayButton, setActiveDayButton] = useState(null);
    const [assignedToMeActive, setAssignedToMeActive] = useState(false);

    const [startDate, setStartDate] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("All");
    const [lastActivity, setLastActivity] = useState(null);
    const filterBoxRef = useRef(null);

    const handleCheckboxChange = () => {
        setHasAttachments(!hasAttachments);
    };
    const handlePageClick = (data) => {
        const selectedPage = data.selected;
        setCurrentPage(selectedPage);
    };

    const handleRefresh = () => {
        if (daysFilter) {
            setDaysFilter(null);
            setActiveDayButton(null);
        } else if (statusFilter) {
            setStatusFilter("All");
        } else if (searchFilter) {
            setSearchFilter({});
        } else if (specificAssigneeCsr) {
            console.log("if assign only");
            setSpecificAssigneeCsr("");
            setAssignedToMeActive(false);
        }
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
        } else if (option === "Resolve") {
            setStatusFilter("Resolved");
            setCurrentPage(0);
            setSearchFilter("");
            setSpecificAssigneeCsr("");
            setAssignedToMeActive(false);
        } else if (option === "Unresolve") {
            setStatusFilter("unresolved");
            setCurrentPage(0);
            setSearchFilter("");
            setSpecificAssigneeCsr("");
            setAssignedToMeActive(false);
        }
    };

    const handleStatus = (e) => {
        setStatus(e.target.value);
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
        if (modalRef.current) {
            modalRef.current.showModal();
        }
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

    const handleSearch = () => {
        setSearchFilter({
            name,
            category,
            email,
            ticket,
            startDate,
            status,
            hasAttachments,
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
        setHasAttachments(false);
        setSpecificAssigneeCsr("");
    };

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
    }, [
        searchFilter,
        statusFilter,
        daysFilter,
        specificAssigneeCsr,
        currentPage,
    ]);

   /*  const sendSoapRequest = async () => {
        const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
           <soap:Header/>
           <soap:Body>
              <urn:Zapptosap>
                 <Ecode>5555</Ecode>
                 <Ename>Test</Ename>
              </urn:Zapptosap>
           </soap:Body>
        </soap:Envelope>
        `;
    
        const username = "KBELMONTE";
        const password = "Tomorrowbytogether2019!";
        const authHeader = "Basic " + btoa(`${username}:${password}`);
    
        const config = {
            headers: {
                "Content-Type": "application/soap+xml",
                "SOAPAction": "urn:sap-com:document:sap:soap:functions:mc-style",
                Authorization: authHeader,
            },
        };
    
        try {
            const response = await axios.post("http://localhost:8001/proxy-sap", soapBody, config);

            console.log("Response:", response.data);
        } catch (error) {
            console.log("Error:", error.response.data);
        }
    }; */
    

    const sendSoapRequest = async () => {
        const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
           <soap:Header/>
           <soap:Body>
              <urn:Zapptosap>
                 <Ecode>321321</Ecode>
                 <Ename>markyboy12</Ename>
              </urn:Zapptosap>
           </soap:Body>
        </soap:Envelope>
        `;
    
        const username = "KBELMONTE";
        const password = "Tomorrowbytogether2019!";
        const authHeader = "Basic " + btoa(`${username}:${password}`);
    
        const config = {
            headers: {
                "Content-Type": "application/soap+xml",
                "Authorization": authHeader,
            },
        };
    
        try {
            const response = await axios.post("http://localhost:8001/api/proxy-sap", soapBody, config);
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Error:", error.response ? error.response.data : error.message);
        }
    };
    
    
    return (
        <>
            <div className="h-screen max-w-full bg-custom-grayFA px-[20px]">
                <div className="bg-custom-grayFA">
                    <div className="relative flex justify-start gap-3 pt-1">
                        <div className="relative w-[604px]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-4 absolute left-3 top-3 text-gray-500"
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
                                className="h-[47px] w-[606px] rounded-[10px] pl-9 pr-6 text-sm"
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
                        <div className="flex items-center">
                            <button
                                onClick={handleOpenModal}
                                className="h-[38px] w-[121px] gradient-btn5 text-white  text-xs rounded-[10px]"
                            >
                                {" "}
                                <span className="text-[18px]">+</span> Add
                                Inquiry
                            </button>
                           {/*  <button onClick={sendSoapRequest}>
                                testUpload
                            </button> */}
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
                                            className="w-full  border-b-1 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Category
                                        </label>

                                        <select
                                            className="w-full border-b-1 outline-none text-sm"
                                            value={category}
                                            onChange={(e) =>
                                                setCategory(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Select Category
                                            </option>
                                            <option value="Reservation Documents">
                                                Reservation Documents
                                            </option>
                                            <option value="Payment Issues">
                                                Payment Issues
                                            </option>
                                            <option value="Statement of Account and Billing Statement">
                                                Statement of Account and Billing
                                                Statement
                                            </option>
                                            <option value="Turnover Status/Unit Concerns">
                                                Turnover Status/Unit Concerns
                                            </option>
                                            <option value="Loan Application">
                                                Loan Application
                                            </option>
                                            <option value="Titile and Other Registration Documents">
                                                Titile and Other Registration
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
                                            className="w-full  border-b-1 outline-none text-sm"
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
                                            className="w-full  border-b-1 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[214px]">
                                            Date
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={startDate}
                                                onChange={handleDateChange}
                                                className="border-b-1 outline-none w-[176px] text-sm"
                                                calendarClassName="custom-calendar"
                                            />

                                            <img
                                                src={DateLogo}
                                                alt="date"
                                                className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6 cursor-pointer pointer-events-none"
                                            />
                                        </div>
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Status
                                        </label>
                                        <select
                                            className="w-full border-b-1 outline-none text-sm"
                                            onChange={handleStatus}
                                            value={status}
                                        >
                                            <option value="">
                                                Select Status
                                            </option>
                                            <option value="Inquiry Feedback Received">
                                                Inquiry Feedback Received
                                            </option>
                                            <option value="Replied By">
                                                Replied By
                                            </option>
                                            <option value="Assigned To">
                                                Assigned To
                                            </option>
                                            <option value="Marked as resolved">
                                                Marked as resolved
                                            </option>
                                            <option value="Follow up reply">
                                                Follow up reply
                                            </option>
                                        </select>
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
                </div>
                <div className="max-w-[1260px] ">
                    <div className="flex justify-between items-center h-12 mt-[15px] px-6 bg-white rounded-t-lg mb-1 ">
                        <div className="relative mr-4 ">
                            <button
                                className="flex text-[20px] w-[130px] items-center gap-3 text-custom-bluegreen font-semibold"
                                onClick={toggleDropdown}
                            >
                                {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}{" "}
                                {selectedOption}
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
                                                handleOptionClick("Resolve")
                                            }
                                        >
                                            Resolved
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                                handleOptionClick("Unresolve")
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
                                <div className="flex space-x-2">
                                    {user?.department === "CRS" && (
                                        <button
                                            onClick={handleAssignedToMeClick}
                                            className={`flex items-center border text-custom-lightgreen h-[29px] w-[125px] rounded-[55px] p-[2px] ${
                                                assignedToMeActive
                                                    ? "bglightgreen-btn"
                                                    : "gradient-btn2hover "
                                            }`}
                                        >
                                            <p
                                                className={`h-full w-full flex justify-center items-center  text-xs montserrat-semibold rounded-[50px]   ${
                                                    assignedToMeActive
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
                                            className={`flex justify-center items-center  text-custom-lightgreen h-[25px] rounded-[55px] p-[2px] ${
                                                activeDayButton === label
                                                    ? "bglightgreen-btn hover:bg-custom-lightgreen"
                                                    : "gradient-btn2hover border-custom-lightgreen"
                                            } hover:bg-custom-lightestgreen ${
                                                label === "3+ Days"
                                                    ? "w-[76px]"
                                                    : label === "2 Days"
                                                    ? "w-[69px]"
                                                    : "w-[60px]"
                                            }`}
                                        >
                                            <p
                                                className={`h-full w-full flex justify-center items-center text-xs montserrat-semibold rounded-[50px]
                                            ${
                                                activeDayButton === label
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
                        {data && data.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">
                                No data found
                            </p>
                        ) : (
                            <TicketTable concernData={data || []} />
                        )}
                    </div>

                    <div className="flex justify-end items-center h-12 px-6 gap-2 bg-white rounded-b-lg">
                        <p className="text-sm text-gray-400">
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
