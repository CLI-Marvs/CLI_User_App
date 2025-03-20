import React, { useState, useMemo, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { usePricing } from "@/component/layout/propertyandpricingpage/context/BasicPricingContext";
import CustomInput from "@/component/Input/CustomInput";

const PriceListSettings = ({ isOpen, toggleAccordion, priceListData }) => {
    //State
    const { pricingData, updatePricingSection } = usePricing();

    //Event Handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updatePricingSection("priceListSettings", { [name]: value });
    };

    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out
    ${
        isOpen
            ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
            : "h-[72px] gradient-btn3 rounded-[10px] p-[1px]"
    } `}
            >
                <button
                    onClick={() => toggleAccordion("priceListSettings")}
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
                        Price List Settings
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
                <div className="overflow-hidden bg-white">
                    <div className="flex flex-col justify-between w-full h-[153px] p-5">
                        <div className="flex gap-2 h-[31px]">
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1">
                                    Base Price Per Sq. M.
                                </span>
                                <CustomInput
                                    name="base_price"
                                    value={
                                        pricingData?.priceListSettings
                                            ?.base_price || ""
                                    }
                                    className="w-full px-4 focus:outline-none "
                                    onChange={handleInputChange}
                                    restrictNumbers={true}
                                    disabled={
                                        priceListData.data.status !== "Draft"
                                    }
                                />

                                {/* TODO: add percent % suffix here */}
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 ">
                                    Transfer charge
                                </span>
                                <CustomInput
                                    name="transfer_charge"
                                    value={
                                        pricingData?.priceListSettings
                                            ?.transfer_charge || ""
                                    }
                                    className="w-full px-4 focus:outline-none "
                                    onChange={handleInputChange}
                                    restrictNumbers={true}
                                    disabled={
                                        priceListData.data.status !== "Draft"
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 h-[31px]">
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1">
                                    Effective Balcony Base
                                </span>
                                <input
                                    name="effective_balcony_base"
                                    type="number"
                                    onChange={handleInputChange}
                                    value={
                                        pricingData?.priceListSettings
                                            ?.effective_balcony_base
                                    }
                                    className="w-full px-4 focus:outline-none"
                                    disabled={
                                        priceListData.data.status !== "Draft" ||
                                        true
                                    }
                                />
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 ">
                                    VAT
                                </span>
                                <CustomInput
                                    name="vat"
                                    value={
                                        pricingData?.priceListSettings?.vat ||
                                        ""
                                    }
                                    className="w-full px-4 focus:outline-none "
                                    onChange={handleInputChange}
                                    restrictNumbers={true}
                                    disabled={
                                        priceListData.data.status !== "Draft"
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 h-[31px]">
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 ">
                                    VATable List Price&nbsp;
                                    <span className="flex items-center font-semibold text-xs">
                                        (greater than)
                                    </span>
                                </span>
                                <CustomInput
                                    name="vatable_less_price"
                                    value={
                                        pricingData?.priceListSettings
                                            ?.vatable_less_price || ""
                                    }
                                    className="w-full px-4 focus:outline-none "
                                    onChange={handleInputChange}
                                    restrictNumbers={true}
                                    disabled={
                                        priceListData.data.status !== "Draft"
                                    }
                                />
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 text-sm">
                                    Reservation Fee
                                </span>
                                <CustomInput
                                    name="reservation_fee"
                                    value={
                                        pricingData?.priceListSettings
                                            ?.reservation_fee || ""
                                    }
                                    className="w-full px-4 focus:outline-none "
                                    onChange={handleInputChange}
                                    restrictNumbers={true}
                                    disabled={
                                        priceListData.data.status !== "Draft"
                                    }
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
