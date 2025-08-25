import React from "react";
import moment from "moment";

const formatFiltersLabel = (key, value, filters, type) => {
    let prefix = "";
    if (key === "start_date") {
        const start = moment(value).format("MMMM D, YYYY");
        const end = filters.end_date
            ? moment(filters.end_date).format("MMMM D, YYYY")
            : "";

        prefix = type === "cheque" ? "Check Date Range" : "Date Range";
        return `${prefix}: From ${start} to ${end}`;
    }

    if (key === "printed_start_date") {
        const start = moment(filters.printed_start_date).format("MMMM D, YYYY");
        const end = filters.printed_end_date
            ? moment(filters.printed_end_date).format("MMMM D, YYYY")
            : "";

        prefix = "Printed Date Range";
        return `${prefix}: From ${start} to ${end}`;
    }

    if (key === "check_number_from") {
        const start = filters.check_number_from;
        const end = filters.check_number_to;
        prefix = "Check Number";
        return `${prefix}: From ${start} to ${end}`;
    }

    const formattedKey = key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const displayKey =
        formattedKey === "Payment Option" ? "Payment Method" : formattedKey;

    if (value === "Paymaya" || value === "GCash") {
        return `${displayKey}: Ewallet (${value})`;
    }

    return `${displayKey}: ${value}`;
};
const hiddenKeys = new Set(["end_date", "printed_end_date", "check_number_to"]);

const FilterChips = ({ filters = {}, onRemove, type }) => {
    return (
        <div className="flex flex-wrap px-2 gap-2">
            {Object.entries(filters)
                .filter(([key]) => !hiddenKeys.has(key))
                .map(([key, value]) => (
                    <div
                        key={key}
                        className="flex items-center gap-2 text-white px-2 bg-custom-solidgreen w-auto h-[24px] rounded-[10px] text-sm"
                    >
                        <span>
                            {formatFiltersLabel(key, value, filters, type)}
                        </span>
                        <button
                            onClick={() => onRemove(key)}
                            className="hover:text-red-300"
                        >
                            X
                        </button>
                    </div>
                ))}
        </div>
    );
};

export default FilterChips;
