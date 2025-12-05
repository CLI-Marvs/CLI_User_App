import React from "react";

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
    const isEwallet = ["GCash", "Paymaya"].includes(row.payment_option);

    if (type === "gateway_fee") {
        const value = isEwallet ? row.paynamics_fee : row.gateway_fee;
        return (
            <span className="montserrat-regular text-[13px] break-all">
                {value}
            </span>
        );
    }

    if (type === "total_amount") {
        const amount = safeParseFloat(row.amount);
        const additional = isEwallet
            ? safeParseFloat(row.bank_fee) +
              safeParseFloat(row.paynamics_fee) +
              safeParseFloat(row.cli_markup)
            : safeParseFloat(row.convenience_fee);

        return (
            <span className="montserrat-regular text-[13px] break-all">
                Php {formatCurrency(amount + additional)}
            </span>
        );
    }

    if (type === "status") {
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
    }

    return (
        <span className="montserrat-regular text-[13px] break-all">
            {row[type]}
        </span>
    );
};

export default SimpleViewCell;
