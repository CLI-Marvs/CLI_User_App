import React from "react";

const PostingTableCell = ({ type, row }) => {
    const dynamicStyle = (item) =>
        item === "Floating"
            ? "bg-[#FFC400]"
            : item === "Posted"
            ? "bg-[#1A73E8]"
            : "bg-[#348017]";
 
    switch (type) {
        case "transaction_date":
            return (
                <div className="w-[200px]">
                    <span className="montserrat-medium text-[13px]">
                        {moment(row.transaction_date).format("LLL")}
                    </span>
                </div>
            );
        case "transaction":
            return (
                <div className="flex justify-between w-[400px]">
                    <div className="flex flex-col">
                        <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                            {row.payment_method_transaction_id}
                        </span>
                        <span className="montserrat-medium text-[13px] break-all whitespace-normal overflow-hidden">
                            {row.reference_number}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="montserrat-medium text-[13px] break-all whitespace-normal overflow-hidden">
                            {row.transaction_type}
                        </span>
                    </div>
                </div>
            );

        case "details":
            return (
                <div className="flex gap-8 items-center w-[370px]">
                    <div className="flex flex-col flex-1 montserrat-regular">
                        <span className="text-[13px]">Rodfil T. Tayong</span>
                        <span className="text-xs text-custom-lightgreen">
                            {row.email}
                        </span>
                    </div>
                    <div className="flex flex-col flex-1 montserrat-regular">
                        <span className="text-[13px]">{row.property_name}</span>
                        <span className="text-xs text-custom-lightgreen">
                            {row.remarks}
                        </span>
                    </div>
                </div>
            );
        case "amount":
            return (
                <div className="flex montserrat-regular justify-center">
                    <span className="text-[13px]">{row.amount}</span>
                </div>
            );
        case "payment_method":
            return (
                <div className="flex justify-between w-[400px]">
                    <div className="flex flex-col">
                        <span className="montserrat-semibold text-[13px] break-all whitespace-normal overflow-hidden">
                            {row.payment_method}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="montserrat-medium text-[13px] break-all whitespace-normal overflow-hidden">
                            {row.payment_option}
                        </span>
                    </div>
                </div>
            );
        case "status":
            return (
                <div className="flex items-center justify-center">
                    <div
                        className={`w-full max-w-[81px] h-[25px] rounded-[10px] flex items-center justify-center ${dynamicStyle(
                            row.status
                        )}`}
                    >
                        <span className="text-white">{row.status}</span>
                    </div>
                </div>
            );

        case "collection_receipt_link":
            return (
                <div className="flex justify-between w-[139px] montserrat-regular items-center">
                    <div className="flex flex-col">
                        <span className="text-[13px] text-custom-blue underline">
                            View Receipt
                        </span>
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

export default PostingTableCell;
