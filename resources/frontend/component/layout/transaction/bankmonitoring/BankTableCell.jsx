import React from "react";

const BankTableCell = ({ type, row }) => {
    switch (type) {
        case "bank_name":
            return (
                <div className="flex justify-between w-[410px]">
                    <div className="flex flex-col">
                        <span className="text-xs montserrat-regular">
                            {row.bank_name}
                        </span>
                        <span className="text-xs montserrat-medium">
                            {row.account_number}
                        </span>
                    </div>
                    <div className="bg-[#B9B9B9] rounded-[10px] w-[93px] h-[20px] flex justify-center items-center">
                        <span className="text-white montserrat-regular">
                            {row.transaction_number}
                        </span>
                    </div>
                </div>
            );
        case "transaction_details":
            return (
                <div className="flex justify-between w-[410px] montserrat-regular items-center">
                    <div className="flex flex-col">
                        <span className="text-xs">{row.account_number}</span>
                        <span className="text-xs text-custom-lightgreen">
                            {row.transaction_code}
                        </span>
                    </div>
                    <span className="text-xs text-custom-gray">
                        {row.reference_number}
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs">{row.transaction_code}</span>
                        <span className="text-xs text-custom-lightgreen">
                            {row.transaction_details}
                        </span>
                    </div>
                </div>
            );
        case "credit":
            return (
                <div className="flex justify-center">
                    <span className="montserrat-medium text-sm text-custom-solidgreen">
                        {row.credit}
                    </span>
                </div>
            );
        case "debit":
            return (
                <div className="flex justify-center">
                    <span className="montserrat-medium text-sm text-custom-solidgreen">
                        {row.debit}
                    </span>
                </div>
            );

        case "running_balance":
            return (
                <div className="flex justify-center">
                    <span className="montserrat-medium text-sm text-custom-solidgreen">
                        {row.running_balance}
                    </span>
                </div>
            );

            case "status":
            return (
                <div className={`flex justify-center w-[86px] rounded-[10px] montserrat-regular ${row.status === "Posted" ? "bg-custom-solidgreen" : "bg-[#E7DB56]"}`}>
                    <span className="montserrat-medium text-xs text-white">
                        {row.status}
                    </span>
                </div>
            );
        default:
            return <span>{row[type]}</span>;
    }
};

export default BankTableCell;
