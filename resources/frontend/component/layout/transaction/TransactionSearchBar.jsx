import React, { useEffect, useRef, useState } from "react";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import DatePicker from "react-datepicker";

const TransactionSearchBar = ({ fields }) => {
    const [openSearch, setOpenSearch] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleOutsideClick = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setOpenSearch(false);
        }
    };

    const handleDateChange = (date) => {
        setStartDate(date);
    };

    const renderSelect = (options) => (
        <select className="w-full h-full border-b border-opacity-30 border-custom-gray outline-none text-xs">
            {options.map((option, idx) => (
                <option key={idx} value={option.value} disabled={option.value === ""} selected={option.value === ""}>
                    {option.label}
                </option>
            ))}
        </select>
    );
    

    return (
        <div className="bg-custom-grayF1 rounded-[10px] p-[12px] w-[604px] h-[47px]  relative z-50">
            <div className="" ref={dropdownRef}>
                <div
                    className="flex justify-between cursor-pointer"
                    onClick={() => setOpenSearch((prev) => !prev)}
                >
                    <div className="flex items-center gap-[12px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-4 text-gray-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            />
                        </svg>
                        <span className="text-[16px] font-normal text-[#A5A5A599]">
                            Search
                        </span>
                    </div>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-[24px] text-custom-bluegreen hover:bg-gray-200 cursor-pointer"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                        />
                    </svg>
                </div>
                {openSearch && (
                    <div className="absolute right-0 left-0 bg-white border border-gray-300 mt-[10px] w-[604px] h-auto rounded-lg py-5 px-5">
                        {fields.map((item, index) => {
                            return (
                                <div
                                    className="flex gap-[10px] items-center"
                                    key={index}
                                >
                                    <span className="text-xs text-custom-bluegreen leading-7 w-1/4">
                                        {item.label}
                                    </span>

                                    {item.type === "select" ? (
                                        renderSelect(item.options || [])
                                    ) : item.type === "date" ? (
                                        <DatePicker
                                           /*  selected={startDate}
                                            onChange={handleDateChange} */
                                            className="outline-none "
                                            calendarClassName="custom-calendar"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full h-full border-b border-custom-gray outline-none text-xs border-opacity-30"
                                        />
                                    )}
                                </div>
                            );
                        })}
                        {/* <div className="flex w-full items-center gap-[12px]">
                            <div className="flex flex-row w-1/4">
                                <span className="w-full text-xs text-custom-bluegreen leading-7">
                                    {" "}
                                    Date of birth{" "}
                                </span>
                            </div>

                            <div className="w-1/3">
                                <div className="relative w-full border-b border-opacity-30 border-custom-gray outline-none text-xs">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={handleDateChange}
                                        className="outline-none "
                                        calendarClassName="custom-calendar"
                                    />
                                    <img
                                        src={DateLogo}
                                        alt=""
                                        className="absolute right-0 transform -translate-y-1/2 top-[45%]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center w-2/3">
                                <span className="text-xs text-custom-bluegreen leading-7">
                                    {" "}
                                    Gender{" "}
                                </span>
                                <select
                                    name=""
                                    id=""
                                    className="w-full border-b border-opacity-30 border-custom-gray outline-none text-xs"
                                >
                                    <option value="">test</option>
                                </select>
                            </div>
                        </div> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionSearchBar;
