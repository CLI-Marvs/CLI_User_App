import React, { useEffect, useState } from "react";
import TicketTable from "./TicketTable";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
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

    const handleFilterChange = (days) => {
        setDaysFilter(days);
        setCurrentPage(0);

    };

    return (
        <>
            <div className="h-screen max-w-full bg-custombg p-4">
                <div className="bg-custombg">
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
                                placeholder="Search Reservation"
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
                    <div className="flex items-center h-12 mt-3 px-6 gap-2 bg-white rounded-t-lg mb-1">
                        <div className="mr-4">
                            <button className="flex items-center gap-3 text-custom-bluegreen font-semibold">
                                <IoIosArrowDown /> Unresolved
                            </button>
                        </div>
                        <button
                            onClick={displayAll}
                            className="flex items-center bg-custom-lightgreen h-6 px-3 rounded-3xl"
                        >
                            <p className="text-sm text-white montserrat-semibold">
                                All
                            </p>
                        </button>
                        <button className="flex items-center border-custom-lightgreen border text-custom-lightgreen h-6 px-3 rounded-3xl">
                            <p className="text-sm montserrat-semibold">
                                Assigned to me
                            </p>
                        </button>
                        <button
                            onClick={() => handleFilterChange(3)}
                            className="flex items-center border-custom-lightgreen border text-custom-lightgreen h-6 px-3 rounded-3xl"
                        >
                            <p className="text-sm montserrat-semibold">
                                3+ Days
                            </p>
                        </button>
                        <button
                            onClick={() => handleFilterChange(2)}
                            className="flex items-center border-custom-lightgreen border text-custom-lightgreen h-6 px-3 rounded-3xl"
                        >
                            <p className="text-sm montserrat-semibold">
                                2 Days
                            </p>
                        </button>
                        <button
                            onClick={() => handleFilterChange(1)}
                            className="flex items-center border-custom-lightgreen border text-custom-lightgreen h-6 px-3 rounded-3xl"
                        >
                            <p className="text-sm montserrat-semibold">1 Day</p>
                        </button>
                        <button onClick={handleRefresh}>Refresh</button>
                    </div>
                    <div>
                        {data.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">
                                No data found
                            </p>
                        ) : (
                            <TicketTable setConcernData={data} />
                        )}
                    </div>

                    <div className="flex justify-end items-center h-12 px-6 gap-2 bg-white rounded-b-lg">
                        <p className="text-sm text-gray-400">
                            Last account activity: 0 minutes
                        </p>
                    </div>
                    <div className="flex justify-end mt-4">
                        <div className="p-4 rounded-lg">
                            <ReactPaginate
                                previousLabel={"Previous"}
                                nextLabel={"Next"}
                                breakLabel={"..."}
                                pageCount={pageCount}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={1}
                                onPageChange={handlePageClick}
                                containerClassName={"flex gap-2"}
                                previousLinkClassName={
                                    "bg-white text-custom-bluegreen font-semibold px-3 py-1 rounded-lg hover:bg-custom-bluegreen hover:text-white"
                                }
                                nextLinkClassName={
                                    "bg-white text-custom-bluegreen font-semibold px-3 py-1 rounded-lg hover:bg-custom-bluegreen hover:text-white"
                                }
                                pageLinkClassName={
                                    "bg-white text-custom-bluegreen font-semibold px-3 py-1 rounded-lg hover:bg-custom-bluegreen hover:text-white"
                                }
                                /*    activeLinkClassName={"bg-green-500 text-white"} */
                                activeLinkClassName={"bg-red-500 text-white"}
                                disabledLinkClassName={
                                    "text-gray-300 cursor-not-allowed"
                                }
                                forcePage={currentPage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InquiryList;
