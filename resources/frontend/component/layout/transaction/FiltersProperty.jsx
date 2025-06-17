import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { MdCalendarToday } from "react-icons/md";
import arrowCutomer from "../../../../../public/Images/arrowcustomer.png";

const categories = [
    "Reservation Documents",
    "Payment Issues",
    "SOA/ Buyer's Ledger",
    "Turn Over Status",
    "Unit Status",
    "Loan Application",
    "Title and Other Registration Documents",
    "Commissions",
    "Other Concerns",
];

const FiltersProperty = () => {
    const [startDateHistory, setStartDateHistory] = useState(new Date());

    const handleDateHistoryChange = (date) => {
        setStartDateHistory(date);
    };


    return (
        <div className="bg-white py-4 px-5 mt-[27px] space-y-2 rounded-[10px]">
            <div className="flex items-center">
                <span className="text-black text-xl font-semibold">
                    Filters
                </span>
                <div className="flex-1 border-b-[1px] border-black ml-2"></div>
            </div>

            <div className="flex w-full space-x-3">
                <div className="flex rounded-l-[8px] rounded-r-[8px] h-[35px]">
                    <div className="flex items-center bg-[#3A3A3A] rounded-l-[8px] py-2 px-3">
                        <span className="text-white text-sm">Date</span>
                    </div>
                    <div className="relative bg-white border-b-[1px] border-t-[1px] border-[#3A3A3A] h-full flex  items-center justify-center ">
                        <DatePicker
                            selected={startDateHistory}
                            onChange={handleDateHistoryChange}
                            className="outline-none text-center text-xs 2xl:text-base w-full"
                            calendarClassName="custom-calendar"
                        />
                        <span className="absolute right-0 text-white p-2 bg-black pointer-events-none rounded-r-[5px] 2xl:rounded-r-[8px] flex items-center">
                            <MdCalendarToday />
                        </span>
                    </div>
                </div>
                <div className="flex rounded-l-[8px] rounded-r-[8px] h-[35px]">
                    <div className="flex items-center bg-[#3A3A3A] rounded-l-[8px] py-2 px-3 w-1/2">
                        <span className="text-white text-sm">
                            Transaction Type
                        </span>
                    </div>

                    <div className="bg-white border-b-[1px] border-t-[1px] border-[#3A3A3A] h-full flex items-center justify-center">
                        <select
                            name=""
                            id=""
                            className="w-full appearance-none outline-none"
                        >
                            {categories.map((item, index) => (
                                <option className="" key={index} value={item}>
                                    {" "}
                                    &nbsp;&nbsp;&nbsp;
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-white p-4 bg-black pointer-events-none rounded-r-[5px] 2xl:rounded-r-[8px] flex items-center">
                        <img
                            src={arrowCutomer}
                            alt="arrow"
                            className="size-3"
                        />
                    </div>
                </div>

                <div className="flex rounded-l-[8px] rounded-r-[8px] h-[35px]">
                    <div className="flex items-center bg-[#3A3A3A] rounded-l-[8px] py-2 px-3 w-1/2">
                        <span className="text-white text-sm">Inquiry Type</span>
                    </div>

                    <div className="bg-white border-b-[1px] border-t-[1px] border-[#3A3A3A] h-full flex items-center justify-center">
                        <select
                            name=""
                            id=""
                            className="w-full appearance-none outline-none"
                        >
                            {categories.map((item, index) => (
                                <option className="" key={index} value={item}>
                                    {" "}
                                    &nbsp;&nbsp;&nbsp;
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-white p-4 bg-black pointer-events-none rounded-r-[5px] 2xl:rounded-r-[8px] flex items-center">
                        <img
                            src={arrowCutomer}
                            alt="arrow"
                            className="size-3"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiltersProperty;
