import React, { useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { LiaPercentSolid } from "react-icons/lia";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";


const PriceListSettings = ({ }) => {
    //State
    const [accordionOpen, setAccordionOpen] = useState(false);
    const { pricingData, updatePricingSection } = usePricing();
 
    // const [formData, setFormData] = useState(pricingData.priceListSettings);
    // console.log("formData", formData);
 

    //Hooks
    // useEffect(() => {
    //     if(priceListData) {
    //         setFormData(priceListData);
    //     }
    // }, [priceListData]);

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
                                    name="base_price"
                                    type="number"
                                    onChange={handleInputChange}
                                    value={pricingData.priceListSettings.base_price}
                                    className="w-full px-4 focus:outline-none "

                                />
                                {/* TODO: add percent % suffix here */}
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 ">
                                    Transfer charge
                                </span>
                                <input
                                    onChange={handleInputChange}
                                    value={
                                        pricingData.priceListSettings.transfer_charge
                                    }
                                    name="transfer_charge"
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
                                    name="effective_balcony_base"
                                    type="number"
                                    onChange={handleInputChange}
                                    value={
                                        pricingData.priceListSettings.effective_balcony_base
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
                                    name="vatable_less_price"
                                    type="number"
                                    onChange={handleInputChange}
                                    value={
                                        pricingData.priceListSettings.vatable_less_price
                                    }
                                    className="w-full px-4 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[180%] pl-3 py-1 text-sm">
                                    Reservation Fee
                                </span>
                                <input
                                    name="reservation_fee"
                                    type="number"
                                    onChange={handleInputChange}
                                    value={
                                        pricingData.priceListSettings.reservation_fee
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
