import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";

const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (value) =>
    safeParseFloat(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const SimpleViewCell = ({ type, row }) => {
    const isCard = row.payment_option === "Credit/Debit Card";
    
    return <span className="montserrat-regular text-[13px] break-all">{row[type]}</span>;


   /*  switch (type) {
        case "transaction_date":
            return (
                <div className="w-[150px]">
                    <span className="montserrat-medium text-[13px]">
                        {moment(`${row.transaction_date} ${row.transaction_time}`).format("LLL")}
                    </span>
                </div>
            );

        case "total_amount":
            const totalAmount = isCard
                ? safeParseFloat(row.amount) + safeParseFloat(row.convenience_fee)
                : safeParseFloat(row.amount) +
                  safeParseFloat(row.bank_fee) +
                  safeParseFloat(row.paynamics_fee) +
                  safeParseFloat(row.cli_markup);

            return (
                <div className="w-[150px] montserrat-medium text-[13px]">
                    <span>Php {formatCurrency(totalAmount)}</span>
                </div>
            );

        case "gateway_fee":
            const fee = isCard ? row.gateway_fee : row.paynamics_fee;
            return (
                <div className="w-[150px] montserrat-medium text-[13px]">
                    <span>Php {formatCurrency(fee)}</span>
                </div>
            );

        default:
            if (type === "transaction_number") {
                return (
                    <span className="montserrat-medium text-[13px]">
                        {row.transaction_number}
                    </span>
                );
            }

            return (
                <span className="montserrat-medium text-[13px]">
                    PHP {formatCurrency(row[type])}
                </span>
            );
    } */
};

export default SimpleViewCell;
