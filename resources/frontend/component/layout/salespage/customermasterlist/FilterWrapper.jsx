import { IoIosCloseCircle } from "react-icons/io";
import arrowCutomer from "../../../../../../public/Images/arrowcustomer.png";
import DatePicker from "react-datepicker";
import { MdCalendarToday } from "react-icons/md";
import { useRef, useState } from "react";
import { useStateContext } from "@/context/contextprovider";
import { IoIosCheckmark } from "react-icons/io";

const TRANSACTION_TYPES = ["Equity", "Invoice", "SOA"];

const PAYMENT_CHANNELS = ["E-walltet", "Credit Card", "Installment"];

const INQUIRY_TYPES = [
    "Reservation Documents",
    "Payment Issues",
    "SOA/ Buyer's Ledger",
    "Turn Over Status",
    "Unit Status",
    "Loan Application",
    "Title and Other Registration Documents",
    "Commissions",
    "Others",
];

const STATUS = ["Unresolved", "Resolved", "Closed"];

const DynamicButton = () => {
    return (
        <div className="flex flex-col space-y-4">
            <div className="flex bg-gradient-to-r from-[#175D5F] to-[#348017] rounded-[20px] justify-center items-center shadow-lg w-[175px] px-3 py-3 h-[34px]">
                <button className="text-white">Show Results</button>
            </div>
            <div className="flex items-center justify-center border-1 border-[#348017] rounded-[20px] w-[175px] px-3 py-3 h-[34px] shadow-lg">
                <button className="text-custom-solidgreen">Clear Filter</button>
            </div>
        </div>
    );
};

