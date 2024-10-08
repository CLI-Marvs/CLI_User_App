import React, { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { useStateContext } from "../../../../../context/contextprovider";

const PaymentSchemes = () => {
    //State
    const [accordionOpen, setAccordionOpen] = useState(false);
    const { paymentSchemes, setPaymentSchemes, getPaymentSchemes } =
        useStateContext();
    //Hooks

    // useEffect(() => {}, []);
    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out
      ${
          accordionOpen
              ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
              : "h-[72px] gradient-btn3 rounded-[10px] p-[1px]"
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
                        Payment Schemes
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
                <div className=" overflow-hidden bg-white">
                    <div className="p-[20px] flex flex-wrap items-center gap-[20px]">
                        {paymentSchemes &&
                            paymentSchemes.map((item, index) => (
                                <div className="w-[240px] p-[20px]   rounded-[10px]">
                                    <div className="flex items-center gap-[15px] h-[36px] w-full mb-[10px]">
                                        <input
                                            type="checkbox"
                                            className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                                        />
                                        <p className="montserrat-semibold text-[21px]">
                                            {item?.payment_scheme_name}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm pr-4">
                                        <p>{item?.description}</p>
                                        <p>Spot {item?.spot}%</p>
                                        <p>
                                            Installment{" "}
                                            {item?.downpayment_installment}%
                                        </p>
                                        <p>
                                            Bank Financing{" "}
                                            {item?.bank_financing}%
                                        </p>
                                        <p>Discount 8% (100% LP - RF)</p>
                                    </div>
                                </div>
                            ))}
                        {/* <div className="w-[240px] h-[225px] p-[20px] bg-custom-grayFA rounded-[10px]">
                            <div className="flex items-center gap-[15px] h-[36px] w-full mb-[10px]">
                                <input
                                    type="checkbox"
                                    className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                                />
                                <p className="montserrat-semibold text-[21px]">
                                    Spot 12% DP
                                </p>
                            </div>
                            <div className="flex flex-col gap-1 text-sm">
                                <p>
                                    Spot 12% DP on TCP with 5% Discount on LP
                                    (net of RF)
                                </p>
                                <p>Spot 12%</p>
                                <p>Installment 0%</p>
                                <p>Bank Financing 88%</p>
                                <p>Discount 5% (100% LP - RF)</p>
                            </div>
                        </div>
                        <div className="w-[240px] p-[20px] bg-custom-grayFA rounded-[10px]">
                            <div className="flex items-center gap-[15px] h-[36px] w-full mb-[10px]">
                                <input
                                    type="checkbox"
                                    className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                                />
                                <p className="montserrat-semibold text-[21px]">
                                    Spot 2% DP
                                </p>
                            </div>
                            <div className="flex flex-col gap-1 text-sm">
                                <p>Spot 2% DP with 10% Discount on 2% LP</p>
                                <p>Spot 2%</p>
                                <p>Installment 10% (59 mos)</p>
                                <p>Bank Financing 88%</p>
                                <p>Discount 2% (2% LP)</p>
                            </div>
                        </div>
                        <div className="w-[240px] p-[20px] bg-custom-grayFA rounded-[10px]">
                            <div className="flex items-center gap-[15px] h-[36px] w-full mb-[10px]">
                                <input
                                    type="checkbox"
                                    className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                                />
                                <p className="montserrat-semibold text-[21px]">
                                    Installment
                                </p>
                            </div>
                            <div className="flex flex-col gap-1 text-sm">
                                <p>12% DP on TCP in 60 months</p>
                                <p>Spot 0%</p>
                                <p>Installment 12% (60 months)</p>
                                <p>Bank Financing 88%</p>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentSchemes;
