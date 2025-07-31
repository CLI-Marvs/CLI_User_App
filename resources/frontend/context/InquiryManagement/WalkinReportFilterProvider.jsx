import React, { createContext, useContext, useState } from "react";

const DEFAULT_FILTERS = {
    dateFrom: "",
    dateTo: "",
    branch: "all",
    personType: "all",
    sourceType: "all",
    emojiRating: "all",
};

const WalkinReportFilterContext = createContext();

export const WalkinReportFilterProvider = ({ children }) => {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const resetFilters = () => setFilters(DEFAULT_FILTERS);

    return (
        <WalkinReportFilterContext.Provider
            value={{ filters, setFilters, resetFilters }}
        >
            {children}
        </WalkinReportFilterContext.Provider>
    );
};

export const useWalkinReportFilters = () =>
    useContext(WalkinReportFilterContext);
