import React, { useEffect, useRef, useState } from "react";
import Backbtn from "../../../../../public/Images/Expand_up.svg";

import SearchBar from "@/component/layout/transaction/SearchBar";
import profile from "../../../../../public/Images/AdminSilouette.svg";
import { Link, useLocation, useParams } from "react-router-dom";
import PreviewMessageModal from "@/component/layout/transaction/PreviewMessageModal";
import { useStateContext } from "@/context/contextprovider";
import { data } from "@/component/servicesApi/apiCalls/transactions/customer";
import Skeleton from "react-loading-skeleton";
import PropertyCardTransaction from "@/component/layout/transaction/PropertyCardTransaction";
import FiltersProperty from "@/component/layout/transaction/FiltersProperty";

const CustomerDetails = () => {
    const transactModalRef = useRef(null);
    const { customerDetails, setCustomerDetails } = useStateContext();
    const [startDate, setStartDate] = useState(new Date());

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
            value: "Medical Practioner",
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
                <div className="flex flex-col bg-custom-grayF1 mt-[21px] p-[20px] largeScreen:p-[30px] mediumScrren:p-[30px] rounded-xl">
                    <div className="p-5 flex flex-col bg-custom-grayFA rounded-xl">
                        <div className="px-1 flex items-center">
                            <div className="m-2.5">
                                <img
                                    src={profile}
                                    alt=""
                                    className="w-[50x] h-[50px]"
                                />
                            </div>
                            <span className="text-2xl text-[#175D5F]">
                                {buyer_name}
                            </span>
                        </div>

                        <div className="px-5 flex gap-10 w-full text-xs font-semibold rounded-xl mt-2">
                            <div className="flex flex-col w-2/3">
                                <span className="text-lg largeScreen:text-xl">
                                    User Info
                                </span>
                                <div className="flex gap-5 mt-2.5">
                                    <div className="w-1/2 flex flex-col gap-2 mb-2.5">
                                        {data1.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="">
                                                    {item.title}
                                                </span>
                                                <span className=" text-[#818181]">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-1/2 flex flex-col gap-2 mr-3">
                                        {data2.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="">
                                                    {item.title}
                                                </span>
                                                <span className=" text-[#818181] break-all">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-auto">
                                <hr className=" border-1 border-[#3A3A3A]  h-[150px] w-0" />
                            </div>

                            <div className="flex flex-col w-2/3">
                                <span className="text-lg">Source of Funds</span>
                                <div className="flex gap-5 mt-2.5">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-base text-custom-solidgreen">
                                            Source
                                        </span>
                                        <span className="text-sm text-custom-gray81">
                                            Employed
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-base text-custom-solidgreen">
                                            Details
                                        </span>
                                        <span className="text-sm text-custom-gray81">
                                            Accenture Middle Manager
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-base text-custom-solidgreen">
                                            Monthly Income
                                        </span>
                                        <span className="text-sm text-custom-gray81">
                                            ₱80,000 - ₱99,999
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <PropertyCardTransaction />
                    <FiltersProperty />
                    <div className="flex gap-5 mt-5">
                        <div className="py-4 px-5 bg-custom-grayFA rounded-xl w-1/2">
                            <div className="flex items-center">
                                <span className="font-semibold text-base">
                                    Transaction History
                                </span>
                                <div className="flex-1 border-b-[1px] border-black ml-2"></div>
                            </div>

                        {/*     <div className="flex justify-center mb-3">
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
                            </div> */}
                             <div className="flex justify-center mb-3">
                                    <div className="flex justify-between outline-none text-xs w-full">
                                        <span className="text-white bg-black p-2 flex text-center items-center text-xs 2xl:text-base rounded-l-[5px] 2xl:rounded-l-[8px] h-full">
                                            Year
                                        </span>
                                        <div className="bg-white border-b-[1px] border-t-[1px] border-[#3A3A3A] h-full w-full flex flex-1 items-center justify-center">
                                            <DatePicker
                                                selected={startDateHistory}
                                                onChange={handleDateHistoryChange}
                                                className="outline-none text-center text-xs 2xl:text-base w-full"
                                                calendarClassName="custom-calendar"
                                                sx={{ width: '100%' }} 
                                            />
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
                        <div className="flex flex-col py-4 px-5 bg-[#FAFAFA] w-1/2 rounded-xl gap-2.5 h-[507px]">
                            <div className="flex gap-2.5 items-center">
                                <span className="font-semibold text-base">
                                    Documents
                                </span>
                                <div className="flex justify-center w-full">
                                    <div className="border-b-[1px] border-black w-full"></div>
                                </div>
                            </div>

                            <div className="flex bg-[#FFFFFF] w-full shadow-sm p-2.5 rounded-xl">
                                <span className="text-xs 2xl:text-base text-custom-solidgreen font-normal">
                                    Valid ID
                                </span>
                            </div>
                            <div className="flex bg-[#FFFFFF] w-full shadow-sm p-2.5 rounded-xl">
                                <span className="text-xs 2xl:text-base text-custom-solidgreen font-normal">
                                    Birth Certificate
                                </span>
                            </div>
                            <div className="flex bg-[#FFFFFF] w-full shadow-sm p-2.5 rounded-xl">
                                <span className="text-xs 2xl:text-base text-custom-solidgreen font-normal">
                                    Spouse - Birth Certificate
                                </span>
                            </div>
                            <div className="flex bg-[#FFFFFF] w-full shadow-sm p-2.5 rounded-xl">
                                <span className="text-xs 2xl:text-base text-custom-solidgreen font-normal">
                                    Marriage Certificate
                                </span>
                            </div>
                        </div>
                        <div className="py-4 px-5 bg-custom-grayFA rounded-xl w-1/2">
                            <div className="flex gap-2.5 items-center">
                                <span className="font-semibold text-base">
                                    Inquiries
                                </span>
                                <div className="flex justify-center w-full">
                                    <div className="border-b-[1px] border-black w-full"></div>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-2 mb-2.5">
                                {indexData.length > 0 ? (
                                    indexData.map((item, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className="gap-2 cursor-pointer bg-custom-grayFA rounded-xl shadow-md py-3 px-3"
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
                                                    - {item.property}
                                                    {item.unit_number
                                                        ? `,${item.unit_number}`
                                                        : ""}
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
