import React, { useState, useRef, useEffect } from "react";
import { FaRegTrashAlt, FaRegCalendar } from "react-icons/fa";
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

const PriceVersions = ({ priceListMasterData, action }) => {
    //States
    const [accordionOpen, setAccordionOpen] = useState(false);
    const addPaymentSchemeModalRef = useRef(null);
    const editPaymentSchemeModalRef = useRef(null);
    const { pricingData, updatePricingSection, setPricingData } = usePricing();
    const [versionIndex, setVersionIndex] = useState(0);
    const [selectedPaymentSchemes, setSelectedPaymentSchemes] = useState([]);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [startDate, setStartDate] = useState(null);
    // const { paymentScheme, fetchPaymentSchemes } = usePaymentScheme();
    // const [selectedPaymentSchemes, setSelectedPaymentSchemes] = useState([]);
    // console.log("pricingData", pricingData);

    //Event handler
    //Handle change in the input field for price version
    const handlePriceVersionInputChange = (event, formIndex) => {
        const { name, value } = event.target;

        // Ensure pricingData and priceVersions are valid
        if (!Array.isArray(pricingData?.priceVersions)) {
            console.error(
                "pricingData.priceVersions is not an array",
                pricingData?.priceVersions
            );
            return; // If it's not an array, return early to avoid further issues
        }

        const updatedPriceVersions = [...pricingData.priceVersions]; // Make a copy of the priceVersions array

        // Check if formIndex is within bounds
        if (formIndex >= updatedPriceVersions.length || formIndex < 0) {
            console.error("Form index is out of bounds");
            return; // If index out of bounds, return early
        }

        // Update the specific form object at the given index
        updatedPriceVersions[formIndex] = {
            ...updatedPriceVersions[formIndex],
            [name]: value, // Update only the changed field
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
                ? [...prev.priceVersions] // Make sure priceVersions is always an array
                : []; // Default to empty array if it's not

            // Add a new price version
            priceVersions.push({
                id: 0,
                name: "",
                percent_increase: 0,
                status: "Active",
                no_of_allowed_buyers: 0,
                expiry_date: moment().isValid()
                    ? moment(new Date()).format("MM-DD-YYYY HH:mm:ss")
                    : "", // Safe fallback for expiry_date
                payment_scheme: [],
            });

            // Update the state
            return {
                ...prev,
                priceVersions: priceVersions, // Add the newly updated array
            };
        });
    };

    //Handle remove the fields
    const handleRemoveFields = (index) => {
        //TODO: KUNG Edit mode, then ang versions kay naa nay data, if iyang e remove, ma remove siya but ang status sa price versions kay ma in active na isya
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
     * Handle remove selected payment scheme
     * Copy the existing priceVersions object
     * Delete the specific key from the object
     * Set again the payment_scheme array to null
     * @param {*} index
     */
    const handleRemovePaymentScheme = (index) => {
        const updatedPriceVersions = { ...pricingData.priceVersions };

        delete updatedPriceVersions[index].payment_scheme;
        updatedPriceVersions[index].payment_scheme = [];

        setPricingData({
            ...pricingData,
            priceVersions: updatedPriceVersions,
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
    const handleDateChange = (date, formIndex) => {
        // You can set the date field based on your specific naming convention for form fields

        const updatedPriceVersions = Object.fromEntries(
            Object.keys(pricingData?.priceVersions || {}).map(
                (versionKey, index) =>
                    index === formIndex
                        ? [
                              versionKey, // retain the original key
                              {
                                  ...pricingData.priceVersions[versionKey],
                                  expiry_date: moment(date).format(
                                      "MM-DD-YYYY HH:mm:ss"
                                  ),
                              },
                          ]
                        : [versionKey, pricingData.priceVersions[versionKey]]
            )
        );

        // Update pricing section after updating
        updatePricingSection("priceVersions", updatedPriceVersions);
    };

    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out relative
      ${
          accordionOpen
              ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
              : "h-[72px]  gradient-btn3 rounded-[10px] p-[1px]"
      } `}
            >
                <button
                    onClick={() => setAccordionOpen(!accordionOpen)}
                    className={`
            ${
                accordionOpen
                    ? "flex justify-between items-center h-full w-full bg-white rounded-[9px] px-[15px]"
                    : "flex justify-between items-center h-full w-full bg-custom-grayFA rounded-[9px] px-[15px]"
            } `}
                >
                    <span
                        className={` text-custom-solidgreen ${
                            accordionOpen
                                ? "text-[20px] montserrat-semibold"
                                : "text-[18px] montserrat-regular"
                        }`}
                    >
                        Price Versions
                    </span>
                    <span
                        className={`flex justify-center items-center h-[40px] w-[40px] rounded-full  transform transition-transform duration-300 ease-in-out ${
                            accordionOpen
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
                accordionOpen
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
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    className="pl-3 w-[150px] border border-custom-grayF1 rounded-[5px] h-[31px]"
                                                                    value={
                                                                        form.name
                                                                    }
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
                                                                <input
                                                                    type="number"
                                                                    name="percent_increase"
                                                                    className="pl-3 w-[100px] border border-custom-grayF1 rounded-[5px] h-[31px]"
                                                                    value={
                                                                        form.percent_increase
                                                                    }
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
                                                                {/* TODO: add padding when typing data */}
                                                                <input
                                                                    type="number"
                                                                    className=" w-[100px] border 
                                                        border-custom-grayF1 rounded-[5px] h-[31px]"
                                                                    name="no_of_allowed_buyers"
                                                                    value={
                                                                        form.no_of_allowed_buyers
                                                                    }
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
                                                            <td className="px-[10px] flex items-center mt-4 gap-x-1">
                                                                <div className=" flex gap-x-1   items-center">
                                                                    <DatePicker
                                                                        selected={
                                                                            form.expiry_date
                                                                        }
                                                                        onChange={(
                                                                            date
                                                                        ) =>
                                                                            handleDateChange(
                                                                                date,
                                                                                index
                                                                            )
                                                                        }
                                                                        className="w-[100px] border border-custom-grayF1 rounded-[5px] h-[31px] pl-2"
                                                                        name="expiry_date"
                                                                        calendarClassName="custom-calendar"
                                                                        placeholderText="N/A"
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
                                                                                    {/* TODO: DOnt show edit and delete button if the Status is Ongoing approve, approved live */}
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
                                                                        </div>
                                                                    )}
                                                            </td>

                                                            <td className="px-[10px]">
                                                                {pricingData &&
                                                                    Object.keys(
                                                                        pricingData?.priceVersions
                                                                    ).length >
                                                                        1 && (
                                                                        <IoIosCloseCircle
                                                                            onClick={() =>
                                                                                handleRemoveFields(
                                                                                    index
                                                                                )
                                                                            }
                                                                            className="text-custom-gray h-6 w-6 cursor-pointer hover:text-red-500"
                                                                        />
                                                                    )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                );
                                            }
                                        )}
                                </table>
                                <div className="flex justify-center mt-4">
                                    <button
                                        className="h-[44px] w-[81px] flex gap-2 rounded-[10px] justify-center items-center bg-custom-grayFA text-sm border border-custom-grayF1"
                                        onClick={handleAddFields}
                                    >
                                        <span>Add</span>
                                        <span>
                                            <MdFormatListBulletedAdd />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <AddPaymentSchemeModal
                    addPaymentSchemeModalRef={addPaymentSchemeModalRef}
                    priceListMasterData={priceListMasterData}
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
