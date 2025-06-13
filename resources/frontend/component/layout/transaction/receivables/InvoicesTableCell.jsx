import React from "react";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import { Link } from "react-router-dom";

const InvoicesTableCell = ({ type, row }) => {
    switch (type) {
        case "customer_name":
            return (
                <div className="flex flex-col w-[330px]">
                    <span className="montserrat-regular text-[13px]">
                        {toLowerCaseText(row.customer_name)}
                    </span>
                    <span className="montserrat-medium text-[13px]">
                        {row.contract_number}
                    </span>
                </div>
            );
        case "invoice_details":
            return (
                <div className="flex justify-between w-[410px]">
                    <div className="flex flex-col montserrat-regular">
                        <span className="text-[13px]">
                            {row.invoice_amount}
                        </span>
                        <span className="text-xs text-custom-lightgreen">
                            {row.invoice_due_date}
                        </span>
                    </div>
                    <div className="flex flex-col montserrat-regular">
                        <span className="text-[13px]">
                            {row.invoice_number}
                        </span>
                        <span className="text-xs text-custom-lightgreen">
                            {row.invoice_details}
                        </span>
                    </div>
                </div>
            );
        case "invoice_status":
            return (
                <div className={`flex justify-center w-[132px]`}>
                    <div
                        className={`rounded-[10px] w-[100px] h-[20px] justify-center flex items-center ${
                            row.invoice_status === "Cleared"
                                ? "bg-custom-solidgreen"
                                : "bg-red-500"
                        }`}
                    >
                        <span className="text-white text-xs">
                            {row.invoice_status}
                        </span>
                    </div>
                </div>
            );

        case "invoice_link":
            return (
                <div className="flex justify-between w-[139px] montserrat-regular items-center">
                    <div className="flex flex-col">
                        <Link
                            to={`/file-viewer/attachment/${row.id}`}
                            onClick={(e) => {
                                e.preventDefault();

                                localStorage.setItem(
                                    "fileUrlPath",
                                    JSON.stringify(row.invoice_link)
                                );
                                window.open(
                                    `/file-viewer/attachment/${row.id}`,
                                    "_blank"
                                );
                            }}
                        >
                            <span className="text-[13px] text-custom-blue underline">
                                View Sales Invoice
                            </span>
                        </Link>
                    </div>
                </div>
            );
        case "soa_link":
            return (
                <div className="flex justify-between w-[139px] montserrat-regular items-center">
                    <div className="flex flex-col">
                        <Link
                            to={`/file-viewer/attachment/${row.id}`}
                            onClick={(e) => {
                                e.preventDefault();

                                localStorage.setItem(
                                    "fileUrlPath",
                                    JSON.stringify(row.soa_link)
                                );
                                window.open(
                                    `/file-viewer/attachment/${row.id}`,
                                    "_blank"
                                );
                            }}
                        >
                            <span className="text-[13px] text-custom-blue underline">
                                View SOA
                            </span>
                        </Link>
                    </div>
                </div>
            );
        default:
            return <span>{row[type]}</span>;
    }
};

export default InvoicesTableCell;
