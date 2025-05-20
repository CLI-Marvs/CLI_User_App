import moment from "moment";
import React from "react";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import { Link } from "react-router-dom";

const TransactionTableCell = ({ type, row }) => {
    switch (type) {
        case "transaction_date":
            return (
                <div className="w-[150px]">
                    <span className="montserrat-medium text-[13px]">
                        {moment(
                            `${row.transaction_date} ${row.transaction_time}`
                        ).format("LLL")}
                    </span>
                </div>
            );
        case "transaction":
            return (
                <div className="flex flex-col w-[350px] space-y-1">
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
                            Request ID:
                        </span>
                        <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                            {row.payment_method_transaction_id}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="monterrat-regular text-[14px] break-all whitespace-normal overflow-hidden">
                            Response ID:
                        </span>
                        <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                            {row.processor_response_id}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="monterrat-regular text-[14px] break-all whitespace-normal overflow-hidden">
                            Method:
                        </span>
                        <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                            Online,{row.payment_option}
                        </span>
                    </div>
                </div>
            );

        case "details":
            return (
                <div className="flex flex-col w-[350px] space-y-1">
                    <div className="flex flex-col montserrat-regular">
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[13px]">
                                Transaction Type:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all">
                                {row.transaction_type}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-1 montserrat-regular gap-2">
                        <span className="monterrat-regular text-[13px]">
                            Property:
                        </span>
                        <span className="text-[13px] montserrat-semibold">
                            {toLowerCaseText(row.property_name)}
                        </span>
                        {/*  <span className="text-xs text-custom-lightgreen break-all">
                            {row.remarks}
                        </span> */}
                    </div>
                    <div className="flex flex-col montserrat-regular">
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[13px]">
                                Contract No.:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all">
                                {row.reference_number}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col montserrat-regular">
                        <div className="flex gap-2">
                            <span className="monterrat-regular text-[13px]">
                                Email:
                            </span>
                            <span className="montserrat-semibold text-[13px] break-all">
                                {row.email}
                            </span>
                        </div>
                    </div>
                </div>
            );
        case "amount":
            return (
                <div className="flex flex-col montserrat-regular justify-center w-[330px]">
                    {row.payment_option === "Credit/Debit Card" ? (
                        <div className="flex flex-col text-[13px]">
                            <div className="mt-1 text-gray-700 flex flex-col">
                                <div className="flex justify-between">
                                    <span>Bill:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(row.amount).toLocaleString(
                                            "en-PH",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>MDR Amount:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(row.mdr).toLocaleString(
                                            "en-PH",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Creditable Withholding Tax:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(
                                            row.withholding_tax
                                        ).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Bank Recon Amount:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(
                                            row.bank_recon_amount
                                        ).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Gateway Fee:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(
                                            row.gateway_fee
                                        ).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Net Posting Amount:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(
                                            row.net_posting_amount
                                        ).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Total Amount:</span>
                                <span>
                                    PHP{" "}
                                    {(
                                        parseFloat(row.amount) +
                                        parseFloat(row.convenience_fee)
                                    ).toLocaleString("en-PH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col text-[13px]">
                            <div className="mt-1 text-gray-700 flex flex-col">
                                <div className="flex justify-between">
                                    <span>Payment Amount:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(row.amount).toLocaleString(
                                            "en-PH",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>CLI Markup:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(
                                            row.cli_markup
                                        ).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Bank Fee:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(
                                            row.bank_fee
                                        ).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Paynamics Fee:</span>
                                    <span>
                                        Php{" "}
                                        {parseFloat(
                                            row.paynamics_fee
                                        ).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Total Amount:</span>
                                <span>
                                    Php{" "}
                                    {(
                                        parseFloat(row.amount) +
                                        parseFloat(row.bank_fee) +
                                        parseFloat(row.paynamics_fee) +
                                        parseFloat(row.cli_markup)
                                    ).toLocaleString("en-PH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            );
        case "transaction_status":
            return (
                <div className="flex items-center justify-center w-[100px]">
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
