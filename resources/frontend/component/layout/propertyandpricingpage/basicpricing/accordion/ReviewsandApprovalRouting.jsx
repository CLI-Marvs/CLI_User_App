import React, { useState } from 'react'
import { IoIosArrowDown } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";


const ReviewsandApprovalRouting = ({isOpen, toggleAccordion}) => {
    //States
   

    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out
      ${
          isOpen
              ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
              : "h-[72px] px-[15px gradient-btn3 rounded-[10px] p-[1px]"
      } `}
            >
                <button
                    onClick={() => toggleAccordion("reviewsAndApproval")}
                    className={`
            ${
                isOpen
                    ? "flex justify-between items-center h-full w-full bg-white rounded-[9px] px-[15px]"
                    : "flex justify-between items-center h-full w-full bg-custom-grayFA rounded-[9px] px-[15px]"
            } `}
                >
                    <span
                        className={` text-custom-solidgreen ${
                            isOpen
                                ? "text-[20px] montserrat-semibold"
                                : "text-[18px] montserrat-regular"
                        }`}
                    >
                        Review and Approval Routing
                    </span>
                    <span
                        className={`flex justify-center items-center h-[40px] w-[40px] rounded-full  transform transition-transform duration-300 ease-in-out ${
                            isOpen
                                ? "rotate-180 bg-[#F3F7F2] text-custom-solidgreen"
                                : "rotate-0 gradient-btn2 text-white"
                        }`}
                    >
                        <IoIosArrowDown className=" text-[18px]" />
                    </span>
                </button>
            </div>
            <div
                className={`mx-5 rounded-[10px] shadow-custom5 grid overflow-hidden transition-all duration-300 ease-in-out
            ${
                isOpen
                    ? "mt-2 mb-4 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
            }
            `}
            >
                <div className=" overflow-hidden">
                    <div className="p-[20px] space-y-[10px]">
                        <div>
                            <p className="underline text-blue-500 text-sm cursor-pointer">
                                Download Excel
                            </p>
                        </div>
                        <div>
                            //TODO: Reviewed by and approved by, add plus sign,
                            when click, another select tag to show, so that can
                            select another employee
                            <iframe
                                src=""
                                frameBorder="0"
                                className="w-[814px] h-[400px] overflow-auto"
                            ></iframe>
                        </div>
                        <div className="flex flex-col gap-[10px] w-[429px]">
                            <div className="flex  items-center border border-custom-grayF1 rounded-md overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA flex w-[80%] h-[31px] pl-3 py-1">
                                    Prepared by
                                </span>
                                <input
                                    name="preparedBy"
                                    type="text"
                                    className="w-full h-[31px] px-4 focus:outline-none"
                                    placeholder=""
                                />
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[80%] h-[31px] -mr-3 pl-3 py-1">
                                    Reviewed by
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="reviewedBy"
                                        className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                    >
                                        <option value="">
                                            Firstname M. Lastname
                                        </option>
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex text-custom-gray81 items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[80%] h-[31px] -mr-3 pl-3 py-1">
                                    Approved by
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="approvedBy"
                                        className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                    >
                                        <option value="">
                                            Firstname M. Lastname
                                        </option>
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 justify-center">
                            <button className="h-[37px] w-[176px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn5 hover:shadow-custom4">
                                Submit for Approval
                            </button>
                            <button className="h-[37px] w-[117px] rounded-[10px] text-custom-solidgreen montserrat-semibold text-sm gradient-btn5 hover:shadow-custom4 p-[3px]">
                                <div className="flex justify-center items-center h-full w-full rounded-[8px] bg-white">
                                    Save as Draft
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ReviewsandApprovalRouting