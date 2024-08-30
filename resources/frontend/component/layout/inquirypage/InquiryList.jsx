import React, { useEffect, useState } from "react";
import TicketTable from "./TicketTable";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import ReactPaginate from "react-paginate";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";

const InquiryList = () => {
    const {
        currentPage,
        setCurrentPage,
        data,
        pageCount,
        getAllConcerns,
        daysFilter,
        setDaysFilter,
    } = useStateContext();

    const handlePageClick = (data) => {
        const selectedPage = data.selected;
        setCurrentPage(selectedPage);
        
    };

    const handleRefresh = () => {
        setDaysFilter(null);
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

   

    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('All');
  
    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };
  
    const handleOptionClick = (option) => {
      setSelectedOption(option);
      setIsOpen(false); 

      if(option === "All") {
        setDaysFilter(null);
        setCurrentPage(0);
      }
    };

    const [activeDayButton, setActiveDayButton] = useState(null);
    const [assignedToMeActive, setAssignedToMeActive] = useState(false);

    const handleDayClick = (day) => {
        let newValue = 0;
        
        if(day === '3+ Days') {
            newValue = 3;
        } else if(day === '2 Days') {
            newValue = 2;
        } else if (day === '1 Day') {
            newValue = 1;
        }
        setActiveDayButton((prev) => (prev === day ? null : day));
        setDaysFilter(newValue);
        setCurrentPage(0);
      };
    
      const handleAssignedToMeClick = () => {
        setAssignedToMeActive(!assignedToMeActive);
      };
  
      const dayButtonLabels = ['3+ Days', '2 Days', '1 Day'];

    return (
        <>
            <div className="h-screen max-w-full bg-custom-grayFA p-4">
                <div className="bg-custom-grayFA">
                    <div className="relative flex justify-start gap-3">
                        <div className="relative w-1/2">
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
                                className="h-10 w-full rounded-lg pl-9 pr-6 text-sm"
                                placeholder="Search"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-4 absolute right-3 top-3 text-custom-bluegreen"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="max-w-5xl">
                    <div className="flex justify-between items-center h-12 mt-3 px-6 gap-2 bg-white rounded-t-lg mb-1">
                        <div className="relative mr-4">
                            <button
                                className="flex text-[20px] items-center gap-3 text-custom-bluegreen font-semibold"
                                onClick={toggleDropdown}
                            >
                                {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown /> } {selectedOption}
                            </button>

                            {/* Dropdown Menu */}
                            {isOpen && (
                                <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md">
                                <ul className="py-2">
                                    <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleOptionClick('All')}
                                    >
                                    All
                                    </li>
                                    <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleOptionClick('Resolve')}
                                    >
                                    Resolve
                                    </li>
                                    <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleOptionClick('Unresolve')}
                                    >
                                    Unresolve
                                    </li>
                                </ul>
                                </div>
                            )}
                        </div>
                       <div className="flex gap-2 justify-end">
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleAssignedToMeClick}
                                    className={`flex items-center border border-custom-lightgreen text-custom-lightgreen h-[25px] px-3 rounded-3xl ${
                                    assignedToMeActive ? 'bg-custom-lightgreen text-white' : ''
                                    }`}
                                >
                                    <p className="text-sm montserrat-semibold">Assigned to me</p>
                                </button>

                                {dayButtonLabels.map((label) => (
                                    <button
                                    key={label}
                                    onClick={() => handleDayClick(label)}
                                    className={`flex items-center border border-custom-lightgreen text-custom-lightgreen h-[25px] px-3 rounded-3xl ${
                                        activeDayButton === label ? 'bg-custom-lightgreen text-white' : ''
                                    }`}
                                    >
                                    <p className="text-sm montserrat-semibold">{label}</p>
                                    </button>
                                ))}
                                <button onClick={handleRefresh}>Refresh</button>
                            </div>
                       </div>
                    </div>
                    <div>
                    {(data && data.length === 0) ? (
                        <p className="text-center text-gray-500 py-4">
                            No data found
                        </p>
                    ) : (
                        <TicketTable concernData={data || []} />
                    )}
                    </div>

                    <div className="flex justify-end items-center h-12 px-6 gap-2 bg-white rounded-b-lg">
                        <p className="text-sm text-gray-400">
                            Last account activity: 0 minutes
                        </p>
                    </div>
                    <div className="flex justify-end mt-4">
                        <div className='flex w-full justify-end mt-3'>
                            <ReactPaginate
                            previousLabel={<MdKeyboardArrowLeft className='text-[#404B52]'/>}
                            nextLabel={<MdKeyboardArrowRight className='text-[#404B52]'/>}
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
                            /* forcePage={currentPage} */
                        />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InquiryList;
