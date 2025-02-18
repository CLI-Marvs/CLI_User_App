import { IoIosCloseCircle } from "react-icons/io";
import arrowCutomer from "../../../../../../public/Images/arrowcustomer.png";
import DatePicker from "react-datepicker";
import { MdCalendarToday } from "react-icons/md";
import { useState } from "react";
import { useStateContext } from "@/context/contextprovider";
import { IoIosCheckmark } from "react-icons/io";

const TRANSACTION_TYPES = ["Equity", "Invoice", "SOA"];

const PAYMENT_CHANNELS = ["E-walltet", "Credit Card", "Installment"];

const FilterWrapper = ({ closeFilters }) => {
    const { propertyNamesList } = useStateContext();
    const [selectedIndex, setSelectedIndex] = useState([]);
    const [transactionType, setTransactionType] = useState([]);
    const [filterDropdown, setFilterDropdown] = useState({
        duration: false,
        property: false,
        transationType: false,
        paymentChannel: false,
    });

    const toggleFilterDropdown = (filter) => {
        setTransactionType([]);
        setSelectedIndex([]);
        setFilterDropdown((prev) => ({
            ...prev,
            [filter]: !prev[filter],
        }));
    };

    const toggleSelection = (index) => {
        setSelectedIndex((prevSelected) =>
            prevSelected.includes(index)
                ? prevSelected.filter((i) => i !== index)
                : [...prevSelected, index]
        );
    };

    const toggleTransactionType = (index) => {
        setTransactionType((prev) => 
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

                      // Capitalize each word in the string
                      formattedItem = formattedItem
                          .split(" ")
                          .map((word) => {
                              // Check for specific words that need to be fully capitalized
                              if (/^(Sjmv|Lpu|Cdo|Dgt)$/i.test(word)) {
                                  return word.toUpperCase();
                              }
                              // Capitalize the first letter of all other words
                              return (
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              );
                          })
                          .join(" ");

                      // Replace specific names if needed
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
            {/* For Trnasaction History */}
            <div
                className="flex text-white h-5 w-full justify-end"
                onClick={closeFilters}
            >
                <IoIosCloseCircle className="size-6 cursor-pointer" />
            </div>
            <div className="flex justify-center mb-5">
                <span className="text-white text-lg">Transaction History</span>
            </div>

            <div className="flex flex-col justify-center items-center space-y-3">
                <div
                    className={`bg-[#444444] w-full rounded-lg py-[8px] ${
                        filterDropdown.duration ? "space-y-6" : ""
                    }`}
                >
                    <div className="flex flex-col cursor-pointer">
                        <div
                            className="flex justify-between items-center px-[15px]"
                            onClick={() => toggleFilterDropdown("duration")}
                        >
                            <span className="text-base text-white">
                                Duration
                            </span>
                            <img
                                src={arrowCutomer}
                                alt=""
                                className={`size-3 transition-transform duration-500 ${
                                    filterDropdown.duration ? "rotate-180" : ""
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
                                <div className="flex items-center gap-2 w-full">
                                    <span className="text-white text-sm">
                                        From
                                    </span>

                                    <div className="relative flex w-full">
                                        <DatePicker className="w-full outline-none rounded-[4px]" />

                                        <div className="absolute h-full right-0 flex top-0 items-center p-3 bg-custom-solidgreen rounded-[4px]">
                                            <MdCalendarToday className="size-4 text-white" />
                                        </div>
                                    </div>
                                    <span className="text-white text-sm">
                                        To
                                    </span>
                                    <div className="relative w-full">
                                        <DatePicker className="w-full outline-none rounded-[4px]" />
                                        <div className="absolute h-full right-0 flex top-0 items-center p-3 bg-custom-solidgreen rounded-[4px] text-white">
                                            <MdCalendarToday />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center text-center justify-center mt-2">
                                    <span className="text-white gradient-btn5 w-[58px] px-2.5">
                                        Apply
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center items-center space-y-3 mt-3">
                <div
                    className={`bg-[#444444] w-full rounded-lg py-[8px] ${
                        filterDropdown.property ? "space-y-6" : ""
                    }`}
                >
                    <div className="flex flex-col cursor-pointer">
                        <div
                            className="flex justify-between items-center px-[15px]"
                            onClick={() => toggleFilterDropdown("property")}
                        >
                            <span className="text-base text-white">
                                Property
                            </span>
                            <img
                                src={arrowCutomer}
                                alt=""
                                className={`size-3 transition-transform duration-500 ${
                                    filterDropdown.property ? "rotate-180" : ""
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
                                                    <span className="text-white">
                                                        {item}
                                                    </span>
                                                    <div
                                                        className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                            selectedIndex.includes(
                                                                index
                                                            )
                                                                ? "bg-custom-lightgreen border-none"
                                                                : "border-white"
                                                        }`}
                                                        onClick={() =>
                                                            toggleSelection(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        {selectedIndex.includes(
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

            <div className="flex flex-col justify-center items-center space-y-3 mt-3">
                <div
                    className={`bg-[#444444] w-full rounded-lg py-[8px] ${
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
                            <span className="text-base text-white">
                                Transaction Type
                            </span>
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
                                                <div className="flex justify-between" key={index}>
                                                    <span
                                                        className="text-white"
                                                    >
                                                        {item}
                                                    </span>
                                                    <div
                                                        className={`w-4 h-4 flex items-center justify-center rounded-full border-2 mr-3 ${
                                                            transactionType.includes(
                                                                index
                                                            )
                                                                ? "bg-custom-lightgreen border-none"
                                                                : "border-white"
                                                        }`}
                                                        onClick={() =>
                                                            toggleTransactionType(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        {transactionType.includes(
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

            <div className="flex flex-col justify-center items-center space-y-3 mt-3">
                <div
                    className={`bg-[#444444] w-full rounded-lg py-[8px] ${
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
                            <span className="text-base text-white">
                                Payment Channel
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
                                        {PAYMENT_CHANNELS.map((item, index) => (
                                            <div className="flex justify-between">
                                                <span
                                                    className="text-white"
                                                    key={index}
                                                >
                                                    {item}
                                                </span>
                                                <div className="w-4 h-4 rounded-full border-2 border-white mr-3"></div>
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
    );
};

export default FilterWrapper;