const FilterWrapper = ({ closeFilters, types }) => {
    const { propertyNamesList } = useStateContext();
    const [transactionDateFrom, setTransactionDateFrom] = useState(null);
    const [transactionDateTo, setTransactionDateTo] = useState(null);
    const datepickerRefFrom = useRef(null);
    const datepickerRefTo = useRef(null);
    const [selectedFilter, setSelectedFilter] = useState({
        transactionType: [],
        transactionProperty: [],
        paymentChannel: [],
        inquiryType: [],
        propertyInquiry: [],
        status: [],
        propertyDocuments: [],
    });

    const [filterDropdown, setFilterDropdown] = useState({
        duration: false,
        property: false,
        transationType: false,
        paymentChannel: false,
        status: false,
        inquiryType: false,
    });

    const toggleFilterDropdown = (filter) => {
        setFilterDropdown((prev) => ({
            ...prev,
            [filter]: !prev[filter],
        }));
    };

    const toggleFilters = (dropDowntype, item) => {
        setSelectedFilter((prev) => ({
            ...prev,
            [dropDowntype]: prev[dropDowntype].includes(item)
                ? prev[dropDowntype].filter((i) => i !== item)
                : [...prev[dropDowntype], item],
        }));
    };

    const formatFunc = (name) => {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formattedPropertyNames = [
        "N/A",
        ...(Array.isArray(propertyNamesList) && propertyNamesList.length > 0
            ? propertyNamesList
                  .filter((item) => !item.toLowerCase().includes("phase"))
                  .map((item) => {
                      let formattedItem = formatFunc(item);

                      formattedItem = formattedItem
                          .split(" ")
                          .map((word) => {
                              if (/^(Sjmv|Lpu|Cdo|Dgt)$/i.test(word)) {
                                  return word.toUpperCase();
                              }
                              return (
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              );
                          })
                          .join(" ");

                      if (formattedItem === "Casamira South") {
                          formattedItem = "Casa Mira South";
                      }

                      return formattedItem;
                  })
                  .sort((a, b) => {
                      if (a === "N/A") return -1;
                      if (b === "N/A") return 1;
                      return a.localeCompare(b);
                  })
            : []),
    ];

    return (
        <>
            {types === "transaction" && (
                <div className="h-full flex flex-col">
                    <div
                        className="flex h-5 w-full justify-end"
                        onClick={closeFilters}
                    >
                        <div className="size-6 flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer">
                            <span className="text-xs cursor-pointer">X</span>
                        </div>
                    </div>

                    <div className="flex justify-center mb-5">
                        <span className="text-[#444444] text-lg">
                            Transaction History
                        </span>
                    </div>

                    <div className="flex flex-col justify-center items-center space-y-3">
                        <div
                            className={`bg-white w-full rounded-lg py-[8px] ${
                                filterDropdown.duration ? "space-y-6" : ""
                            }`}
                        >
                            <div className="flex flex-col cursor-pointer">
                                <div
                                    className="flex justify-between items-center px-[15px]"
                                    onClick={() =>
                                        toggleFilterDropdown("duration")
                                    }
                                >
                                    <span className="text-base text-black">
                                        Duration
                                    </span>
                                    <img
                                        src={arrowCutomer}
                                        alt=""
                                        className={`size-3 transition-transform duration-500 ${
                                            filterDropdown.duration
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {filterDropdown.duration && (
                                    <div className="flex-1 border-b-[1px] border-[#575757] mt-1"></div>
                                )}
                            </div>

                            <div
                                className={`grid transition-all duration-300 ease-in-out px-[15px] ${
                                    filterDropdown.duration
                                        ? "grid-rows-[1fr] opacity-100"
                                        : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                                {filterDropdown.duration && (
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-black text-sm">
                                                From
                                            </span>

                                            <div className="w-full h-full outline-none rounded-[4px] bg-[#FAFAFA] text-xs shadow-md relative cursor-pointer">
                                                <DatePicker
                                                    selected={
                                                        transactionDateFrom
                                                    }
                                                    onChange={(date) =>
                                                        setTransactionDateFrom(
                                                            date
                                                        )
                                                    }
                                                    dateFormat="MM-dd-yyyy"
                                                    className="w-full py-1 px-1 outline-none"
                                                    ref={datepickerRefFrom}
                                                    portalId="root-portal"
                                                />
                                                <div
                                                    className="absolute h-full px-1 right-0 flex top-0 items-center bg-custom-solidgreen rounded-[4px]"
                                                    onClick={() =>
                                                        datepickerRefFrom.current.setFocus()
                                                    }
                                                >
                                                    <MdCalendarToday className="size-4 text-white" />
                                                </div>
                                            </div>

                                            <span className="text-black text-sm">
                                                To
                                            </span>

                                            <div className="w-full h-full outline-none rounded-[4px] bg-[#FAFAFA] text-xs shadow-md relative cursor-pointer">
                                                <DatePicker
                                                    selected={transactionDateTo}
                                                    onChange={(date) =>
                                                        setTransactionDateTo(
                                                            date
                                                        )
                                                    }
                                                    dateFormat="MM-dd-yyyy"
                                                    className="w-full py-1 px-1 outline-none"
                                                    ref={datepickerRefTo}
                                                    portalId="root-portal"
                                                />
                                                <div
                                                    className="absolute h-full px-1 right-0 flex top-0 items-center bg-custom-solidgreen rounded-[4px]"
                                                    onClick={() =>
                                                        datepickerRefTo.current.setFocus()
                                                    }
                                                >
                                                    <MdCalendarToday className="size-4 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center space-y-3 mt-3">
                        <div
                            className={`bg-white w-full rounded-lg py-[8px] ${
                                filterDropdown.transationType ? "space-y-6" : ""
                            }`}
                        >
                            <div className="flex flex-col cursor-pointer">
                                <div
                                    className="flex justify-between items-center px-[15px]"
                                    onClick={() =>
                                        toggleFilterDropdown("transationType")
                                    }
                                >
                                    <div className="flex gap-1 items-center">
                                        <span className="text-base text-black">
                                            Transaction Type
                                        </span>
                                        {selectedFilter.transactionType.length >
                                            0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {
                                                        selectedFilter
                                                            .transactionType
                                                            .length
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <img
                                        src={arrowCutomer}
                                        alt=""
                                        className={`size-3 transition-transform duration-500 ${
                                            filterDropdown.transationType
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {filterDropdown.transationType && (
                                    <div className="flex-1 border-b-[1px] border-[#575757] mt-1"></div>
                                )}

                                <div
                                    className={`grid transition-all duration-300 ease-in-out px-[15px] ${
                                        filterDropdown.transationType
                                            ? "grid-rows-[1fr] opacity-100  mt-3"
                                            : "grid-rows-[0fr] opacity-0"
                                    }`}
                                >
                                    {filterDropdown.transationType && (
                                        <div className="space-y-5">
                                            <div className="flex flex-col max-h-[200px] transaction-scrollbar">
                                                {TRANSACTION_TYPES.map(
                                                    (item, index) => (
                                                        <div
                                                            className="flex justify-between"
                                                            key={index}
                                                            onClick={() =>
                                                                toggleFilters(
                                                                    "transactionType",
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    selectedFilter.transactionType.includes(
                                                                        item
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                            >
                                                                {selectedFilter.transactionType.includes(
                                                                    item
                                                                ) && (
                                                                    <IoIosCheckmark className="text-white bg-transparent" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center space-y-3 mt-3">
                        <div
                            className={`bg-white w-full rounded-lg py-[8px] ${
                                filterDropdown.property ? "space-y-6" : ""
                            }`}
                        >
                            <div className="flex flex-col cursor-pointer">
                                <div
                                    className="flex justify-between items-center px-[15px]"
                                    onClick={() =>
                                        toggleFilterDropdown("property")
                                    }
                                >
                                    <div className="flex gap-1 items-center">
                                        <span className="text-base text-black">
                                            Property
                                        </span>
                                        {selectedFilter.transactionProperty
                                            .length > 0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {
                                                        selectedFilter
                                                            .transactionProperty
                                                            .length
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <img
                                        src={arrowCutomer}
                                        alt=""
                                        className={`size-3 transition-transform duration-500 ${
                                            filterDropdown.property
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {filterDropdown.property && (
                                    <div className="flex-1 border-b-[1px] border-[#575757] mt-1"></div>
                                )}

                                <div
                                    className={`grid transition-all duration-300 ease-in-out px-[15px] ${
                                        filterDropdown.property
                                            ? "grid-rows-[1fr] opacity-100  mt-3"
                                            : "grid-rows-[0fr] opacity-0"
                                    }`}
                                >
                                    {filterDropdown.property && (
                                        <div className="space-y-5">
                                            <div className="flex flex-col max-h-[200px] transaction-scrollbar">
                                                {formattedPropertyNames.map(
                                                    (item, index) => (
                                                        <div
                                                            className="flex justify-between"
                                                            key={index}
                                                            onClick={() =>
                                                                toggleFilters(
                                                                    "transactionProperty",
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    selectedFilter.transactionProperty.includes(
                                                                        item
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                            >
                                                                {selectedFilter.transactionProperty.includes(
                                                                    item
                                                                ) && (
                                                                    <IoIosCheckmark className="text-white bg-transparent" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center space-y-3 my-3">
                        <div
                            className={`bg-white w-full rounded-lg py-[8px] ${
                                filterDropdown.paymentChannel ? "space-y-6" : ""
                            }`}
                        >
                            <div className="flex flex-col cursor-pointer">
                                <div
                                    className="flex justify-between items-center px-[15px]"
                                    onClick={() =>
                                        toggleFilterDropdown("paymentChannel")
                                    }
                                >
                                    <div className="flex gap-1 items-center">
                                        <span className="text-base text-black">
                                            Payment Channel
                                        </span>
                                        {selectedFilter.paymentChannel.length >
                                            0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {
                                                        selectedFilter
                                                            .paymentChannel
                                                            .length
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <img
                                        src={arrowCutomer}
                                        alt=""
                                        className={`size-3 transition-transform duration-500 ${
                                            filterDropdown.paymentChannel
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {filterDropdown.paymentChannel && (
                                    <div className="flex-1 border-b-[1px] border-[#575757] mt-1"></div>
                                )}

                                <div
                                    className={`grid transition-all duration-300 ease-in-out px-[15px] ${
                                        filterDropdown.paymentChannel
                                            ? "grid-rows-[1fr] opacity-100  mt-3"
                                            : "grid-rows-[0fr] opacity-0"
                                    }`}
                                >
                                    {filterDropdown.paymentChannel && (
                                        <div className="space-y-5">
                                            <div className="flex flex-col max-h-[200px] transaction-scrollbar">
                                                {PAYMENT_CHANNELS.map(
                                                    (item, index) => (
                                                        <div
                                                            className="flex justify-between"
                                                            key={index}
                                                            onClick={() =>
                                                                toggleFilters(
                                                                    "paymentChannel",
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    selectedFilter.paymentChannel.includes(
                                                                        item
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                            >
                                                                {selectedFilter.paymentChannel.includes(
                                                                    item
                                                                ) && (
                                                                    <IoIosCheckmark className="text-white bg-transparent" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-full">
                        <div className="mt-auto mb-3 flex justify-center">
                            <DynamicButton />
                        </div>
                    </div>
                </div>
            )}
            {types === "inquiries" && (
                <div className="h-full flex flex-col">
                    <div
                        className="flex h-5 w-full justify-end"
                        onClick={closeFilters}
                    >
                        <div className="size-6 flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer">
                            <span className="text-xs cursor-pointer">X</span>
                        </div>
                    </div>

                    <div className="flex justify-center mb-5">
                        <span className="text-[#444444] text-lg">
                            Inquiries
                        </span>
                    </div>

                    <div className="flex flex-col justify-center items-center space-y-3">
                        <div
                            className={`bg-white w-full rounded-lg py-[8px] ${
                                filterDropdown.duration ? "space-y-6" : ""
                            }`}
                        >
                            <div className="flex flex-col cursor-pointer">
                                <div
                                    className="flex justify-between items-center px-[15px]"
                                    onClick={() =>
                                        toggleFilterDropdown("duration")
                                    }
                                >
                                    <span className="text-base text-black">
                                        Duration
                                    </span>
                                    <img
                                        src={arrowCutomer}
                                        alt=""
                                        className={`size-3 transition-transform duration-500 ${
                                            filterDropdown.duration
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {filterDropdown.duration && (
                                    <div className="flex-1 border-b-[1px] border-[#575757] mt-1"></div>
                                )}
                            </div>

                            <div
                                className={`grid transition-all duration-300 ease-in-out px-[15px] ${
                                    filterDropdown.duration
                                        ? "grid-rows-[1fr] opacity-100"
                                        : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                                {filterDropdown.duration && (
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-black text-sm">
                                                From
                                            </span>

                                            <div className="w-full h-full outline-none rounded-[4px] bg-[#FAFAFA] text-xs shadow-md relative cursor-pointer">
                                                <DatePicker
                                                    selected={
                                                        transactionDateFrom
                                                    }
                                                    onChange={(date) =>
                                                        setTransactionDateFrom(
                                                            date
                                                        )
                                                    }
                                                    dateFormat="MM-dd-yyyy"
                                                    className="w-full py-1 px-1 outline-none"
                                                    ref={datepickerRefFrom}
                                                    portalId="root-portal"
                                                />
                                                <div
                                                    className="absolute h-full px-1 right-0 flex top-0 items-center bg-custom-solidgreen rounded-[4px]"
                                                    onClick={() =>
                                                        datepickerRefFrom.current.setFocus()
                                                    }
                                                >
                                                    <MdCalendarToday className="size-4 text-white" />
                                                </div>
                                            </div>

                                            <span className="text-black text-sm">
                                                To
                                            </span>

                                            <div className="w-full h-full outline-none rounded-[4px] bg-[#FAFAFA] text-xs shadow-md relative cursor-pointer">
                                                <DatePicker
                                                    selected={transactionDateTo}
                                                    onChange={(date) =>
                                                        setTransactionDateTo(
                                                            date
                                                        )
                                                    }
                                                    dateFormat="MM-dd-yyyy"
                                                    className="w-full py-1 px-1 outline-none"
                                                    ref={datepickerRefTo}
                                                    portalId="root-portal"
                                                />
                                                <div
                                                    className="absolute h-full px-1 right-0 flex top-0 items-center bg-custom-solidgreen rounded-[4px]"
                                                    onClick={() =>
                                                        datepickerRefTo.current.setFocus()
                                                    }
                                                >
                                                    <MdCalendarToday className="size-4 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center space-y-3 mt-3">
                        <div
                            className={`bg-white w-full rounded-lg py-[8px] ${
                                filterDropdown.inquiryType ? "space-y-6" : ""
                            }`}
                        >
                            <div className="flex flex-col cursor-pointer">
                                <div
                                    className="flex justify-between items-center px-[15px]"
                                    onClick={() =>
                                        toggleFilterDropdown("inquiryType")
                                    }
                                >
                                    <div className="flex gap-1 items-center">
                                        <span className="text-base text-black">
                                            Inquiry Type
                                        </span>
                                        {selectedFilter.inquiryType.length >
                                            0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {
                                                        selectedFilter
                                                            .inquiryType.length
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <img
                                        src={arrowCutomer}
                                        alt=""
                                        className={`size-3 transition-transform duration-500 ${
                                            filterDropdown.inquirtyType
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {filterDropdown.inquiryType && (
                                    <div className="flex-1 border-b-[1px] border-[#575757] mt-1"></div>
                                )}

                                <div
                                    className={`grid transition-all duration-300 ease-in-out px-[15px] ${
                                        filterDropdown.inquiryType
                                            ? "grid-rows-[1fr] opacity-100  mt-3"
                                            : "grid-rows-[0fr] opacity-0"
                                    }`}
                                >
                                    {filterDropdown.inquiryType && (
                                        <div className="space-y-5">
                                            <div className="flex flex-col max-h-[200px] transaction-scrollbar">
                                                {INQUIRY_TYPES.map(
                                                    (item, index) => (
                                                        <div
                                                            className="flex justify-between"
                                                            key={index}
                                                            onClick={() =>
                                                                toggleFilters(
                                                                    "inquiryType",
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    selectedFilter.inquiryType.includes(
                                                                        item
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                            >
                                                                {selectedFilter.inquiryType.includes(
                                                                    item
                                                                ) && (
                                                                    <IoIosCheckmark className="text-white bg-transparent" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center space-y-3 mt-3">
                        <div
                            className={`bg-white w-full rounded-lg py-[8px] ${
                                filterDropdown.property ? "space-y-6" : ""
                            }`}
                        >
                            <div className="flex flex-col cursor-pointer">
                                <div
                                    className="flex justify-between items-center px-[15px]"
                                    onClick={() =>
                                        toggleFilterDropdown("property")
                                    }
                                >
                                    <div className="flex gap-1 items-center">
                                        <span className="text-base text-black">
                                            Property
                                        </span>
                                        {selectedFilter.propertyInquiry.length >
                                            0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {
                                                        selectedFilter
                                                            .propertyInquiry
                                                            .length
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <img
                                        src={arrowCutomer}
                                        alt=""
                                        className={`size-3 transition-transform duration-500 ${
                                            filterDropdown.property
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {filterDropdown.property && (
                                    <div className="flex-1 border-b-[1px] border-[#575757] mt-1"></div>
                                )}

                                <div
                                    className={`grid transition-all duration-300 ease-in-out px-[15px] ${
                                        filterDropdown.property
                                            ? "grid-rows-[1fr] opacity-100  mt-3"
                                            : "grid-rows-[0fr] opacity-0"
                                    }`}
                                >
                                    {filterDropdown.property && (
                                        <div className="space-y-5">
                                            <div className="flex flex-col max-h-[200px] transaction-scrollbar">
                                                {formattedPropertyNames.map(
                                                    (item, index) => (
                                                        <div
                                                            className="flex justify-between"
                                                            key={index}
                                                            onClick={() =>
                                                                toggleFilters(
                                                                    "propertyInquiry",
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    selectedFilter.propertyInquiry.includes(
                                                                        item
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                            >
                                                                {selectedFilter.propertyInquiry.includes(
                                                                    item
                                                                ) && (
                                                                    <IoIosCheckmark className="text-white bg-transparent" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center space-y-3 my-3">
                        <div
                            className={`bg-white w-full rounded-lg py-[8px] ${
                                filterDropdown.paymentChannel ? "space-y-6" : ""
                            }`}
                        >
                            <div className="flex flex-col cursor-pointer">
                                <div
                                    className="flex justify-between items-center px-[15px]"
                                    onClick={() =>
                                        toggleFilterDropdown("status")
                                    }
                                >
                                    <div className="flex gap-1 items-center">
                                        <span className="text-base text-black">
                                            Status
                                        </span>
                                        {selectedFilter.status.length > 0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {
                                                        selectedFilter.status
                                                            .length
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <img
                                        src={arrowCutomer}
                                        alt=""
                                        className={`size-3 transition-transform duration-500 ${
                                            filterDropdown.status
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {filterDropdown.status && (
                                    <div className="flex-1 border-b-[1px] border-[#575757] mt-1"></div>
                                )}

                                <div
                                    className={`grid transition-all duration-300 ease-in-out px-[15px] ${
                                        filterDropdown.status
                                            ? "grid-rows-[1fr] opacity-100  mt-3"
                                            : "grid-rows-[0fr] opacity-0"
                                    }`}
                                >
                                    {filterDropdown.status && (
                                        <div className="space-y-5">
                                            <div className="flex flex-col max-h-[200px] transaction-scrollbar">
                                                {STATUS.map((item, index) => (
                                                    <div
                                                        className="flex justify-between"
                                                        key={index}
                                                        onClick={() =>
                                                            toggleFilters(
                                                                "status",
                                                                item
                                                            )
                                                        }
                                                    >
                                                        <span className="text-black">
                                                            {item}
                                                        </span>
                                                        <div
                                                            className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                selectedFilter.status.includes(
                                                                    item
                                                                )
                                                                    ? "bg-custom-lightgreen border-none"
                                                                    : "border-black"
                                                            }`}
                                                        >
                                                            {selectedFilter.status.includes(
                                                                "status",
                                                                item
                                                            ) && (
                                                                <IoIosCheckmark className="text-white bg-transparent" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-full">
                        <div className="mt-auto mb-3 flex justify-center items-end">
                            <DynamicButton />
                        </div>
                    </div>
                </div>
            )}
            {types === "documents" && (
                <div className="h-full flex flex-col">
                    <div
                        className="flex h-5 w-full justify-end"
                        onClick={closeFilters}
                    >
                        <div className="size-6 flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer">
                            <span className="text-xs cursor-pointer">X</span>
                        </div>
                    </div>

                    <div className="flex justify-center mb-5">
                        <span className="text-[#444444] text-lg">
                            Documents
                        </span>
                    </div>

                    <div
                        className={`bg-white w-full rounded-lg py-[8px] ${
                            filterDropdown.property ? "space-y-6" : ""
                        }`}
                    >
                        <div className="flex flex-col cursor-pointer">
                            <div
                                className="flex justify-between items-center px-[15px]"
                                onClick={() => toggleFilterDropdown("property")}
                            >
                                <div className="flex gap-1 items-center">
                                    <span className="text-base text-black">
                                        Property
                                    </span>
                                    {selectedFilter.propertyDocuments.length >
                                        0 && (
                                        <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                            <span className="text-white">
                                                {
                                                    selectedFilter
                                                        .propertyDocuments
                                                        .length
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <img
                                    src={arrowCutomer}
                                    alt=""
                                    className={`size-3 transition-transform duration-500 ${
                                        filterDropdown.property
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                />
                            </div>
                            {filterDropdown.property && (
                                <div className="flex-1 border-b-[1px] border-[#575757] mt-1"></div>
                            )}

                            <div
                                className={`grid transition-all duration-300 ease-in-out px-[15px] ${
                                    filterDropdown.property
                                        ? "grid-rows-[1fr] opacity-100  mt-3"
                                        : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                                {filterDropdown.property && (
                                    <div className="space-y-5">
                                        <div className="flex flex-col max-h-[200px] transaction-scrollbar">
                                            {formattedPropertyNames.map(
                                                (item, index) => (
                                                    <div
                                                        className="flex justify-between"
                                                        key={index}
                                                        onClick={() =>
                                                            toggleFilters(
                                                                "propertyDocuments",
                                                                item
                                                            )
                                                        }
                                                    >
                                                        <span className="text-black">
                                                            {item}
                                                        </span>
                                                        <div
                                                            className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                selectedFilter.propertyDocuments.includes(
                                                                    item
                                                                )
                                                                    ? "bg-custom-lightgreen border-none"
                                                                    : "border-black"
                                                            }`}
                                                        >
                                                            {selectedFilter.propertyDocuments.includes(
                                                                item
                                                            ) && (
                                                                <IoIosCheckmark className="text-white bg-transparent" />
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-full">
                        <div className="mt-auto mb-3 flex justify-center items-end">
                            <DynamicButton />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FilterWrapper;
