import React, { useState, useRef, useEffect } from "react";
import reportCredit from "../../../../../../public/Images/report-card.svg";
import reportWallet from "../../../../../../public/Images/report-wallet.svg";
import reportDate from "../../../../../../public/Images/report-date.svg";
import reportMaya from "../../../../../../public/Images/report-maya.png";
import reportGcash from "../../../../../../public/Images/report-gcash.png";
import { format } from "date-fns";

import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import moment from "moment";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import Skeletons from "@/component/Skeletons";
import { useTransactionReports } from "../hooks/useTransactionReports";

const cardData = [
    { label: "Bank Recon Amount", name: "total_bank_recon_amount" },
    { label: "Net Posting", name: "total_net_posting" },
    { label: "Bill", name: "total_bill" },
    { label: "Creditable Withholding Tax", name: "total_withholding_tax" },
    { label: "MDR Amount", name: "total_mdr_amount" },
    { label: "Gateway Fee", name: "total_gtw" },
];

const eWallets = [
    {
        label: "Bills",
        gatewayLabel: "Gateway Fee",
        wallet_image: reportGcash,
        name: "GCash",
    },
    {
        label: "Bills",
        gatewayLabel: "Gateway Fee",
        wallet_image: reportMaya,
        name: "Paymaya",
    },
];

