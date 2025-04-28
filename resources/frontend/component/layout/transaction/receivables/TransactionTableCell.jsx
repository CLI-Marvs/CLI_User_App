import moment from "moment";
import React from "react";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import { Link } from "react-router-dom";
import TransactionTooltip from "../TransactionTooltip";

const TransactionTableCell = ({ type, row }) => {
    console.log("row", row);
    const renderText = () => {
        const groupedMethods = {
            "Visa Debit/Credit": ["Credit/Debit Card"],
            "E-Wallet": ["GCash", "Paymaya"],
        };

        const calculateResult = (item) => {
            const fixed = parseFloat(item?.pti_bank_fixed_amount || 0);
            const markup = parseFloat(item?.cli_markup || 0);
            return fixed + markup;
        };

        const renderGroup = (groupTitle, methods) => {
            return (
                <div key={groupTitle}>
                    <span className="montserrat-semibold">{groupTitle}</span>
                    <br />
                    {methods.map((method) => {
                        /*  const locationType = row?.find((s) => s.payment_method === method); */
                        const local = row?.markup_details.find(
                            (setting) => setting.location === "local"
                        );
                        const international = row?.markup_details.find(
                            (setting) => setting.location === "international"
                        );
                        if (!local) return null;
                        const result = calculateResult(local);

                        if (method === "Credit/Debit Card") {
                            return (
                                <div key={method}>
                                    <span>
                                        Local: {local?.pti_bank_rate_percent}%
                                        of transaction amount plus Php{" "}
                                        {result.toFixed(2)}
                                    </span>
                                    <br />
                                    <span>
                                        International:{" "}
                                        {international?.pti_bank_rate_percent}%
                                        of transaction amount plus Php{" "}
                                        {result.toFixed(2)}
                                    </span>
                                    <br />
                                </div>
                            );
                        }

                        return (
                            <span key={method}>
                                {method}: {local?.pti_bank_rate_percent}% of
                                transaction amount or Php {result.toFixed(2)}{" "}
                                whichever is higher.
                                <br />
                            </span>
                        );
                    })}
                </div>
            );
        };

        return (
            <div className="flex flex-col gap-2 text-wrap">
                {Object.entries(groupedMethods).map(([groupTitle, methods]) =>
                    renderGroup(groupTitle, methods)
                )}
            </div>
        );
    };
    switch (type) {
        case "transaction_date":
            return (
                <div className="w-[200px]">
                    <span className="montserrat-medium text-[13px]">
                        {moment(
                            `${row.transaction_date} ${row.transaction_time}`
                        ).format("LLL")}
                    </span>
                </div>
            );
        case "transaction":
            return (
                <div className="flex justify-between w-[400px]">
                    <div className="flex flex-col">
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[14px]">
                                Transaction Number:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                                {row.transaction_number}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[14px] break-all whitespace-normal overflow-hidden">
                                Transaction Type:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                                {row.transaction_type}
                            </span>
                        </div>
                    </div>
                </div>
            );

        case "details":
            return (
                <div className="flex gap-8 items-center w-[450px]">
                    <div className="flex flex-col montserrat-regular">
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[13px]">
                                Reference/Contract No.:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all">
                                {row.reference_number}
                            </span>
                        </div>
                        <span className="text-xs text-custom-lightgreen">
                            {row.email}
                        </span>
                    </div>
                    <div className="flex flex-col flex-1 montserrat-regular">
                        <span className="text-[13px]">
                            {toLowerCaseText(row.property_name)}
                        </span>
                        <span className="text-xs text-custom-lightgreen break-all">
                            {row.remarks}
                        </span>
                    </div>
                </div>
            );
        case "amount":
            return (
                <div className="flex flex-col montserrat-regular justify-center">
                    <h3 className="mt-2 font-semibold">Fee Breakdown</h3>

                    <div className="flex flex-col text-[13px] mt-1">
                        <div className="flex justify-between">
                            <span>Payment Amount:</span>
                            <span>
                                {parseFloat(row.amount).toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </span>
                        </div>

                        <div className="flex items-center justify-between relative gap-1">
                            <div className="flex items-center gap-1">
                                <TransactionTooltip
                                    content={renderText()}
                                    position="right"
                                >
                                    <div className="bg-gradient-to-r from-[#175D5F] to-[#70AD47] rounded-[15px] h-[14px] w-[14px] flex items-center justify-center text-[10px] text-[#D9D9D9] cursor-pointer">
                                        i
                                    </div>
                                </TransactionTooltip>
                                <span>Convenience Fee:</span>
                            </div>
                            <span>
                                {parseFloat(row.convenience_fee).toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between font-semibold border-t mt-2 pt-1">
                            <span>Total Amount:</span>
                            <span>
                                {(
                                    parseFloat(row.amount) +
                                    parseFloat(row.convenience_fee)
                                ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            );
        case "payment_method":
            return (
                <div className="flex justify-between w-[400px]">
                    <div className="flex flex-col">
                        <span className="montserrat-semibold text-[13px] break-all">
                            {row.payment_method}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="montserrat-medium text-[13px] break-all">
                            {row.payment_option}
                        </span>
                    </div>
                </div>
            );
        case "transaction_status":
            return (
                <div className="flex items-center justify-center">
                    <div
                        className={`w-full max-w-[81px] h-[25px] rounded-[10px] flex items-center justify-center ${
                            row.status === "Failed"
                                ? "bg-red-500"
                                : "bg-custom-solidgreen"
                        }`}
                    >
                        <span className="text-white">{row.status}</span>
                    </div>
                </div>
            );

        case "collection_receipt_link":
            return (
                <div className="flex justify-between w-[139px] montserrat-regular items-center">
                    <div className="flex flex-col">
                        {row.collection_receipt_link ? (
                            <Link
                                to={`/file-viewer/attachment/${row.transaction_id}`}
                                onClick={(e) => {
                                    e.preventDefault();

                                    localStorage.setItem(
                                        "fileUrlPath",
                                        JSON.stringify(
                                            row.collection_receipt_link
                                        )
                                    );
                                    window.open(
                                        `/file-viewer/attachment/${row.transaction_id}`,
                                        "_blank"
                                    );
                                }}
                            >
                                <span className="text-[13px] text-custom-blue underline">
                                    View Receipt
                                </span>
                            </Link>
                        ) : (
                            <span className="montserrat-semibold text-[13px] break-all">
                                To be generated
                            </span>
                        )}
                    </div>
                </div>
            );

        case "destination_bank":
            return (
                <div className="flex montserrat-regular justify-center">
                    <span className="text-[13px]">{row.destination_bank}</span>
                </div>
            );

        default:
            return <span>{row[type]}</span>;
    }
};

export default TransactionTableCell;
