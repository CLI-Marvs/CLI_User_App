import React, { createContext, useState,useContext } from "react";
export const PriceBasicDetailFormDataContext = createContext();
const formDataState = {
    basePrice: "",
    transferCharge: 8 || "",
    effectiveBalconyBase: 50 || "",
    vat: 12 || "",
    vatableListPrice: 3600000 || "",
    reservationFee: "",
};
const PriceBasicDetailsFormDataProvider = ({ children }) => {
    const [priceBasicDetailsFormData, setPriceBasicDetailsFormData] =
        useState(formDataState);

    return (
        <PriceBasicDetailFormDataContext.Provider
            value={{
                priceBasicDetailsFormData,
                setPriceBasicDetailsFormData,
                formDataState,
            }}
        >
            {children}
        </PriceBasicDetailFormDataContext.Provider>
    );
};
export default PriceBasicDetailsFormDataProvider;
export  const usePriceBasicDetailStateContext = () =>
    useContext(PriceBasicDetailFormDataContext);
