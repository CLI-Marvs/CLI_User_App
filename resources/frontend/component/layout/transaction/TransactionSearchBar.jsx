import React, { useEffect, useRef, useState } from "react";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import DatePicker from "react-datepicker";
import { MdCalendarToday, MdRefresh } from "react-icons/md";
import moment from "moment";
import CustomToolTip from "@/component/CustomToolTip";


const TransactionSearchBar = ({
    fields,
    searchValues,
    onChangeSearch,
    onSubmit,
    setSearchValues,
    setFilters,
}) => {
    const [openSearch, setOpenSearch] = useState(false);
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
            if (setSearchValues) {
                setSearchValues({});
            }
        }
    };

    const handleRefreshPage = () => {
        setFilters({});
    };

    const renderSelect = (options, name) => {
        return (
            <select
                className="w-full h-full border-b border-opacity-30 border-custom-gray outline-none text-xs"
                name={name || ""}
                onChange={onChangeSearch}
            >
                {options.map((option, idx) => (
                    <option
                        key={idx}
                        value={option.value}
                        disabled={option.value === ""}
                        selected={option.value === ""}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        );
    };

    return (
        <div className="flex px-2 items-center gap-3">
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
                                            renderSelect(
                                                item.options,
                                                item.name
                                            )
                                        ) : item.type === "date_range" ? (
                                            <div className="relative flex border-b w-max rounded-[5px] z-10 mt-3">
                                                <span className="text-custom-bluegreen text-sm flex items-center w-max px-[15px] pl-3 py-1 shrink-0 cursor-default">
                                                    From
                                                </span>
                                                <div className="relative flex items-center bg-white">
                                                    <DatePicker
                                                        className="outline-none h-full text-sm px-2 cursor-pointer"
                                                        calendarClassName="custom-calendar"
                                                        name="start_date"
                                                        onChange={(date) => {
                                                            if (date) {
                                                                const formattedDate =
                                                                    moment(
                                                                        date
                                                                    ).format(
                                                                        "YYYY-MM-DD"
                                                                    );

                                                                setSearchValues(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        start_date:
                                                                            formattedDate,
                                                                    })
                                                                );
                                                            }
                                                        }}
                                                        selected={
                                                            searchValues.start_date
                                                                ? moment(
                                                                      searchValues.start_date
                                                                  ).toDate()
                                                                : null
                                                        }
                                                    />
                                                </div>
                                                <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-[#3A3A3A] pointer-events-none">
                                                    <MdCalendarToday />
                                                </span>

                                                <span className="text-custom-bluegreen text-sm flex items-center w-max px-[15px] pl-3 py-1 shrink-0 cursor-default">
                                                    To
                                                </span>
                                                <div className="relative flex items-center bg-white">
                                                    <DatePicker
                                                        className="outline-none h-full text-sm px-2 cursor-pointer"
                                                        calendarClassName="custom-calendar"
                                                        name="end_date"
                                                        onChange={(date) => {
                                                            if (date) {
                                                                const formattedDate =
                                                                    moment(
                                                                        date
                                                                    ).format(
                                                                        "YYYY-MM-DD"
                                                                    );

                                                                setSearchValues(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        end_date:
                                                                            formattedDate,
                                                                    })
                                                                );
                                                            }
                                                        }}
                                                        selected={
                                                            searchValues.end_date
                                                                ? moment(
                                                                      searchValues.end_date
                                                                  ).toDate()
                                                                : null
                                                        }
                                                    />
                                                </div>
                                                <img src={DateLogo} className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 pointer-events-none cursor-pointer">
                                                </img>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                className="w-full h-full border-b border-custom-gray outline-none text-xs border-opacity-30"
                                                name={item.name}
                                                onChange={onChangeSearch}
                                                value={
                                                    searchValues[item.name] ||
                                                    ""
                                                }
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            <div className="mt-7 flex justify-end">
                                <button
                                    className="h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm"
                                    onClick={() => {
                                        onSubmit();
                                        setOpenSearch(false);
                                    }}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <CustomToolTip text="Reset" position="top z-50">
                <button
                    className="  hover:bg-custom-grayF1 rounded-full text-custom-bluegreen hover:text-custom-lightblue"
                    onClick={handleRefreshPage}
                >
                    <MdRefresh className="h-6 w-6 mt-1" />
                </button>
            </CustomToolTip>

        </div>
    );
};

export default TransactionSearchBar;
