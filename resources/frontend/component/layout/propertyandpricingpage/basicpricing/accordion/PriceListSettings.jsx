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
                  : "flex justify-between items-center h-full w-full bg-custombg3 rounded-[9px] px-[15px]"
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
                            {/* Base price */}
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custombg3 font-semibold flex w-[250px] pl-3 py-1">
                                    Base Price Per Sq. M.
                                </span>
                                <CustomInput
                                    name="base_price"
                                    value={
                                        pricingData?.priceListSettings
                                            ?.base_price || ""
                                    }
                                    className="w-[150px] px-4 focus:outline-none "
                                    onChange={handleInputChange}
                                    restrictNumbers={true}
                                    disabled={
                                        priceListData.data.status !== "Draft"
                                    }
                                />
                            </div>

                            {/* Transfer charge */}
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm justify-between">
                                <span className="text-custom-gray81 bg-custombg3 font-semibold   w-[200px] pl-3 py-1 ">
                                    Transfer charge
                                </span>
                                <div className="flex  h-full justify-between">
                                    <CustomInput
                                        name="transfer_charge"
                                        value={
                                            pricingData?.priceListSettings
                                                ?.transfer_charge || ""
                                        }
                                        className="w-[120px] px-4 focus:outline-none bg-white"
                                        onChange={handleInputChange}
                                        restrictNumbers={true}
                                        disabled={
                                            priceListData.data.status !==
                                            "Draft"
                                        }
                                    />
                                    <div className="w-[56px]  bg-custombg3  flex items-center justify-center rounded-r-[5px] h-full">
                                        %
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 h-[31px]">
                            {/* Effective balcony base */}
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custombg3 font-semibold flex w-[250px] pl-3 py-1">
                                    Effective Balcony Base
                                </span>
                                <div className="flex  h-full justify-between">
                                    <CustomInput
                                        type="number"
                                        name="effective_balcony_base"
                                        value={
                                            pricingData?.priceListSettings
                                                ?.effective_balcony_base || ""
                                        }
                                        className="w-[95px] px-4 focus:outline-none "
                                        onChange={handleInputChange}
                                        restrictNumbers={true}
                                        disabled={
                                            priceListData.data.status !==
                                            "Draft"
                                        }
                                    />
                                    <div className="w-[56px]  bg-custombg3  flex items-center justify-center rounded-r-[5px] h-full">
                                        %
                                    </div>
                                </div>
                            </div>

                            {/* VAT */}
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custombg3 font-semibold flex w-[200px] pl-3 py-1 ">
                                    VAT
                                </span>
                                <div className="flex  h-full justify-between">
                                    <CustomInput
                                        name="vat"
                                        value={
                                            pricingData?.priceListSettings
                                                ?.vat || ""
                                        }
                                        className="w-[120px] px-4 focus:outline-none "
                                        onChange={handleInputChange}
                                        restrictNumbers={true}
                                        disabled={
                                            priceListData.data.status !==
                                            "Draft"
                                        }
                                    />
                                    <div className="w-[56px]  bg-custombg3  flex items-center justify-center rounded-r-[5px] h-full">
                                        %
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 h-[31px]">
                            {/* VATable List Price */}
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custombg3  font-semibold flex w-[250px] pl-3 py-1 ">
                                    VATable List Price&nbsp; (greater than)
                                </span>
                                <CustomInput
                                    name="vatable_less_price"
                                    value={
                                        pricingData?.priceListSettings
                                            ?.vatable_less_price || ""
                                    }
                                    className="w-[150px] px-4 focus:outline-none "
                                    onChange={handleInputChange}
                                    restrictNumbers={true}
                                    disabled={
                                        priceListData.data.status !== "Draft"
                                    }
                                />
                            </div>

                            {/* Reservation Fee */}
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custombg3 font-semibold flex w-[200px] pl-3 py-1 text-sm">
                                    Reservation Fee
                                </span>
                                <CustomInput
                                    name="reservation_fee"
                                    value={
                                        pricingData?.priceListSettings
                                            ?.reservation_fee || ""
                                    }
                                    className="w-[170px] px-4 focus:outline-none "
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
