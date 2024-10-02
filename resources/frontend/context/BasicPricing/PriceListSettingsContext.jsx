import React, { createContext, useState,useContext } from "react";
export const PriceListSettingFormDataContext = createContext();
const formDataState = {
    basePrice: "",
    transferCharge: 8 || "",
    effectiveBalconyBase: 50 || "",
    vat: 12 || "",
    vatableListPrice: 3600000 || "",
    reservationFee: "",
};
const PriceListSettingFormDataProvider = ({ children }) => {
    const [priceListSettingformData, setPriceListSettingformData] =
        useState(formDataState);

    return (
        <PriceListSettingFormDataContext.Provider
            value={{ priceListSettingformData, setPriceListSettingformData,formDataState }}
        >
            {children}
        </PriceListSettingFormDataContext.Provider>
    );
};
export default PriceListSettingFormDataProvider;
export   const usePriceListStateContext = () =>
    useContext(PriceListSettingFormDataContext);
