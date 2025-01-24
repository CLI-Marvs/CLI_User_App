import React, { useState, useRef, useEffect } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { MdFormatListBulletedAdd } from "react-icons/md";
import PaymentSchemeModal from "@/component/layout/propertyandpricingpage/basicpricing/modals/PaymentScheme/PaymentSchemeModal";
import { IoIosCloseCircle } from "react-icons/io";
import moment from "moment";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";

const PriceVersions = ({ priceListMasterData, action }) => {
    //States
    const [accordionOpen, setAccordionOpen] = useState(false);
    const paymentSchemeModalRef = useRef(null);
    // const [formData, setFormData] = useState([formDataState]);
    const { pricingData, updatePricingSection, setPricingData } = usePricing();
    console.log("pricingData", pricingData);
    // console.log("priceListMasterData", priceListMasterData);

    //Event handler
    //Handle change in the input field for price version
    const handlePriceVersionInputChange = (event, index) => {
        const { name, value } = event.target;
        // Update a specific priceVersion by mapping through the array
        const updatedPriceVersions = pricingData?.priceVersions.map(
            (version, i) =>
                i === index ? {
                    ...version,
                    [name]: value
                } : version
        );
        console.log("updatedPriceVersions", updatedPriceVersions);
        // Use updatePricingSection to update the priceVersions section
        updatePricingSection("priceVersions", updatedPriceVersions);
    };

    //Handle show payment scheme modal
    const handleShowPaymentSchemeModal = () => {
        if (paymentSchemeModalRef.current) {
            paymentSchemeModalRef.current.showModal();
        }
    };

    //Handle click to iterate more fields
    const handleAddFields = () => {
        setPricingData((prev) => ({
            priceVersions: [
                ...prev.priceVersions,
                {
                    name: "",
                    percent_increase: 0,
                    no_of_allowed_buyers: 0,
                    expiry_date: moment(new Date()).format(
                        "MM-DD-YYYY HH:mm:ss"
                    ),
                    payment_scheme: [],
                },
            ],
        }));
    };

    //Handle remove the fields
    const handleRemoveFields = (index) => {
        console.log("pricingData", pricingData);
        console.log("index", index);
      const updatedPriceVersions = [...pricingData.priceVersions];
      updatedPriceVersions.splice(index, 1);

      setPricingData({
          ...pricingData, 
          priceVersions: updatedPriceVersions,
      });
    };
    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out
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
                    <div className="w-full p-5 h-[370px] bg-white">
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
                                        </tr>
                                    </thead>
                                    {pricingData &&
                                        Object.keys(
                                            pricingData?.priceVersions
                                        ).map((form, index) => (
                                            <tbody>
                                                <tr className="h-[66px] bg-white text-sm">
                                                    <td className="px-[10px]">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            className="pl-3 w-[150px] border border-custom-grayF1 rounded-[5px]"
                                                            value={
                                                                form.name  
                                                            }
                                                            onChange={(event) =>
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
                                                            className="pl-3 w-[100px] border border-custom-grayF1 rounded-[5px]"
                                                            value={
                                                                form.percent_increase ||
                                                                ""
                                                            }
                                                            onChange={(event) =>
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
                                                        border-custom-grayF1 rounded-[5px]"
                                                            name="no_of_allowed_buyers"
                                                            value={
                                                                form.no_of_allowed_buyers ||
                                                                ""
                                                            }
                                                            onChange={(event) =>
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
                                                            className=" w-[100px] border border-custom-grayF1 rounded-[5px]"
                                                            placeholder="NA"
                                                        />
                                                        <FaRegTrashAlt className="size-5 text-custom-gray81 hover:text-red-500" />
                                                    </td>
                                                    <td className="">
                                                        <button
                                                            className="gradient-btn5 p-[1px] w-[84px] h-[27px] rounded-[8px] mx-4"
                                                            onClick={
                                                                handleShowPaymentSchemeModal
                                                            }
                                                        >
                                                            <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center text-sm">
                                                                <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                                                    Add +
                                                                </p>
                                                            </div>
                                                        </button>
                                                    </td>
                                                    <td className="px-[10px]">
                                                        {pricingData &&
                                                            pricingData
                                                                ?.priceVersions
                                                                .length > 1 && (
                                                                <IoIosCloseCircle
                                                                    onClick={() =>
                                                                        handleRemoveFields(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="text-red-500 h-6 w-6 cursor-pointer"
                                                                />
                                                            )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        ))}
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
                <PaymentSchemeModal
                    paymentSchemeModalRef={paymentSchemeModalRef}
                    priceListMasterData={priceListMasterData}
                    action={action}
                />
            </div>
        </>
    );
};

export default PriceVersions;
