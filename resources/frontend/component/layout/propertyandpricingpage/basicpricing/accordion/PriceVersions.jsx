import React, { useState, useRef, useEffect } from "react";
import { FaRegCalendar } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { MdFormatListBulletedAdd } from "react-icons/md";
import AddPaymentSchemeModal from "@/component/layout/propertyandpricingpage/basicpricing/modals/PaymentScheme/AddPaymentSchemeModal";
import EditPaymentSchemeModal from "@/component/layout/propertyandpricingpage/basicpricing/modals/PaymentScheme/EditPaymentSchemeModal";
import { IoIosCloseCircle } from "react-icons/io";
import moment from "moment";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { HiPencil } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomInput from "@/component/Input/CustomInput";

const PriceVersions = ({
    priceListData,
    action,
    isOpen,
    toggleAccordion,
}) => {
    //States
    const addPaymentSchemeModalRef = useRef(null);
    const editPaymentSchemeModalRef = useRef(null);
    const { pricingData, setPricingData } = usePricing();
    const [versionIndex, setVersionIndex] = useState(0);

    //Event handler
    //Handle change in the input field for price version
    const handlePriceVersionInputChange = (event, formIndex) => {
        const { name, value } = event.target;

        if (!Array.isArray(pricingData?.priceVersions)) {
            return;
        }

        const updatedPriceVersions = [...pricingData.priceVersions];
        if (formIndex >= updatedPriceVersions.length || formIndex < 0) {
            return;
        }

        updatedPriceVersions[formIndex] = {
            ...updatedPriceVersions[formIndex],
            [name]: value,
        };

        // After updating, update the state with the new priceVersions
        setPricingData((prevPricingData) => ({
            ...prevPricingData,
            priceVersions: updatedPriceVersions,
        }));
    };

    /**
     * Handle show payment scheme modal
     * Pass the version index
     * @param {*} index
     */
    const handleShowPaymentSchemeModal = (index) => {
        if (addPaymentSchemeModalRef.current) {
            setVersionIndex(index);
            addPaymentSchemeModalRef.current.showModal();
        }
    };

    //Handle click to iterate more fields
    const handleAddFields = () => {
        setPricingData((prev) => {
            // Ensure priceVersions is always an array
            const priceVersions = Array.isArray(prev.priceVersions)
                ? [...prev.priceVersions]
                : [];

            // Get the last priority_number and increment by 1
            const lastPriorityNumber =
                priceVersions.length > 0
                    ? priceVersions[priceVersions.length - 1].priority_number ||
                      0
                    : 0;

            priceVersions.push({
                id: 0,
                name: "",
                percent_increase: 0,
                status: "Active",
                no_of_allowed_buyers: 0,
                expiry_date: "N/A",
                payment_scheme: [],
                priority_number: lastPriorityNumber + 1,
            });

            return {
                ...prev,
                priceVersions: priceVersions,
            };
        });
    };

    //Handle remove the fields
    const handleRemovePriceVersions = (index) => {
        setPricingData((prev) => {
            // Copy the current priceVersions array
            const updatedPriceVersions = [...prev.priceVersions];

            // Remove the item at the specified index using splice
            updatedPriceVersions.splice(index, 1);

            // Return the updated state
            return {
                ...prev,
                priceVersions: updatedPriceVersions,
            };
        });
    };

    /**
     * Handles the removal of a payment scheme from a specific price version within the pricing data.
     * This function updates the state by creating new objects and arrays to ensure proper re-renders in React.
     * It specifically targets the payment_scheme property of the price version at the given index and sets it to an empty array.
     * This effectively removes the payment scheme while preserving other data within the price version.
     *
     * @param {number} index The index of the price version from which to remove the payment scheme.
     */
    const handleRemovePaymentScheme = (index) => {
        setPricingData((prevPricingData) => {
            const updatedPriceVersions = prevPricingData.priceVersions.map(
                (version, i) => {
                    if (i === index) {
                        return { ...version, payment_scheme: [] };
                    }
                    return version;
                }
            );

            return { ...prevPricingData, priceVersions: updatedPriceVersions };
        });
    };

    //Handle edit payment scheme
    const handleEditPaymentScheme = (index) => {
        if (editPaymentSchemeModalRef.current) {
            setVersionIndex(index);
            editPaymentSchemeModalRef.current.showModal();
        }
    };

    //Handle date change
    const onDateChange = (date, formIndex) => {
        setPricingData((prevState) => {
            const updatedPriceVersions = prevState.priceVersions.map(
                (item, i) =>
                    i === formIndex
                        ? {
                              ...item,
                              expiry_date: date
                                  ? moment(date).format("MM-DD-YYYY HH:mm:ss")
                                  : "N/A",
                          }
                        : item
            );

            return {
                ...prevState,
                priceVersions: updatedPriceVersions,
            };
        });
    };

    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out  
      ${
          isOpen
              ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
              : "h-[72px]  gradient-btn3 rounded-[10px] p-[1px]"
      } `}
            >
                <button
                    onClick={() => toggleAccordion("priceVersions")}
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
                        Price Versions
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
                    <div className="w-full p-5 h-auto bg-white">
                        <div className="flex justify-center w-full">
                            <div className=" ">
                                <table>
                                    <thead>
                                        <tr className="h-[83px] bg-custom-grayFA text-custom-grayA5 montserrat-semibold text-sm">
                                            <th className="rounded-tl-[10px] pl-[2px] w-[90px] text-left">
                                                Priority
                                            </th>
                                            <th className="rounded-tl-[10px] pl-[10px] w-[150px] text-left">
                                                Version
                                            </th>
                                            <th className="  text-left pr-10 leading-[18px]">
                                                Percent Increase
                                            </th>
                                            <th className=" text-left leading-[18px]">
                                                No. of allowed buyers
                                            </th>
                                            <th className="w-[150px] text-left pl-4">
                                                Expiry Date
                                            </th>
                                            <th className=" text-left w-[150px] ">
                                                Payment Schemes
                                            </th>
                                            <th className=" text-left w-[40px]"></th>
                                        </tr>
                                    </thead>
                                    {pricingData &&
                                        Array.isArray(
                                            pricingData?.priceVersions
                                        ) &&
                                        pricingData?.priceVersions.map(
                                            (form, index) => {
                                                const paymentScheme =
                                                    pricingData?.priceVersions[
                                                        index
                                                    ]?.payment_scheme;

                                                return (
                                                    <tbody>
                                                        <tr
                                                            className="h-[66px] bg-white text-sm"
                                                            key={index}
                                                        >
                                                            <td className="px-[10px]">
                                                                {
                                                                    form.priority_number
                                                                }
                                                            </td>
                                                            <td className="px-[10px]">
                                                                <CustomInput
                                                                    type="text"
                                                                    name="name"
                                                                    value={
                                                                        form.name ||
                                                                        ""
                                                                    }
                                                                    className="pl-3 w-[150px] border border-custom-grayF1 rounded-[5px] h-[31px]"
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handlePriceVersionInputChange(
                                                                            event,
                                                                            index
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-[10px]">
                                                                <CustomInput
                                                                    type="number"
                                                                    name="percent_increase"
                                                                    value={
                                                                        form.percent_increase ||
                                                                        ""
                                                                    }
                                                                    className="pl-3 w-[100px] border border-custom-grayF1 rounded-[5px] h-[31px]"
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handlePriceVersionInputChange(
                                                                            event,
                                                                            index
                                                                        )
                                                                    }
                                                                    restrictNumbers={
                                                                        true
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-[10px]">
                                                                <CustomInput
                                                                    type="number"
                                                                    name="no_of_allowed_buyers"
                                                                    value={
                                                                        form.no_of_allowed_buyers ||
                                                                        ""
                                                                    }
                                                                    className="pl-3  w-[100px] border 
                                                        border-custom-grayF1 rounded-[5px] h-[31px]"
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handlePriceVersionInputChange(
                                                                            event,
                                                                            index
                                                                        )
                                                                    }
                                                                    restrictNumbers={
                                                                        true
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-[10px] flex items-center mt-4 gap-x-1">
                                                                <div className=" flex gap-x-1   items-center">
                                                                    <DatePicker
                                                                        selected={
                                                                            form.expiry_date !==
                                                                            "N/A"
                                                                                ? moment(
                                                                                      form.expiry_date,
                                                                                      "MM-DD-YYYY HH:mm:ss"
                                                                                  ).toDate()
                                                                                : null
                                                                        }
                                                                        // minDate={moment().toDate()}
                                                                        onChange={(
                                                                            date
                                                                        ) =>
                                                                            onDateChange(
                                                                                date,
                                                                                index
                                                                            )
                                                                        }
                                                                        className="w-[100px] border border-custom-grayF1 rounded-[5px] h-[31px] pl-2"
                                                                        name="expiry_date"
                                                                        calendarClassName="custom-calendar"
                                                                        placeholderText="N/A" // Display "N/A" when no date is selected
                                                                    />

                                                                    <FaRegCalendar className="size-5 text-custom-gray81 hover:text-red-500" />
                                                                </div>
                                                            </td>
                                                            <td className="">
                                                                <div className="flex items-center">
                                                                    <div className="flex flex-1">
                                                                        {paymentScheme &&
                                                                        paymentScheme.length >
                                                                            1 ? (
                                                                            <div className="">
                                                                                <p className="">
                                                                                    {paymentScheme.map(
                                                                                        (
                                                                                            scheme,
                                                                                            schemeIndex
                                                                                        ) => (
                                                                                            <span
                                                                                                className="h-auto bg-custom-lightestgreen rounded-lg px-1"
                                                                                                key={
                                                                                                    schemeIndex
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    scheme?.payment_scheme_name
                                                                                                }
                                                                                                {schemeIndex <
                                                                                                    paymentScheme.length -
                                                                                                        1 &&
                                                                                                    ", "}
                                                                                            </span>
                                                                                        )
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center">
                                                                                <p className="bg-custom-lightestgreen rounded-lg px-1">
                                                                                    {paymentScheme &&
                                                                                        paymentScheme[0]
                                                                                            ?.payment_scheme_name}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        {paymentScheme &&
                                                                            paymentScheme.length >
                                                                                0 && (
                                                                                <div className="flex items-center">
                                                                                    <HiPencil
                                                                                        onClick={() =>
                                                                                            handleEditPaymentScheme(
                                                                                                index
                                                                                            )
                                                                                        }
                                                                                        className="text-custom-solidgreen h-6 w-6 cursor-pointer"
                                                                                    />
                                                                                    <MdDelete
                                                                                        onClick={() =>
                                                                                            handleRemovePaymentScheme(
                                                                                                index
                                                                                            )
                                                                                        }
                                                                                        className="text-red-500 h-6 w-6 cursor-pointer"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                </div>

                                                                {paymentScheme &&
                                                                    paymentScheme.length ===
                                                                        0 && (
                                                                        <div className="flex justify-center items-center">
                                                                            {priceListData
                                                                                .data
                                                                                .status ===
                                                                            "Draft" ? (
                                                                                <button
                                                                                    className="gradient-btn5 p-[1px] w-[84px] h-[27px] rounded-[10px] mt-2"
                                                                                    onClick={() =>
                                                                                        handleShowPaymentSchemeModal(
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center text-sm montserrat-regular">
                                                                                        <p className="text-base bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                                                                            Add
                                                                                            +
                                                                                        </p>
                                                                                    </div>
                                                                                </button>
                                                                            ) : null}
                                                                        </div>
                                                                    )}
                                                            </td>

                                                            <td className="px-[10px]">
                                                                {/**
                                                                 * Show the remove button if there is more than one priceVersion
                                                                 * Show the remove button if at least one priceVersion has data from db
                                                                 * Hide the remove button if there is only one default empty priceVersion
                                                                 */}
                                                                {(pricingData &&
                                                                    pricingData
                                                                        .priceVersions
                                                                        .length >
                                                                        1) ||
                                                                pricingData.priceVersions.some(
                                                                    (pv) =>
                                                                        pv.id !==
                                                                            0 ||
                                                                        pv.name.trim() !==
                                                                            ""
                                                                ) ? (
                                                                    <IoIosCloseCircle
                                                                        onClick={() =>
                                                                            handleRemovePriceVersions(
                                                                                index
                                                                            )
                                                                        }
                                                                        className="text-custom-gray h-6 w-6 cursor-pointer hover:text-red-500"
                                                                    />
                                                                ) : null}{" "}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                );
                                            }
                                        )}
                                </table>
                                <div className="flex justify-center mt-4">
                                    {priceListData.data.status ===
                                    "Draft" ? (
                                        <button
                                            className="h-[44px] w-[81px] flex gap-2 rounded-[10px] justify-center items-center bg-custom-grayFA text-sm border border-custom-grayF1"
                                            onClick={handleAddFields}
                                        >
                                            <span>Add</span>
                                            <span>
                                                <MdFormatListBulletedAdd />
                                            </span>
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <AddPaymentSchemeModal
                    addPaymentSchemeModalRef={addPaymentSchemeModalRef}
                    priceListData={priceListData}
                    action={action}
                    versionIndex={versionIndex}
                />
                <EditPaymentSchemeModal
                    editPaymentSchemeModalRef={editPaymentSchemeModalRef}
                    versionIndex={versionIndex}
                />
            </div>
        </>
    );
};

export default PriceVersions;