const Reports = () => {
    const [activeTab, setActiveTab] = useState("Credit/Debit Card");
    const [showCalendar, setShowCalendar] = useState(false);
    const [paymentOption, setPaymentOption] = useState("Credit/Debit Card");
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);
    const wrapperRef = useRef(null);

    const {
        data: reportData,
        isLoading,
        refetch,
    } = useTransactionReports({
        activeTab,
        dateRange,
    });

    const toggleCalendar = () => {
        setShowCalendar((prev) => !prev);
    };
    
    const toggleTabs = (tab) => {
        setPaymentOption(tab);
        setActiveTab(tab);
    };

    const searchReports = async () => {
        setDateRange(state);
    };
    const confirmDates = () => {
        setShowCalendar(false); 
    };
    const resetDates = () => {
        setState([
            {
                startDate: new Date(),
                endDate: new Date(),
                key: "selection",
            },
        ]);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setShowCalendar(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    function formatAmountPH(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return "0.00";
        return num.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    const TabItem = ({ isActive, onClick, icon, label }) => (
        <div
            onClick={onClick}
            className={`flex items-center gap-1 pb-1 cursor-pointer border-b-2 transition-all duration-300 ${
                isActive ? "border-custom-solidgreen" : "border-transparent"
            }`}
        >
            <div
                className={`rounded-full w-[30px] h-[30px] flex items-center justify-center transition-all duration-300 ${
                    isActive ? "bg-custom-solidgreen" : "bg-[#BDBDBD]"
                }`}
            >
                <img src={icon} alt="" className="text-white" />
            </div>
            <span
                className={`transition-all duration-300 ${
                    isActive ? "text-custom-solidgreen" : "text-[#212121]"
                }`}
            >
                {label}
            </span>
        </div>
    );

    return (
        <div className="w-full h-full px-5">
            <div className="bg-white w-full h-full rounded-[10px] p-5 flex justify-between items-center">
                <div className="flex gap-3">
                    <div className="relative inline-block" ref={wrapperRef}>
                        <div
                            className="flex gap-3 items-center cursor-pointer"
                            onClick={toggleCalendar}
                        >
                            <img src={reportDate} alt="Filter icon" />
                            <span className="text-custom-gray montserrat-regular">
                                {format(state[0].startDate, "MMM dd, yyyy")} -{" "}
                                {format(state[0].endDate, "MMM dd, yyyy")}
                            </span>
                        </div>

                        {showCalendar && (
                            <div className="absolute z-50 mt-2 bg-white p-4 rounded-xl shadow-lg">
                                <DateRange
                                    editableDateInputs={true}
                                    onChange={(item) =>
                                        setState([item.selection])
                                    }
                                    moveRangeOnFirstSelection={false}
                                    ranges={state}
                                    months={2}
                                    direction="horizontal"
                                    rangeColors={["#D6E4D1"]}
                                />

                                <div className="flex justify-end gap-4 mt-4">
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={resetDates}
                                            className="border border-custom-solidgreen text-custom-solidgreen px-4 py-2 rounded-lg h-[38px] w-[121px]"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            confirmDates();
                                        }}
                                        className="h-[38px] w-[121px] gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        className="h-[38px] w-[121px] gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                        onClick={() => {
                            searchReports();
                        }}
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="flex gap-3 p-6 items-center">
                <TabItem
                    isActive={activeTab === "Credit/Debit Card"}
                    onClick={() => toggleTabs("Credit/Debit Card")}
                    icon={reportCredit}
                    label="Debit/Credit"
                />
                <TabItem
                    isActive={activeTab === "Ewallet"}
                    onClick={() => toggleTabs("Ewallet")}
                    icon={reportWallet}
                    label="E-Wallet"
                />
            </div>

            <div className="h-[200px] w-full rounded-2xl bg-gradient-to-br from-white/100 to-[#EAF3E5] shadow-card p-6 flex flex-col justify-center">
                <p className="text-gray-700 text-sm mb-1 font-medium">
                    Running Total
                </p>
                {isLoading ? (
                    <Skeletons height={20} width={100} />
                ) : (
                    <h2 className="text-custom-solidgreen text-4xl montserrat-semibold">
                        ₱{formatAmountPH(reportData.running_total)}
                    </h2>
                )}
                <p className="text-gray-400 text-xs mt-1">
                    (As of {format(state[0].startDate, "MMM dd, yyyy")} -{" "}
                    {format(state[0].endDate, "MMM dd, yyyy")})
                </p>
            </div>

            {activeTab === "Credit/Debit Card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full py-4">
                    {cardData.map((item, index) => (
                        <div
                            key={index}
                            className="w-full h-[132px] bg-white rounded-[16px] p-[40px] pr-[48px] pl-[48px] flex flex-col justify-between shadow-card space-y-2"
                        >
                            <span className="text-base text-custom-solidgreen font-medium">
                                {item.label}
                            </span>
                            {isLoading ? (
                                <Skeletons height={20} width={100} />
                            ) : (
                                <span className="text-2xl font-semibold text-[#212121] montserrat-medium">
                                    ₱{formatAmountPH(reportData[item.name])}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex gap-5 mb-10 flex-wrap py-4">
                    {eWallets.map((item, index) => (
                        <div
                            className="flex flex-col rounded-[24px] bg-white shadow-card h-[348px] w-full max-w-[calc(50%-10px)] px-[48px] pb-[64px] pt-[56px] space-y-2"
                            key={index}
                        >
                            <div className="flex justify-end">
                                <img src={item.wallet_image} alt="" />
                            </div>
                            <span className="text-base text-custom-solidgreen font-medium">
                                {item.label}
                            </span>
                            {isLoading ? (
                                <Skeletons height={40} width={120} />
                            ) : (
                                <span className="text-[40px] font-semibold text-[#212121] montserrat-medium">
                                    ₱
                                    {formatAmountPH(
                                        reportData[item.name]?.total_bill
                                    )}
                                </span>
                            )}
                            <hr className="border-[#A5A5A53D]" />
                            <span className="text-base text-custom-solidgreen font-medium">
                                {item.gatewayLabel}
                            </span>
                            {isLoading ? (
                                <Skeletons height={40} width={120} />
                            ) : (
                                <span className="text-[40px] font-semibold text-[#212121] montserrat-medium">
                                    ₱
                                    {formatAmountPH(
                                        reportData[item.name]?.total_pnf
                                    )}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reports;
