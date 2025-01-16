import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { LiaPercentSolid } from "react-icons/lia";
// import { usePriceBasicDetailStateContext } from "../../../../../context/PriceBasicDetail/PriceBasicContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";

const formDataState = {

};

const PriceListSettings = () => {
    //State
    const [accordionOpen, setAccordionOpen] = useState(false);
    const [formData, setFormData] = useState(formDataState);
    const { pricingData, updatePricingSection } = usePricing();

    //Event Handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updatePricingSection('priceListSettings', { [name]: value });
    };

    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out
    ${accordionOpen
                        ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
                        : "h-[72px] gradient-btn3 rounded-[10px] p-[1px]"
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
                        Price List Settings
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
                <div className="overflow-hidden bg-white">
                    <div className="flex flex-col justify-between w-full h-[153px] p-5">
                        <div className="flex gap-2 h-[31px]">
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1">
                                    Base Price Per Sq. M.
                                </span>
                                <input
                                    name="basePrice"
                                    type="number"
                                    onChange={handleInputChange}
                                    value={pricingData.priceListSettings.basePrice}
                                    className="w-full px-4 focus:outline-none "

                                />
                                {/* TODO: add percent suffix here */}
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 ">
                                    Transfer charge
                                </span>
                                <input
                                    onChange={handleInputChange}
                                    value={
                                        pricingData.priceListSettings.transferCharge
                                    }
                                    name="transferCharge"
                                    type="number"
                                    className="w-full px-4 focus:outline-none"

                                />
                            </div>
                        </div>
                        <div className="flex gap-2 h-[31px]">
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1">
                                    Effective Balcony Base
                                </span>
                                <input
                                    name="effectiveBalconyBase"
                                    type="number"
                                    onChange={handleInputChange}
                                    value={
                                        pricingData.priceListSettings.effectiveBalconyBase
                                    }
                                    className="w-full px-4 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 ">
                                    VAT
                                </span>
                                <input
                                    name="vat"
                                    onChange={handleInputChange}
                                    value={pricingData.priceListSettings.vat}
                                    type="number"
                                    className="w-full px-4 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 h-[31px]">
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 ">
                                    VATable Less Price&nbsp;
                                    <span className="flex items-center font-semibold text-xs">
                                        (greater than)
                                    </span>
                                </span>
                                <input
                                    name="vatableLessPrice"
                                    type="number"
                                    onChange={handleInputChange}
                                    value={
                                        pricingData.priceListSettings.vatableLessPrice
                                    }
                                    className="w-full px-4 focus:outline-none"
                                    defaultValue="3600000"
                                />
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 text-sm">
                                    Reservation Fee
                                </span>
                                <input
                                    name="reservationFee"
                                    type="number"
                                    onChange={handleInputChange}
                                    value={
                                        pricingData.priceListSettings.reservationFee
                                    }
                                    className="w-full px-4 focus:outline-none"
                                    placeholder=""
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PriceListSettings;
