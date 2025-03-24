import React from "react";

const SearchFilter = () => {
    return (
        <div className="relative flex justify-start gap-3 mt-3  ">
            <div className="relative w-[582px]">
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
                    className="h-10 w-full rounded-lg pl-9 pr-6 text-sm border"
                    placeholder="Search"
                />
                <svg
                    onClick={toggleFilterBox}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-[24px] absolute right-3 top-2 text-custom-bluegreen hover:size-[26px]"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                    />
                </svg>
            </div>
            <div className="ml-4 flex justify-center items-center">
                <CustomToolTip text="Refresh page" position="top">
                    <button
                        className="  hover:bg-custom-grayF1 rounded-full text-custom-bluegreen hover:text-custom-lightblue"
                        onClick={handleRefreshPage}
                    >
                        <MdRefresh className="h-6 w-6 mt-1" />
                    </button>
                </CustomToolTip>
            </div>

            {isFilterVisible && (
                <div
                    className="absolute left-0 mt-12 p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[582px]"
                    ref={dropdownRef}
                >
                    <div className="flex flex-col gap-2">
                        <div className="flex">
                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                {" "}
                                Property
                            </label>
                            <CustomInput
                                type="text"
                                name="property"
                                value={searchFilters.property || ""}
                                className="w-full  border-b-1 outline-none ml-2"
                                onChange={onInputChange}
                            />
                        </div>
                        <div className="flex">
                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                {" "}
                                Payment Scheme
                            </label>
                            <CustomInput
                                type="text"
                                name="paymentScheme"
                                value={searchFilters.paymentScheme || ""}
                                className="w-full  border-b-1 outline-none ml-2"
                                onChange={onInputChange}
                            />
                        </div>
               
                        <div className="flex gap-3">
                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                Date
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={
                                        searchFilters.date
                                            ? searchFilters.date
                                            : null
                                    }
                                    onChange={(date) => handleDateChange(date)}
                                    className=" border-b-1 outline-none w-[176px]"
                                    calendarClassName="custom-calendar"
                                />

                                <img
                                    src={DateLogo}
                                    alt="date"
                                    className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6"
                                />
                            </div>
                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                {" "}
                                Status
                            </label>
                            <select
                                className="w-full border-b-1 outline-none px-[5px]"
                                name="status"
                                value={searchFilters.status || ""}
                                onChange={onInputChange}
                            >
                                <option value="">Select Status</option>
                                <option value="Draft">Draft</option>
                                <option value="On-going Approval">
                                    On-going Approval
                                </option>
                                <option value="Approved not Live">
                                    Approved not Live
                                </option>
                                <option value="Approved and Live">
                                    Approved and Live
                                </option>
                            </select>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button
                                disabled={isButtonDisabled(searchFilters)}
                                className={`h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm ${
                                    isButtonDisabled(searchFilters)
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilter;
