import React, { useState, useRef, useEffect } from "react";
import { FaRegTrashAlt, FaRegCalendar } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { MdFormatListBulletedAdd } from "react-icons/md";
import AddPaymentSchemeModal from "@/component/layout/propertyandpricingpage/basicpricing/modals/PaymentScheme/AddPaymentSchemeModal";
import { IoIosCloseCircle } from "react-icons/io";
import moment from "moment";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { HiPencil } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { usePaymentScheme } from "@/context/PropertyPricing/PaymentSchemeContext";

const PriceVersions = ({ priceListMasterData, action }) => {
    //States
    const [accordionOpen, setAccordionOpen] = useState(false);
    const paymentSchemeModalRef = useRef(null);
    const { pricingData, updatePricingSection, setPricingData } = usePricing();
    const [versionIndex, setVersionIndex] = useState(0);
    // const { paymentScheme, fetchPaymentSchemes } = usePaymentScheme();
    // const [selectedPaymentSchemes, setSelectedPaymentSchemes] = useState([]);
    console.log("pricingData", pricingData);
    //Hooks
    // useEffect(() => {
    //     if (paymentScheme && pricingData) {
    //         // Retrieve all payment schemes and filter base on the selected payment scheme
    //         const selectedPaymentSchemes = paymentScheme.filter((scheme) =>
    //             pricingData?.priceVersions?.[
    //                 versionIndex
    //             ]?.payment_scheme?.includes(scheme.id)
    //         );

    //         if (selectedPaymentSchemes) {
    //             setSelectedPaymentSchemes(selectedPaymentSchemes);
    //         } else {
    //             console.log("No matching payment scheme found.");
    //         }
    //     }
    // }, [paymentScheme, pricingData, versionIndex]);

    //Event handler
    //Handle change in the input field for price version
    const handlePriceVersionInputChange = (event, formIndex) => {
        const { name, value } = event.target;

        // Map through the priceVersions object and update the correct entry by index
        const updatedPriceVersions = Object.entries(
            pricingData?.priceVersions || {}
        ).map(([key, version], index) =>
            index === formIndex ? { ...version, [name]: value } : version
        );

        // Convert back to object format after updating
        const updatedPriceVersionsObject = Object.fromEntries(
            Object.keys(pricingData?.priceVersions || {}).map((key, index) => [
                key,
                updatedPriceVersions[index],
            ])
        );
        updatePricingSection("priceVersions", updatedPriceVersionsObject);
    };

    /**
     * Handle show payment scheme modal
     * Pass the version index
     * @param {*} index
     */
    const handleShowPaymentSchemeModal = (index) => {
        if (paymentSchemeModalRef.current) {
            setVersionIndex(index);
            paymentSchemeModalRef.current.showModal();
        }
    };

    //Handle click to iterate more fields
    const handleAddFields = () => {
        setPricingData((prev) => {
            // Copy the current priceVersions object
            const currentPriceVersions = { ...prev.priceVersions };

            // Find the next numeric key for the new priceVersion
            const nextKey = Object.keys(currentPriceVersions).length.toString();

            // Add the new priceVersion
            currentPriceVersions[nextKey] = {
                name: "",
                percent_increase: 0,
                no_of_allowed_buyers: 0,
                expiry_date: moment(new Date()).format("MM-DD-YYYY HH:mm:ss"),
                payment_scheme: [],
            };

            // Return the updated state
            return {
                ...prev,
                priceVersions: currentPriceVersions,
            };
        });
    };

    //Handle remove the fields
    const handleRemoveFields = (index) => {
        // Copy the existing priceVersions object
        const updatedPriceVersions = { ...pricingData.priceVersions };

        // Delete the specific key from the object
        delete updatedPriceVersions[index];

        // Update the state with the modified priceVersions
        setPricingData({
            ...pricingData,
            priceVersions: updatedPriceVersions,
        });
    };

    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out
      ${accordionOpen
                        ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
                        : "h-[72px]  gradient-btn3 rounded-[10px] p-[1px]"
                    } `}
            >
                <button
                    onClick={() => setAccordionOpen(!accordionOpen)}
                    className={`
            ${accordionOpen
                            ? "flex justify-between items-center h-full w-full bg-white rounded-[9px] px-[15px]"
                            : "flex justify-between items-center h-full w-full bg-custom-grayFA rounded-[9px] px-[15px]"
                        } `}
                >
                    <span
                        className={` text-custom-solidgreen ${accordionOpen
                            ? "text-[20px] montserrat-semibold"
                            : "text-[18px] montserrat-regular"
                            }`}
                    >
                        Price Versions
                    </span>
                    <span
                        className={`flex justify-center items-center h-[40px] w-[40px] rounded-full  transform transition-transform duration-300 ease-in-out ${accordionOpen
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
            ${accordionOpen
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
                                        Object.keys(
                                            pricingData?.priceVersions
                                        ).map((form, index) => {
                                            const paymentScheme =
                                                pricingData?.priceVersions[
                                                    index
                                                ]?.payment_scheme;

                                            return (
                                                <tbody>
                                                    <tr className="h-[66px] bg-white text-sm">
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
                                                        <td className="px-[10px] flex items-center mt-5 gap-x-1">
                                                            <input
                                                                type="text"
                                                                className=" w-[100px] border border-custom-grayF1 rounded-[5px] h-[31px]"
                                                                placeholder="NA"
                                                            />
                                                            <FaRegCalendar className="size-5 text-custom-gray81 hover:text-red-500" />
                                                        </td>
                                                        <td className="">
                                                            {paymentScheme &&
                                                                paymentScheme.length >
                                                                1 ? (
                                                                <div>
                                                                    <p> MPS </p>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center">
                                                                    <p className="flex flex-1 mx-1">
                                                                        {paymentScheme &&
                                                                            paymentScheme[0]
                                                                                ?.payment_scheme_name
                                                                        }
                                                                    </p>
                                                                        {paymentScheme && paymentScheme.length > 0 && (
                                                                        <div className="flex items-center">
                                                                            <HiPencil className="text-custom-solidgreen h-6 w-6 cursor-pointer" />
                                                                            <MdDelete className="text-red-500 h-6 w-6 cursor-pointer" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
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
                                        })}
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
                    paymentSchemeModalRef={paymentSchemeModalRef}
                    priceListMasterData={priceListMasterData}
                    action={action}
                    versionIndex={versionIndex}
                />
            </div>
        </>
    );
};

export default PriceVersions;
