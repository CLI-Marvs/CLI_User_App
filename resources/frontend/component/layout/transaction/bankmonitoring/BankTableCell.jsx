import moment from "moment";
import React from "react";
import { toLowerCaseText } from "@/util/formatToLowerCase";

const BankTableCell = ({ type, row }) => {
    switch (type) {
        case "transaction_date":
            return (
                <div className="w-[200px]">
                    <span className="montserrat-medium text-[13px]">
                        {moment(row.created_at).format("LLL")}
                    </span>
                </div>
            );
        case "transaction":
            return (
                <div className="flex justify-between w-[600px]">
                    {" "}
                    {/* Reduced width by 8px */}
                    <div className="flex flex-col flex-1">
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[14px]">
                                Transaction Number:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                                {row.transaction_number}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[14px]">
                                Account Number:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                                {row.account_number}
                            </span>
                        </div>
                    </div>
                    {/* Centered Separator */}
                    <div className="flex items-center justify-center w-[20px]">
                        <span className="text-gray-500 text-[24px]">|</span>
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[14px]">
                                Document Number:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                                {row.document_number}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[14px]">
                                Transaction Code:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                                {row.transaction_code}
                            </span>
                        </div>
                    </div>
                </div>
            );

        case "details":
            return (
                <div className="flex justify-between w-[400px]">
                    <div className="flex flex-col">
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[14px]">
                                Reference Number:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                                {row.reference_number}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[14px]">
                                Transaction Description:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                                {row.transaction_description}
                            </span>
                        </div>
                    </div>
                </div>
            );
        case "amount":
            return (
                <div className="flex montserrat-regular justify-center">
                    <span className="text-[13px]">{row.running_balance}</span>
                </div>
            );
        case "payment_method":
            return (
                <div className="flex justify-between w-[400px]">
                    <div className="flex flex-col">
                        <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                            Online Payment Aggregator
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="montserrat-medium text-[13px] break-all whitespace-normal overflow-hidden">
                            {row.payment_option}
                        </span>
                    </div>
                </div>
            );
        case "transaction_status":
            return (
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-[81px] h-[25px] rounded-[10px] bg-custom-solidgreen flex items-center justify-center">
                        <span className="text-white">
                            {row.status_of_posting}
                        </span>
                    </div>
                </div>
            );

        case "destination_bank":
            return (
                <div className="flex montserrat-regular justify-center">
                    <span className="text-[13px]">{row.bank_name}</span>
                </div>
            );

        default:
            return <span>{row[type]}</span>;
    }
};

export default BankTableCell;
