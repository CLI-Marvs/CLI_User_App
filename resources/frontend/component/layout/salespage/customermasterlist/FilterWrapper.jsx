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

const FilterWrapper = ({ closeFilters, types }) => {
    const { propertyNamesList } = useStateContext();
    const [selectedProperty, setSelectedProperty] = useState([]);
    const [transactionType, setTransactionType] = useState([]);
    const [transactionDateFrom, setTransactionDateFrom] = useState(null);
    const [transactionDateTo, setTransactionDateTo] = useState(null);
    const [paymentChannel, setPaymentChannel] = useState([]);
    const [status, setStatus] = useState([]);
    const [inquiryType, setInquiryType] = useState([]);

    const datepickerRefFrom = useRef(null);
    const datepickerRefTo = useRef(null);

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

    const toggleProperty = (item) => {
        setSelectedProperty((prevSelected) =>
            prevSelected.includes(item)
                ? prevSelected.filter((i) => i !== item)
                : [...prevSelected, item]
        );
    };

    const toggleTransactionType = (item) => {
        setTransactionType((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        );
    };

    const toggleInquiryType = (item) => {
        setInquiryType((prev) => 
            prev.includes(item)
            ? prev.filter((i) => i !== item)
            : [...prev, item]
        );
    };

    const tooglePaymentChannel = (index) => {
        setPaymentChannel((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    const toggleStatus = (index) => {
        setStatus((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
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

    console.log("transactionType", transactionType);
    return (
        <>
            {types === "transaction" && (
                <>
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
                                        {transactionType.length > 0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {transactionType.length}
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
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    transactionType.includes(
                                                                        item
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                                onClick={() =>
                                                                    toggleTransactionType(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                {transactionType.includes(
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
                                        {selectedProperty.length > 0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {selectedProperty.length}
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
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    selectedProperty.includes(
                                                                        item
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                                onClick={() =>
                                                                    toggleProperty(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                {selectedProperty.includes(
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
                                        {paymentChannel.length > 0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {paymentChannel.length}
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
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    paymentChannel.includes(
                                                                        index
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                                onClick={() =>
                                                                    tooglePaymentChannel(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                {paymentChannel.includes(
                                                                    index
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
                </>
            )}
            {types === "inquiries" && (
                <>
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
                                        {inquiryType.length > 0 && (
                                            <div className="bg-black rounded-full h-5 w-5 text-xs flex items-center text-center justify-center">
                                                <span className="text-white">
                                                    {inquiryType.length}
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
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    inquiryType.includes(
                                                                        item
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                                onClick={() =>
                                                                    toggleInquiryType(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                {inquiryType.includes(
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
                                    <span className="text-base text-black">
                                        Property
                                    </span>
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
                                                        >
                                                            <span className="text-black">
                                                                {item}
                                                            </span>
                                                            <div
                                                                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                    selectedProperty.includes(
                                                                        item
                                                                    )
                                                                        ? "bg-custom-lightgreen border-none"
                                                                        : "border-black"
                                                                }`}
                                                                onClick={() =>
                                                                    toggleProperty(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                {selectedProperty.includes(
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
                                    <span className="text-base text-black">
                                        Status
                                    </span>
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
                                                    >
                                                        <span className="text-black">
                                                            {item}
                                                        </span>
                                                        <div
                                                            className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                status.includes(
                                                                    index
                                                                )
                                                                    ? "bg-custom-lightgreen border-none"
                                                                    : "border-black"
                                                            }`}
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            {status.includes(
                                                                index
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
                </>
            )}
            {types === "documents" && (
                <>
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
                                <span className="text-base text-black">
                                    Property
                                </span>
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
                                                    >
                                                        <span className="text-black">
                                                            {item}
                                                        </span>
                                                        <div
                                                            className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                                selectedProperty.includes(
                                                                    item
                                                                )
                                                                    ? "bg-custom-lightgreen border-none"
                                                                    : "border-black"
                                                            }`}
                                                            onClick={() =>
                                                                toggleProperty(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            {selectedProperty.includes(
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
                </>
            )}
        </>
    );
};

export default FilterWrapper;
