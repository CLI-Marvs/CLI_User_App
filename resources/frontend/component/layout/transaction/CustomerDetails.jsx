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
import DatePicker from "react-datepicker";
import { MdCalendarToday } from "react-icons/md";
import sortDown from "../../../../../public/Images/sort_down.png";
import FilterWrapper from "../salespage/customermasterlist/FilterWrapper";
import { HiPencil } from "react-icons/hi";

const data1 = [
    {
        title: "First Name:",
        value: "Kent Jeffery",
    },
    {
        title: "Last Name:",
        value: "Armelia",
    },
    {
        title: "Country:",
        value: "Philippines",
    },
    {
        title: "City:",
        value: "Cebu",
    },
    {
        title: "Email:",
        value: "kentj@gmail.com",
    },
];

const data2 = [
    {
        title: "Phone Number:",
        value: "09661845223",
    },
    {
        title: "Birthday:",
        value: "April 30, 1998",
    },
    {
        title: "Citizenship:",
        value: "Filipino",
    },
    {
        title: "Gender:",
        value: "Male",
    },
    {
        title: "Zip Code:",
        value: "6000",
    },
];

const CustomerDetails = () => {
    const transactModalRef = useRef(null);
    const { customerDetails, setCustomerDetails } = useStateContext();

    const { id } = useParams();
    const decodedEmail = atob(id);
    const [ticketId, setTicketId] = useState("");

    const [filters, setFilters] = useState({
        transaction: false,
        inquiries: false,
        documents: false,
    });

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

    const handleTransactModalOpen = (data) => {
        setTicketId(data);
        if (transactModalRef.current) {
            transactModalRef.current.showModal();
        }
    };

    const toggleFilter = (section) => {
        setFilters((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const closeFilters = (section) => {
        setFilters((prev) => ({
            ...prev,
            [section]: false,
        }));
    };

    return (
        <>
            <div className="p-[20px]">
                <div className="flex mb-[21px] gap-[2px] items-center">
                    <Link to="/sales/customer">
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
                            <div className="flex flex-col">
                                <div className="flex gap-2.5">
                                    <span className="text-lg largeScreen:text-xl">
                                        User Info
                                    </span>
                                    <HiPencil className="h-6 w-6 cursor-pointer" />
                                </div>
                                <div className="flex gap-5 mt-2.5">
                                    <div className="flex flex-col gap-2 mb-2.5">
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
                                    <div className="flex flex-col gap-2 mr-3">
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

                            <div className="flex flex-col">
                                <div className="flex gap-2.5">
                                    <span className="text-lg largeScreen:text-xl">
                                        Spouse Info
                                    </span>
                                    <HiPencil className="h-6 w-6 cursor-pointer" />
                                </div>
                                <div className="flex gap-5 mt-2.5">
                                    <div className="flex flex-col gap-2 mb-2.5">
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
                                    <div className="flex flex-col gap-2 mr-3">
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
                        </div>
                    </div>

                    <PropertyCardTransaction />
                    {/*     <FiltersProperty /> */}

                    <div className="flex gap-5 mt-5 h-[622px]">
                        <div
                            className={`rounded-xl w-1/2 py-4 px-5 bg-custom-grayFA relative ${
                                filters.transaction ? "" : "overflow-hidden"
                            }`}
                        >
                            <div className="flex items-center space-x-1">
                                <span className="font-semibold text-base">
                                    Transaction History
                                </span>
                                <div className="flex-1 border-b-[1px] border-black ml-2"></div>
                                <div
                                    className="flex items-center bg-[#3A3A3A] rounded-full p-1.5 cursor-pointer"
                                    onClick={() => toggleFilter("transaction")}
                                >
                                    <img src={sortDown} alt="" />
                                </div>
                            </div>

                            {Array.from({ length: 5 }, (_, index) => (
                                <div
                                    className="flex flex-col gap-2.5 mt-2.5 rounded-[5px] bg-white border-[3px] border-[#F1F1F1] p-2.5"
                                    key={index}
                                >
                                    <div className="flex justify-between text-black font-semibold text-sm">
                                        <span>Equity</span>
                                        <span>Transaction#22301</span>
                                    </div>
                                    <div className="flex justify-between text-custom-gray81 text-sm">
                                        <span>Php 15,500.00</span>
                                        <span>02/13/2025</span>
                                    </div>
                                </div>
                            ))}

                            <div
                                className={`absolute left-0 w-full h-[577px] rounded-xl py-4 px-5 bg-black transition-all duration-500 ease-in-out ${
                                    filters.transaction
                                        ? "top-0 translate-y-0"
                                        : "bottom-0 translate-y-full"
                                }`}
                            >
                                {filters.transaction && (
                                    <FilterWrapper
                                        closeFilters={() =>
                                            closeFilters("transaction")
                                        }
                                        types={["Transaction"]}
                                    />
                                )}
                            </div>
                        </div>

                        <div
                            className={`rounded-xl w-1/2 py-4 px-5 bg-custom-grayFA relative ${
                                filters.inquiries ? "" : "overflow-hidden"
                            }`}
                        >
                            <div className="flex gap-2.5 items-center">
                                <span className="font-semibold text-base">
                                    Inquiries
                                </span>
                                <div className="flex-1 border-b-[1px] border-black ml-2"></div>
                                <div
                                    className="flex items-center bg-[#3A3A3A] rounded-full p-1.5 cursor-pointer"
                                    onClick={() => toggleFilter("inquiries")}
                                >
                                    <img src={sortDown} alt="" />
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
                                        <div className="flex items-center gap-2 cursor-pointer bg-custom-grayFA rounded-xl shadow-md py-3 px-3 w-full">
                                            <Skeleton
                                                width="100%"
                                                height={20}
                                            />
                                            <Skeleton
                                                width="100%"
                                                height={20}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 cursor-pointer bg-custom-grayFA rounded-xl shadow-md py-3 px-3 w-full">
                                            <Skeleton
                                                width="100%"
                                                height={20}
                                            />
                                            <Skeleton
                                                width="100%"
                                                height={20}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 cursor-pointer bg-custom-grayFA rounded-xl shadow-md py-3 px-3 w-full">
                                            <Skeleton
                                                width="100%"
                                                height={20}
                                            />
                                            <Skeleton
                                                width="100%"
                                                height={20}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div
                                className={`absolute left-0 w-full h-[577px] rounded-xl py-4 px-5 bg-black transition-all duration-500 ease-in-out ${
                                    filters.inquiries
                                        ? "top-0 translate-y-0"
                                        : "bottom-0 translate-y-full"
                                }`}
                            >
                                {filters.inquiries && (
                                    <FilterWrapper
                                        closeFilters={() =>
                                            closeFilters("inquiries")
                                        }
                                    />
                                )}
                            </div>
                        </div>
                        <div
                            className={`flex flex-col py-4 px-5 bg-[#FAFAFA] w-1/2 rounded-xl gap-2.5 relative ${
                                filters.documents ? "" : "overflow-hidden"
                            }`}
                        >
                            <div className="flex gap-2.5 items-center">
                                <span className="font-semibold text-base">
                                    Documents
                                </span>
                                <div className="flex-1 border-b-[1px] border-black ml-2"></div>
                                <div
                                    className="flex items-center bg-[#3A3A3A] rounded-full p-1.5 cursor-pointer"
                                    onClick={() => toggleFilter("documents")}
                                >
                                    <img src={sortDown} alt="" />
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

                            <div
                                className={`absolute left-0 w-full h-[577px] rounded-xl py-4 px-5 bg-black transition-all duration-500 ease-in-out ${
                                    filters.documents
                                        ? "top-0 translate-y-0"
                                        : "bottom-0 translate-y-full"
                                } z-10`}
                            >
                                {filters.documents && (
                                    <FilterWrapper
                                        closeFilters={() =>
                                            closeFilters("documents")
                                        }
                                    />
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
