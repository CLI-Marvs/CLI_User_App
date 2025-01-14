import React, { createContext, useState, useContext } from "react";

export const PaymentSchemeFormDataContext = createContext();
const formDataState = [
    {
        paymentSchemeName: "",
    },
];

const PaymentSchemeFormDataProvider = ({ children }) => {
    const [paymentSchemeFormData, setPaymentSchemeFormData] = useState([
        ...formDataState,
    ]);

    return (
        <PaymentSchemeFormDataContext.Provider
            value={{
                paymentSchemeFormData,
                setPaymentSchemeFormData,
                formDataState,
            }}
        >
            {children}
        </PaymentSchemeFormDataContext.Provider>
    );
};
export default PaymentSchemeFormDataProvider;
export const usePaymentSchemeStateContext = () =>
    useContext(PaymentSchemeFormDataContext);
