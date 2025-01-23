import React, { useEffect, useRef, useState } from "react";
import Backbtn from "../../../../../public/Images/Expand_up.svg";

import SearchBar from "@/component/layout/transaction/SearchBar";
import profile from "../../../../../public/Images/AdminSilouette.svg";
import { MdCalendarToday } from "react-icons/md";
import { Link, useLocation, useParams } from "react-router-dom";
import PreviewMessageModal from "@/component/layout/transaction/PreviewMessageModal";
import { useStateContext } from "@/context/contextprovider";
import { data } from "@/component/servicesApi/apiCalls/transactions/customer";
import Skeleton from "react-loading-skeleton";
import DatePicker from "react-datepicker";
import arrowCutomer from "../../../../../public/Images/arrowcustomer.png";


const CustomerDetails = () => {
    const transactModalRef = useRef(null);
    const { customerDetails, setCustomerDetails } = useStateContext();
    const [startDate, setStartDate] = useState(null);

    const { id } = useParams();
    const decodedEmail = atob(id);

    const [ticketId, setTicketId] = useState("");
    const fetchCustomerDetails = async () => {
        const response = await data.getCustomerByDetails(decodedEmail);

        setCustomerDetails((prev) => ({
            ...prev,
            [decodedEmail]: response,
        }));
    };

    const indexData = customerDetails[decodedEmail] || {};

    const { buyer_name, ticket_id } = indexData[0] || {};

    useEffect(() => {
        fetchCustomerDetails();
    }, []);

    const handleDateChange = (date) => {
        setStartDate(date);
    };
    const handleTransactModalOpen = (data) => {
        setTicketId(data);
        if (transactModalRef.current) {
            transactModalRef.current.showModal();
        }
    };

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

    const data1 = [
        {
            title: "Title:",
            value: "Ms.",
        },
        {
            title: "Contract Number:",
            value: "1000000001",
        },
        {
            title: "Business Partner:",
            value: "1000000001",
        },
        {
            title: "Partner Category:",
            value: "Person",
        },
        {
            title: "Nationality",
            value: "PH",
        },
    ];

    const data2 = [
        {
            title: "Marital Status:",
            value: "Single",
        },
        {
            title: "Occupation:",
            value: "Medical Practitioner",
        },
        {
            title: "Date of Birth:",
            value: "Febuary 27, 2001",
        },
        {
            title: "Employeer:",
            value: "Jace Garv",
        },
        {
            title: "Created On:",
            value: "January 10, 2012",
        },
    ];

    const years = Array.from({ length: 2025 - 2012 + 1 }, (_, i) => 2012 + i);

    return (
        <>
            <div className="w-auto h-auto p-[20px]">
                <div className="flex mb-[21px] gap-[2px] items-center">
                    <Link to="/transaction/customer">
                        <img
                            src={Backbtn}
                            alt="back button"
                            /* onClick={handleBack} */
                            className="hover:bg-gray-100 rounded-full cursor-pointer"
                        />
                    </Link>
                    <span className="text-[#3A3A3A] text-[20px]">
                        Customer Masterlist
                    </span>
                </div>

                <div className="border-b-[1px] border-[#D6E4D1] w-full mb-[21px]"></div>
                <SearchBar />
                <div className="flex flex-col bg-custom-grayF1 mt-[21px] p-[5px] largeScreen:p-[20px] mediumScrren:p-[20px] rounded-xl">
                    <div className="p-5">
                        <div className="m-2.5">
                            <img src={profile} alt="" className="size-10" />
                        </div>
                        <span className="text-2xl text-[#175D5F]">
                            {buyer_name}
                        </span>

                        <div className="flex bg-custom-grayFA px-5 py-5 w-full text-xs font-semibold rounded-xl mt-2">
                            <div className="flex flex-col w-56 h-24 gap-2 mb-2.5">
                                {data1.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="">{item.title}</span>
                                        <span className=" text-[#818181]">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col w-56 h-24 gap-2">
                                {data2.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="">{item.title}</span>
                                        <span className=" text-[#818181]">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-5 p-5">
                        <div className="py-4 px-5 bg-custom-grayFA w-1/3 largeScreen:w-1/3 mediumScrren:w-1/4 rounded-xl">
                            <div className="flex gap-2.5 items-center mb-5">
                                <span className="font-semibold text-base">
                                    Equities
                                </span>
                                <div className="flex justify-center w-full">
                                    <div className="border-b-[1px] border-black w-full"></div>
                                </div>
                            </div>

                            <div className="flex justify-center mb-3">
                                <div className="flex justify-between outline-none text-xs w-full">
                                    <span className="text-white bg-black p-2 flex text-center items-center text-xs 2xl:text-base rounded-l-[5px] 2xl:rounded-l-[8px] h-full">
                                        Year
                                    </span>
                                    <div className="bg-white flex border-b-[1px] border-t-[1px] border-[#3A3A3A] h-full items-center justify-center w-full">
                                        <select className="appearance-none px-4 py-1 bg-white focus:outline-none border-0 h-full text-xs 2xl:text-base">
                                            {years.map((item, index) => (
                                                <option
                                                    className="text-center"
                                                    key={index}
                                                    value={item}
                                                >
                                                    {" "}
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <span className="text-white p-2 2xl:p-5 h-full bg-black pointer-events-none rounded-r-[5px] 2xl:rounded-r-[8px]">
                                        <MdCalendarToday />
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5 mt-2.5">
                                {[...Array(12)].map((_, index) => (
                                    <div
                                        className="shadow-md bg-white rounded-[5px] p-2.5 cursor-pointer"
                                        key={index}
                                    >
                                        <span className="text-xs underline text-[#1A73E8]">
                                            December 15, 2024
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="py-4 px-5 bg-custom-grayFA w-2/3 rounded-xl">
                            <div className="flex gap-2.5 items-center">
                                <span className="font-semibold text-base">
                                    Inquiries
                                </span>
                                <div className="flex justify-center w-full">
                                    <div className="border-b-[1px] border-black w-full"></div>
                                </div>
                            </div>

                            <div className="flex justify-between gap-3 mt-5 mb-3">
                                <div className="flex justify-center mb-3 w-1/2">
                                    <div className="flex justify-between outline-none text-xs w-full">
                                        <span className="text-white bg-black p-2 flex text-center items-center text-xs 2xl:text-base rounded-l-[5px] 2xl:rounded-l-[8px] h-full">
                                            Year
                                        </span>
                                        <div className="bg-white border-b-[1px] border-t-[1px] border-[#3A3A3A] h-full flex items-center justify-center w-full">
                                            <DatePicker
                                                selected={startDate}
                                                onChange={handleDateChange}
                                                className="outline-none text-center text-xs 2xl:text-base w-[100px]"
                                                calendarClassName="custom-calendar"
                                            />
                                        </div>

                                        <span className="text-white p-2 2xl:p-5 h-full bg-black pointer-events-none rounded-r-[5px] 2xl:rounded-r-[8px]">
                                            <MdCalendarToday />
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-center mb-3 w-1/2">
                                    <div className="flex justify-between outline-none text-xs w-full">
                                        <span className="text-white bg-black p-2 flex text-center items-center text-xs 2xl:text-base rounded-l-[5px] 2xl:rounded-l-[8px] h-full">
                                            Inquiry
                                        </span>
                                        <div className="bg-white border-b-[1px] border-t-[1px] border-[#3A3A3A] h-full flex items-center justify-center w-full">
                                            <select
                                                name=""
                                                id=""
                                                className="w-full appearance-none outline-none"
                                            >
                                                {categories.map(
                                                    (item, index) => (
                                                        <option
                                                            className=""
                                                            key={index}
                                                            value={item}
                                                        >
                                                            {" "}
                                                            &nbsp;&nbsp;&nbsp;{item}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div className="flex w-[40px] p-2 2xl:p-5 bg-black pointer-events-none rounded-r-[5px] 2xl:rounded-r-[8px] justify-center items-center">
                                            <img
                                                src={arrowCutomer}
                                                alt="arrow"
                                                className="w-[10px] h-[10px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*  <div className="flex flex-wrap mt-5 mb-5">
                                {years.map((year, index) => {
                                    const isActive = index === 13;
                                    return (
                                        <div
                                            key={year}
                                            className={`flex items-center w-[40px] h-[25px] rounded-[5px] px-2 py-2 shadow-md m-1 cursor-pointer ${
                                                isActive
                                                    ? "bg-[#3A3A3A]"
                                                    : "bg-custom-grayFA"
                                            }`}
                                        >
                                            <span
                                                className={`text-xs  font-semibold ${
                                                    isActive
                                                        ? "text-white"
                                                        : "text-black"
                                                }`}
                                            >
                                                {year}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div> */}

                            <div className="flex flex-col w-full gap-2 mb-2.5">
                                {indexData.length > 0 ? (
                                    indexData.map((item, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 cursor-pointer bg-custom-grayFA rounded-xl shadow-md py-3 px-3"
                                            >
                                                <span
                                                    className="text-custom-solidgreen text-xs 2xl:text-base underline font-normal"
                                                    onClick={() =>
                                                        handleTransactModalOpen(
                                                            item.ticket_id
                                                        )
                                                    }
                                                >
                                                    {item.details_concern} 
                                                </span>
                                                <span className=" text-[#818181] text-xs 2xl:text-base">
                                                    - {item.property}, {item.unit_number || ""} 
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 cursor-pointer bg-custom-grayFA rounded-xl shadow-md py-3 px-3">
                                            <Skeleton width={200} height={20} />
                                            <Skeleton width={150} height={20} />
                                        </div>
                                        <div className="flex items-center gap-2 cursor-pointer bg-custom-grayFA rounded-xl shadow-md py-3 px-3">
                                            <Skeleton width={200} height={20} />
                                            <Skeleton width={150} height={20} />
                                        </div>
                                        <div className="flex items-center gap-2 cursor-pointer bg-custom-grayFA rounded-xl shadow-md py-3 px-3">
                                            <Skeleton width={200} height={20} />
                                            <Skeleton width={150} height={20} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col py-4 px-5 bg-[#FAFAFA] w-1/3 2xl:w-2/3 largeScreen:w-2/3 mediumScrren:w-1/2 rounded-xl gap-2.5 h-[507px]">
                            <div className="flex gap-2.5 items-center">
                                <span className="font-semibold text-base">
                                    Properties
                                </span>
                                <div className="flex justify-center w-full">
                                    <div className="border-b-[1px] border-black w-full"></div>
                                </div>
                            </div>

                            <div className="flex bg-[#FFFFFF] w-full shadow-sm p-2.5 rounded-xl">
                                <span className="text-xs 2xl:text-base text-custom-solidgreen font-normal">
                                    Asia Premier Residences
                                </span>
                            </div>
                            <div className="flex bg-[#FFFFFF] w-full shadow-sm p-2.5 rounded-xl">
                                <span className="text-xs 2xl:text-base text-custom-solidgreen font-normal">
                                    Casa Mira Towers - Labangon
                                </span>
                            </div>
                            <div className="flex bg-[#FFFFFF] w-full shadow-sm p-2.5 rounded-xl">
                                <span className="text-xs 2xl:text-base text-custom-solidgreen font-normal">
                                    Casa Mira Towers - Guadalupe
                                </span>
                            </div>
                            <div className="flex bg-[#FFFFFF] w-full shadow-sm p-2.5 rounded-xl">
                                <span className="text-xs 2xl:text-base text-custom-solidgreen font-normal">
                                    Guadalupe Habitat at Pinamalayan Phase 2
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <PreviewMessageModal
                    transactModalRef={transactModalRef}
                    ticketId={ticketId}
                    setTicketId={setTicketId}
                />
            </div>
        </>
    );
};

export default CustomerDetails;
